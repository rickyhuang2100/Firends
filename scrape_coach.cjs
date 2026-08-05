const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  console.log('Launching browser...');
  const userDataDir = './.playwright_coach_profile';
  const browser = await chromium.launchPersistentContext(userDataDir, {
    headless: false,
    viewport: null
  });

  const page = await browser.newPage();
  console.log('Navigating to Reading Coach...');
  await page.goto('https://coach.microsoft.com/webapp/ReadPassage');

  console.log('====================================================');
  console.log('ACTION REQUIRED:');
  console.log('1. Log in to Microsoft Reading Coach.');
  console.log('2. Go to Level 7 and open the first passage.');
  console.log('3. Wait here until you receive the signal to extract.');
  console.log('====================================================');

  // Wait for newline from stdin
  await new Promise(resolve => {
    process.stdin.once('data', () => resolve());
  });

  console.log('Extracting text from page...');
  
  const data = await page.evaluate(() => {
    let title = document.querySelector('h1, h2, [role="heading"]')?.innerText || 'Untitled Passage';
    
    // Attempt to extract reading text. 
    // We get all spans and paragraphs that have meaningful length.
    let textNodes = Array.from(document.querySelectorAll('p, span, div[role="article"]'));
    let lines = [];
    textNodes.forEach(node => {
      // get text but avoid grabbing entire nested div text repeatedly
      const text = node.innerText?.trim();
      if (text && text.length > 30) {
        lines.push(text);
      }
    });
    
    let bodyText = '';
    if (lines.length > 0) {
        // Simple deduplication since innerText on a parent includes innerText of children
        let uniqueLines = [];
        for (let line of lines) {
            if (!uniqueLines.some(ul => ul.includes(line) || line.includes(ul) && ul.length > 30)) {
                uniqueLines.push(line);
            }
        }
        bodyText = uniqueLines.join('\n\n');
    }
    
    // ultimate fallback
    if (!bodyText || bodyText.length < 100) {
        bodyText = document.body.innerText;
    }

    return { title, bodyText };
  });

  fs.writeFileSync('extracted_passage.json', JSON.stringify(data, null, 2), 'utf-8');
  console.log('Extraction complete! Data saved to extracted_passage.json');

  await browser.close();
  process.exit(0);
})();
