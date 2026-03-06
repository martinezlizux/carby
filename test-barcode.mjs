async function test(barcode) {
    console.log("Testing barcode:", barcode);
    try {
        let offUrl = `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`;
        let res = await fetch(offUrl);
        let data = await res.json();
        console.log("OFF:", data?.product?.product_name || data.status_verbose);
    } catch(e) {}
    
    try {
        let apiKey = 'DEMO_KEY';
        let usdaUrl = `https://api.nal.usda.gov/fdc/v1/foods/search?api_key=${apiKey}&query=${encodeURIComponent(barcode)}&pageSize=1`;
        let res = await fetch(usdaUrl);
        let data = await res.json();
        if (data && data.foods && data.foods[0]) {
           console.log("USDA:", data.foods[0].description);
        } else {
           console.log("USDA: Not found");
        }
    } catch(e) {}
    
    try {
        let parsedUpc = (barcode.length > 11 && barcode.startsWith('0')) ? barcode.substring(1) : barcode;
        const upcUrl = `https://api.upcitemdb.com/prod/trial/lookup?upc=${encodeURIComponent(parsedUpc)}`;
        const upcRes = await fetch(upcUrl);
        const upcData = await upcRes.json();
        if (upcData && upcData.items && upcData.items.length > 0) {
            console.log("UPCITEMDB:", upcData.items[0].title);
        } else {
            console.log("UPCITEMDB: Not found");
        }
    } catch(e) {}
    console.log("---");
}

await test('096619839329');
await test('096633839329');
await test('196633839329');
