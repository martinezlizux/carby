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
        const tryFetchOFF = async (bc) => {
            try {
                const url = `https://world.openfoodfacts.org/api/v0/product/${encodeURIComponent(bc)}.json`;
                const res = await fetch(url);
                const data = await res.json();
                if (data && data.status === 1 && data.product) {
                    return data.product;
                }
            } catch (e) { /* ignore */ }
            return null;
        };

        // Variantes de código de barras a intentar para mitigar errores del scanner
        const variants = [
            barcode,
            barcode.length === 12 && barcode.startsWith('0') ? '1' + barcode.substring(1) : null, // Scanner leyó 0 en lugar de 1
            barcode.length === 11 ? '0' + barcode : null,                                          // Scanner omitió el 0
            barcode.length === 11 ? '1' + barcode : null,                                          // Scanner omitió el 1
            barcode.length === 12 ? '0' + barcode : null,                                          // Convertir a EAN-13
            barcode.startsWith('0') ? barcode.substring(1) : null                                  // Scanner agregó 0 extra
        ].filter(Boolean); // Quitar nulls

        let product = null;
        let finalBarcode = barcode;

        for (const variant of variants) {
            product = await tryFetchOFF(variant);
            if (product) {
                finalBarcode = variant;
                break;
            }
        }

        if (product) {
            const newProductData = {
                barcode: finalBarcode, // Podría ser la variante reparada
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

        // 3. Fallback: Fetch from USDA if Open Food Facts fails
        const apiKey = import.meta.env.VITE_USDA_API_KEY || 'DEMO_KEY';
        let usdaData = null;
        try {
            let usdaUrl = `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${apiKey}&query=${encodeURIComponent(barcode)}&pageSize=1`;
            let usdaRes = await fetch(usdaUrl);
            usdaData = await usdaRes.json();

            // Intento 2.1: Muchos códigos USA vienen escaneados en formato EAN-13 (con un cero inicial). USDA guarda los UPC de 12.
            if ((!usdaData.foods || usdaData.foods.length === 0) && barcode.length > 11 && barcode.startsWith('0')) {
                const altBarcode = barcode.substring(1);
                usdaUrl = `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${apiKey}&query=${encodeURIComponent(altBarcode)}&pageSize=1`;
                usdaRes = await fetch(usdaUrl);
                usdaData = await usdaRes.json();
            }
        } catch (e) { console.error('USDA search err', e); }

        if (usdaData && usdaData.foods && usdaData.foods.length > 0) {
            const food = usdaData.foods[0];
            const carbNutrient = food.foodNutrients.find(n => n.nutrientId === 1005 || (n.nutrientName && n.nutrientName.toLowerCase().includes('carbohydrate')));
            const calNutrient = food.foodNutrients.find(n => n.nutrientId === 1008 || (n.nutrientName && n.nutrientName.toLowerCase().includes('energy')));
            const proteinNutrient = food.foodNutrients.find(n => n.nutrientId === 1003 || (n.nutrientName && n.nutrientName.toLowerCase().includes('protein')));
            const fatNutrient = food.foodNutrients.find(n => n.nutrientId === 1004 || (n.nutrientName && n.nutrientName.toLowerCase().includes('lipid')));
            const sugarNutrient = food.foodNutrients.find(n => n.nutrientId === 2000 || (n.nutrientName && n.nutrientName.toLowerCase().includes('sugar')));

            const newProductData = {
                barcode: barcode,
                food_name: food.description || 'Desconocido',
                brands: food.brandOwner || '',
                calories: calNutrient ? calNutrient.value : 0,
                carbs: carbNutrient ? carbNutrient.value : 0,
                proteins: proteinNutrient ? proteinNutrient.value : 0,
                fat: fatNutrient ? fatNutrient.value : 0,
                sugars: sugarNutrient ? sugarNutrient.value : 0,
            };

            await supabase.from('scanned_products').insert([newProductData]).catch(e => console.error('Cache save error', e));
            return newProductData;
        }

        // 4. Fallback Extremo: Usar UPCitemdb para sacar el "Nombre" del producto con el código de barras, y buscar ese nombre de texto en texto en USDA
        try {
            // UPCitemdb requiere 12 dígitos, así que si empieza con 0 suele requerir quitárselo
            const parsedUpc = (barcode.length > 11 && barcode.startsWith('0')) ? barcode.substring(1) : barcode;
            const upcUrl = `https://api.upcitemdb.com/prod/trial/lookup?upc=${encodeURIComponent(parsedUpc)}`;
            const upcRes = await fetch(upcUrl);
            const upcData = await upcRes.json();

            if (upcData && upcData.items && upcData.items.length > 0) {
                let upcTitle = upcData.items[0].title;
                if (upcTitle) {
                    // Limpiamos un poco el titulo para USDA
                    upcTitle = upcTitle.split(',')[0].substring(0, 30);
                    const usdaFallback = await searchUSDA(upcTitle);
                    if (usdaFallback) {
                        const newProductData = {
                            barcode: barcode,
                            brands: upcData.items[0].brand || '',
                            ...usdaFallback
                        };
                        await supabase.from('scanned_products').insert([newProductData]).catch(e => console.error('Cache save error', e));
                        return newProductData;
                    } else {
                        // Al menos devolvemos el título, marca y 0 carbs en lugar de lanzar "NotFound" para que puedan guardarlo manualmente
                        return { barcode, food_name: upcTitle, brands: upcData.items[0].brand || '', calories: 0, carbs: 0, proteins: 0, fat: 0, sugars: 0 };
                    }
                }
            }
        } catch (e) { console.error('UPCitemdb fallback error', e); }

        return null;
    } catch (error) {
        console.error('Error fetching product by barcode:', error);
        return null;
    }
};
