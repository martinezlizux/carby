import { supabase } from './supabase';

export const searchOpenFoodFacts = async (foodName) => {
    try {
        const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(foodName)}&search_simple=1&action=process&json=1&page_size=1`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.products && data.products.length > 0) {
            const product = data.products[0];
            const carbs = product.nutriments?.carbohydrates_100g ?? null;
            const calories = product.nutriments?.['energy-kcal_100g'] ?? 0;

            if (carbs !== null && carbs !== undefined) {
                return {
                    food_name: product.product_name || foodName,
                    carbs: carbs,
                    calories: calories,
                    explanation: 'Información obtenida de Open Food Facts. (Porción aproximada: 100g)'
                };
            }
        }
        return null;
    } catch (e) {
        console.error('DEBUG: Open Food Facts Error:', e);
        return null;
    }
};

export const searchUSDA = async (foodName) => {
    const apiKey = import.meta.env.VITE_USDA_API_KEY || 'DEMO_KEY';
    try {
        const url = `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${apiKey}&query=${encodeURIComponent(foodName)}&pageSize=1`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.foods && data.foods.length > 0) {
            const food = data.foods[0];
            const carbNutrient = food.foodNutrients.find(n => n.nutrientId === 1005 || (n.nutrientName && n.nutrientName.toLowerCase().includes('carbohydrate')));
            const calNutrient = food.foodNutrients.find(n => n.nutrientId === 1008 || (n.nutrientName && n.nutrientName.toLowerCase().includes('energy')));

            if (carbNutrient) {
                return {
                    food_name: food.description,
                    carbs: carbNutrient.value,
                    calories: calNutrient ? calNutrient.value : 0,
                    explanation: 'Información obtenida de USDA FoodData Central. (Porción típica)'
                };
            }
        }
        return null;
    } catch (e) {
        console.error('DEBUG: USDA Error:', e);
        return null;
    }
};

export const fetchProductByBarcode = async (barcode) => {
    try {
        // 1. Check Supabase Cache
        const { data: cachedProduct, error: cacheError } = await supabase
            .from('scanned_products')
            .select('*')
            .eq('barcode', barcode)
            .single();

        if (cachedProduct && !cacheError) {
            console.log('Product found in cache/DB');
            return cachedProduct;
        }

        // 2. Fetch from Open Food Facts if not in cache
        const url = `https://world.openfoodfacts.org/api/v0/product/${encodeURIComponent(barcode)}.json`;
        const res = await fetch(url);
        const data = await res.json();

        if (data && data.status === 1 && data.product) {
            const product = data.product;
            const newProductData = {
                barcode: barcode,
                food_name: product.product_name || 'Desconocido',
                brands: product.brands || '',
                calories: product.nutriments?.['energy-kcal_100g'] ?? 0,
                carbs: product.nutriments?.carbohydrates_100g ?? 0,
                proteins: product.nutriments?.proteins_100g ?? 0,
                fat: product.nutriments?.fat_100g ?? 0,
                sugars: product.nutriments?.sugars_100g ?? 0,
            };

            // 3. Save to Supabase (ignore errors if it fails to cache to avoid breaking the UI)
            await supabase.from('scanned_products').insert([newProductData]).catch(e => console.error('Cache save error', e));

            return newProductData;
        }

        return null;
    } catch (error) {
        console.error('Error fetching product by barcode:', error);
        return null;
    }
};
