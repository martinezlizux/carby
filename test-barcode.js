const fetch = require('node-fetch');

async function test(barcode) {
    console.log("Testing barcode:", barcode);
    let offUrl = `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`;
    let res = await fetch(offUrl);
    let data = await res.json();
    console.log("OFF:", data.status_verbose);

    let apiKey = 'DEMO_KEY';
    let usdaUrl = `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${apiKey}&query=${encodeURIComponent(barcode)}&pageSize=1`;
    res = await fetch(usdaUrl);
    data = await res.json();
    if (data.foods && data.foods[0]) {
       console.log("USDA:", data.foods[0].description);
    } else {
       console.log("USDA: Not found");
    }
}

test('096619839329');
test('196619839329');
test('096619838329');
test('096619839328');
