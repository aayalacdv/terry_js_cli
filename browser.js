import puppeteer from 'puppeteer'; 

export async function connectToBrowser(){
	let browser;
	const connUrl = 'http://localhost:9222';

	try {
	    console.log("Opening the browser......");
	    browser = await puppeteer.connect({
			browserURL: connUrl,
			defaultViewport: null
	    });
	} catch (err) {
	    console.log("Could not create a browser instance => : ", err);
	}
	return browser;
}