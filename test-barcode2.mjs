async function testOff(barcode) {
    let offUrl = `https://world.openfoodfacts.org/api/v2/product/${barcode}.json`;
    let res = await fetch(offUrl);
    let data = await res.json();
    return data?.product?.product_name || null;
}

const barcodes = [
    '096619839329',
    '196619839329',
    '096633839329',
    '196633839329',
    '0096633839329', // EAN-13 equivalent
    '096619181046'   // Known Kirkland Applesauce
];

for (let b of barcodes) {
    let name = await testOff(b);
    console.log(b, "->", name);
}
