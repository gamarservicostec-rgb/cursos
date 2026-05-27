const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  try {
    const executablePaths = [
      'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
      'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'
    ];
    
    let browserPath = '';
    for (const path of executablePaths) {
      if (fs.existsSync(path)) {
        browserPath = path;
        break;
      }
    }

    const browser = await puppeteer.launch({
      headless: "new",
      executablePath: browserPath || undefined,
      defaultViewport: { width: 1280, height: 800 }
    });

    const page = await browser.newPage();
    
    // Auth bypass
    await page.goto('http://localhost:3001');
    await page.evaluate(() => {
      localStorage.setItem('auth_user', JSON.stringify({ name: 'Admin', role: 'ADMIN', email: 'admin@cursosgt.com' }));
      localStorage.setItem('auth_token', 'mock-token');
    });

    await page.goto('http://localhost:3001/gerenciar-cursos', { waitUntil: 'networkidle0', timeout: 60000 });
    
    const outputPath = 'C:\\Users\\Silvana Barbosa\\.gemini\\antigravity-ide\\brain\\984e3f91-27ba-4d7d-a7e7-464715dfa420\\screenshot.png';
    await page.screenshot({ path: outputPath, fullPage: true });
    console.log('Screenshot salva em: ' + outputPath);

    await browser.close();
  } catch (err) {
    console.error(err);
  }
})();
