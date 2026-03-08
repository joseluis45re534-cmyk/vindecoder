const user = process.env.CAR_REG_API_USER;
const pass = process.env.CAR_REG_API_PASS;
const vin = '6G1FE4EW7GL232440';

const url = `https://www.carregistrationapi.com/api/reg.asmx/CheckAustralia?RegistrationNumber=${encodeURIComponent(vin)}&State=NSW&username=${encodeURIComponent(user)}&password=${encodeURIComponent(pass)}`;

async function test() {
    try {
        console.log('Fetching:', url.replace(pass, '***').replace(user, '***'));
        const response = await fetch(url);
        const text = await response.text();
        if (!response.ok) {
            console.error(`Error: ${response.status}`);
            console.error(text);
            return;
        }
        console.log('Raw XML Response:');
        console.log(text);

        const jsonMatch = text.match(/<vehicleJson>([\s\S]*?)<\/vehicleJson>/);
        if (jsonMatch && jsonMatch[1]) {
            console.log('\nExtracted JSON:');
            console.log(JSON.parse(jsonMatch[1]));
        } else {
            console.log('\nNo <vehicleJson> block found in response.');
        }
    } catch (e) {
        console.error(e);
    }
}

test();
