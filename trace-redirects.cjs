const puppeteer = require('puppeteer');

(async () => {
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        page.on('response', response => {
            if ([301, 302, 303, 307, 308].includes(response.status())) {
                console.log('Redirect detected:', response.url(), '->', response.headers()['location']);
            }
        });

        await page.goto('https://i-amraj.github.io/animated_portFolio/', { waitUntil: 'networkidle2' });

        const finalUrl = page.url();
        console.log('Final URL:', finalUrl);

        await browser.close();
    } catch (e) {
        console.error(e);
    }
})();
