async function test() {
    try {
        const url = "https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=8.5241&lon=76.9366&zoom=18&addressdetails=1";
        const response = await fetch(url);
        console.log("Status:", response.status);
        console.log("Headers:", response.headers);
        const data = await response.text();
        console.log("Data:", data.substring(0, 500));
    } catch (e) {
        console.error(e);
    }
}
test();
