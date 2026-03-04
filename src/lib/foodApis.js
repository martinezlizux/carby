export const searchOpenFoodFacts = async (foodName) => {
    try {
        const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(foodName)}&search_simple=1&action=process&json=1&page_size=1`;
        const res = await fetch(url);
        const data = await res.json();

        if (data.products && data.products.length > 0) {
            const product = data.products[0];
            const carbs = product.nutriments ? product.nutriments.carbohydrates_100g : null;

            if (carbs !== undefined && carbs !== null) {
                return {
                    food_name: product.product_name || foodName,
                    carbs: carbs,
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

            if (carbNutrient) {
                return {
                    food_name: food.description,
                    carbs: carbNutrient.value,
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
