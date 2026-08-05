const { chromium } = require('playwright');

(async () => {
  console.log("Launching browser...");
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  
  console.log("Navigating to page...");
  await page.goto('https://friends-a5a0c.firebaseapp.com/ReadingCoach/2_20.html', { waitUntil: 'networkidle' });
  
  console.log("Waiting for giscus iframe...");
  const giscusFrameElement = await page.waitForSelector('iframe.giscus-frame');
  const giscusFrame = await giscusFrameElement.contentFrame();
  
  if (giscusFrame) {
      console.log("Successfully entered the giscus iframe. Waiting for comments to load...");
      // Wait for the main comment container to appear
      await giscusFrame.waitForSelector('.giscus-comment', { timeout: 15000 }).catch(() => console.log("No comments found or timeout."));
      
      console.log("--- Extracting text from the discussion board ---");
      const textContent = await giscusFrame.evaluate(() => {
          // Extract text from the body to see what is visible
          return document.body.innerText;
      });
      console.log(textContent);
      console.log("-------------------------------------------------");
  } else {
      console.log("Could not find giscus iframe content.");
  }
  
  await browser.close();
  console.log("Done.");
})();
