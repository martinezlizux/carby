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
        console.log(`Buscando producto con código: ${barcode}`);

        // Helper para Timeout
        const fetchWithTimeout = async (url, options = {}, timeout = 8000) => {
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), timeout);
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });
            clearTimeout(id);
            return response;
        };

        // 1. Check Supabase Cache (con timeout rudimentario usando Promise.race)
        const cachePromise = supabase
            .from('scanned_products')
            .select('*')
            .eq('barcode', barcode)
            .single();

        const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('Cache timeout')), 3000));

        try {
            const { data: cachedProduct, error: cacheError } = await Promise.race([cachePromise, timeoutPromise]);
            if (cachedProduct && !cacheError) {
                console.log('Producto encontrado en cache/DB');
                return cachedProduct;
            }
        } catch (e) {
            console.warn('Cache check omitido por error/timeout:', e.message);
        }

        // 2. Fetch from Open Food Facts if not in cache
        const tryFetchOFF = async (bc) => {
            try {
                // "world" busca en global, por lo que incluye EU y MX.
                const url = `https://world.openfoodfacts.org/api/v0/product/${encodeURIComponent(bc)}.json`;
                const res = await fetchWithTimeout(url, {}, 5000); // 5 segundos
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

        // Lanzar todas las peticiones a OFF en paralelo para no hacer esperar al usuario
        const offResults = await Promise.all(variants.map(async (v) => {
            const p = await tryFetchOFF(v);
            return p ? { p, v } : null;
        }));

        const validOff = offResults.find(res => res !== null);

        if (validOff) {
            product = validOff.p;
            finalBarcode = validOff.v;
        }

        if (product) {
            const newProductData = {
                barcode: finalBarcode,
                food_name: product.product_name || 'Desconocido',
                brands: product.brands || '',
                calories: product.nutriments?.['energy-kcal_100g'] ?? 0,
                carbs: product.nutriments?.carbohydrates_100g ?? 0,
                proteins: product.nutriments?.proteins_100g ?? 0,
                fat: product.nutriments?.fat_100g ?? 0,
                sugars: product.nutriments?.sugars_100g ?? 0,
            };

            // 3. Save to Supabase (Fire and forget, para no bloquear la UI si supabase es lento)
            supabase.from('scanned_products').insert([newProductData]).catch(e => console.error('Cache save error', e));

            return newProductData;
        }

        // 3. Fallback: Fetch from USDA (FoodData Central) if OFF fails
        const apiKey = import.meta.env.VITE_USDA_API_KEY || 'DEMO_KEY';
        let usdaData = null;
        try {
            let usdaUrl = `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${apiKey}&query=${encodeURIComponent(barcode)}&pageSize=1`;
            let usdaRes = await fetchWithTimeout(usdaUrl, {}, 6000);
            usdaData = await usdaRes.json();

            // Intento 2.1: Muchos códigos US (UPC-A, 12 digitos) vienen escaneados en formato EAN-13 (con un cero inicial).
            if ((!usdaData.foods || usdaData.foods.length === 0) && barcode.length > 11 && barcode.startsWith('0')) {
                const altBarcode = barcode.substring(1);
                usdaUrl = `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${apiKey}&query=${encodeURIComponent(altBarcode)}&pageSize=1`;
                usdaRes = await fetchWithTimeout(usdaUrl, {}, 6000);
                usdaData = await usdaRes.json();
            }
        } catch (e) {
            console.warn('USDA search timeout o error', e.message);
        }

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

            supabase.from('scanned_products').insert([newProductData]).catch(e => console.error('Cache save error', e));
            return newProductData;
        }

        // 4. Fallback Extremo: Usar UPCitemdb para sacar el "Nombre", y buscar ese nombre en USDA
        try {
            const parsedUpc = (barcode.length > 11 && barcode.startsWith('0')) ? barcode.substring(1) : barcode;
            const upcUrl = `https://api.upcitemdb.com/prod/trial/lookup?upc=${encodeURIComponent(parsedUpc)}`;
            // UPCitemDB es la más lenta a veces
            const upcRes = await fetchWithTimeout(upcUrl, {}, 6000);
            const upcData = await upcRes.json();

            if (upcData && upcData.items && upcData.items.length > 0) {
                let upcTitle = upcData.items[0].title;
                if (upcTitle) {
                    upcTitle = upcTitle.split(',')[0].substring(0, 30);
                    const usdaFallback = await searchUSDA(upcTitle);
                    if (usdaFallback) {
                        const newProductData = {
                            barcode: barcode,
                            brands: upcData.items[0].brand || '',
                            ...usdaFallback
                        };
                        supabase.from('scanned_products').insert([newProductData]).catch(e => console.error('Cache save error', e));
                        return newProductData;
                    } else {
                        return { barcode, food_name: upcTitle, brands: upcData.items[0].brand || '', calories: 0, carbs: 0, proteins: 0, fat: 0, sugars: 0 };
                    }
                }
            }
        } catch (e) {
            console.warn('UPCitemdb fallback error o timeout', e.message);
        }

        return null;
    } catch (error) {
        console.error('Error fetching product by barcode:', error);
        return null;
    }
};
