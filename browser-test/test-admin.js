const puppeteer = require('puppeteer');

(async () => {
  console.log('Iniciando navegador em modo visual...');
  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized']
  });

  const page = await browser.newPage();
  
  // Como o usuário tem um sistema de login mockado ou não está logado, 
  // vamos adicionar o estado de autenticação no localStorage
  console.log('Navegando para a página de Cursos Admin...');
  await page.goto('http://localhost:3000');
  
  await page.evaluate(() => {
    localStorage.setItem('auth_user', JSON.stringify({ name: 'Admin', role: 'ADMIN', email: 'admin@cursosgt.com' }));
    localStorage.setItem('auth_token', 'mock-token');
  });

  await page.goto('http://localhost:3000/gerenciar-cursos');
  console.log('Página carregada! Você pode validar o visual Dark Gray na sua tela.');
  
  // Mantemos o navegador aberto para a usuária ver
  // await browser.close();
})();
