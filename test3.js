async function testOff(barcode) {
    try {
        let offUrl = `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`;
        let res = await fetch(offUrl);
        let data = await res.json();
        return data?.product?.product_name || null;
    } catch(e) {
        return "ERROR";
    }
}

async function run() {
    const barcodes = [
        '096619839329',
        '196619839329',
        '096633839329',
        '196633839329',
        '0096633839329',
        '096619181046'
    ];

    for (let b of barcodes) {
        let name = await testOff(b);
        console.log(b, "->", name);
    }
}

run();
