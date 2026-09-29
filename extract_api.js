const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    console.log('Launching browser...');
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    
    const apiSpecs = {};

    page.on('response', async (response) => {
        const url = response.url();
        // The Developer portal fetches the operations details in JSON format
        if (url.includes('/apis/flightinfov2') && url.includes('operations')) {
            console.log('Found Operations URL:', url);
            try {
                const text = await response.text();
                apiSpecs['operations'] = JSON.parse(text);
            } catch (e) {
                console.log('Error parsing response:', e.message);
            }
        }
        else if (url.includes('/apis/flightinfov2') && !url.includes('operations')) {
            console.log('Found API metadata URL:', url);
            try {
                const text = await response.text();
                apiSpecs['metadata'] = JSON.parse(text);
            } catch (e) {
                // might not be json
            }
        }
    });

    console.log('Navigating to Developer Portal...');
    await page.goto('https://apideveloper.swedavia.se/api-details#api=flightinfov2&operation=637662e4f34e5921a8df2a26', {
        waitUntil: 'networkidle0',
        timeout: 30000
    });
    
    // Sometimes it takes an extra moment for the operations to load
    await new Promise(r => setTimeout(r, 5000));

    console.log('Extracting data...');
    fs.writeFileSync('flightinfov2_spec.json', JSON.stringify(apiSpecs, null, 2));
    console.log('Saved to flightinfov2_spec.json');

    await browser.close();
})();
