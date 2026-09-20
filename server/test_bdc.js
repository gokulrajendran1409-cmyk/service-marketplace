async function test() {
    try {
        const url = "https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=8.5241&longitude=76.9366&localityLanguage=en";
        const response = await fetch(url);
        console.log("Status:", response.status);
        const data = await response.json();
        console.log("Data:", JSON.stringify(data, null, 2));
    } catch (e) {
        console.error(e);
    }
}
test();
