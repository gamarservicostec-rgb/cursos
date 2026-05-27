const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

(async () => {
  console.log('==================================================');
  console.log('INICIANDO TESTES AUTOMATIZADOS NO NAVEGADOR REAL');
  console.log('Protocolo de Teste: Frequência Híbrida e Player');
  console.log('==================================================\n');

  const screenshotsDir = path.join(__dirname, 'screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir);
  }

  // 1. Detectar e usar o Google Chrome instalado do usuário
  console.log('🔍 Detectando navegador Chrome instalado no sistema...');
  const chromePaths = [
    'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
    process.env.LOCALAPPDATA + '\\Google\\Chrome\\Application\\chrome.exe'
  ];
  let executablePath = undefined;
  for (const p of chromePaths) {
    if (fs.existsSync(p)) {
      executablePath = p;
      console.log(`✅ Chrome encontrado em: ${p}`);
      break;
    }
  }

  console.log('🤖 1. Abrindo o navegador Chrome...');
  const browser = await puppeteer.launch({
    headless: false, // Visível para validação real pelo usuário
    executablePath, // Usa o Chrome instalado do usuário
    defaultViewport: { width: 1280, height: 800 },
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  
  // Capturar logs do console do DevTools do navegador
  page.on('console', msg => {
    console.log(`[DevTools Console] [${msg.type()}] ${msg.text()}`);
  });

  try {
    // 2. Acessar a página de Login do Estudante
    console.log('\n🌐 2. Acessando a página de Login do Cursos GT...');
    await page.goto('http://localhost:3001/login');
    await page.waitForSelector('input[type="email"]', { timeout: 15000 });
    await new Promise(r => setTimeout(r, 1000)); // Esperar hidratação Next.js
    await page.screenshot({ path: path.join(screenshotsDir, '01_login_page.png') });
    console.log('📸 Screenshot da tela de login salva!');

    // 3. Preencher formulário de Login
    console.log('\n📝 3. Preenchendo credenciais do Aluno Semeado...');
    await page.type('input[type="email"]', 'aluno@cursosgt.com.br');
    await page.type('input[type="password"]', 'aluno123');
    await page.screenshot({ path: path.join(screenshotsDir, '02_credentials_filled.png') });

    // 4. Submeter formulário
    console.log('\n🚀 4. Clicando no botão de entrar e aguardando redirecionamento...');
    await page.click('button[type="submit"]');

    // Aguardar redirecionamento para /painel via validação de URL e seletor
    await page.waitForFunction(() => window.location.pathname === '/painel', { timeout: 15000 });
    await page.waitForSelector('main', { timeout: 15000 });
    console.log('✅ Redirecionado para:', page.url());

    // Tirar screenshot do Painel do Estudante
    await page.screenshot({ path: path.join(screenshotsDir, '03_student_dashboard.png') });
    console.log('📸 Screenshot do painel do estudante salva!');

    // 5. Obter dinamicamente o link da Sala de Aula a partir do painel
    console.log('\n📺 5. Obtendo link dinâmico da Sala de Aula a partir do Painel...');
    const classLinkElement = await page.waitForSelector('a[href*="/minhas-aulas?classId="]', { timeout: 15000 });
    const classHref = await page.evaluate(el => el.getAttribute('href'), classLinkElement);
    const fullClassUrl = `http://localhost:3001${classHref}`;
    console.log(`✅ Link dinâmico encontrado: ${fullClassUrl}`);

    console.log('📺 Acessando a Sala de Aula/Player...');
    await page.goto(fullClassUrl);
    await page.waitForSelector('main', { timeout: 15000 });
    
    // Aguardar renderização da página
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: path.join(screenshotsDir, '04_classroom_locked.png') });
    console.log('📸 Screenshot da aula bloqueada (Frequência pendente) salva!');

    // 6. Validar presença híbrida (Check-in do Wi-Fi local)
    console.log('\n🔑 6. Localizando o botão "Validar Presença Híbrida"...');
    
    // Obter todos os botões e clicar no de presença
    const buttons = await page.$$('button');
    let verifyButton = null;
    for (const button of buttons) {
      const text = await page.evaluate(el => el.textContent, button);
      if (text && text.includes('Validar Presença Híbrida')) {
        verifyButton = button;
        break;
      }
    }

    if (verifyButton) {
      console.log('✅ Botão encontrado! Clicando...');
      await page.evaluate(el => el.click(), verifyButton);
      console.log('⌛ Aguardando confirmação do check-in e liberação do player...');
      
      // Aguardar até que a presença seja validada (o player iframe deve aparecer)
      await page.waitForSelector('iframe', { timeout: 10000 });
      console.log('🎉 Frequência validada com sucesso no backend!');
      
      await new Promise(r => setTimeout(r, 2000)); // Esperar o carregamento do player do YouTube
      await page.screenshot({ path: path.join(screenshotsDir, '05_classroom_unlocked.png') });
      console.log('📸 Screenshot do player desbloqueado (com vídeo ativo) salva!');
    } else {
      throw new Error('Botão de validação de presença não encontrado na página.');
    }

    console.log('\n==================================================');
    console.log('🎉 TODOS OS TESTES FORAM CONCLUÍDOS COM SUCESSO! 🎉');
    console.log('Frequência Híbrida Estrita validada e aprovada.');
    console.log('==================================================');

  } catch (error) {
    console.error('\n❌ ERRO DETECTADO DURANTE A EXECUÇÃO DOS TESTES:', error);
    try {
      const pageText = await page.evaluate(() => document.body.innerText);
      console.log('--- CONTEÚDO VISÍVEL DA PÁGINA EM FALHA ---');
      console.log(pageText);
      console.log('-------------------------------------------');
    } catch (e) {
      console.log('Não foi possível obter o texto da página:', e.message);
    }
    await page.screenshot({ path: path.join(screenshotsDir, 'error_failure.png') });
    console.log('📸 Screenshot do erro salva para análise!');
  } finally {
    console.log('\n👋 Fechando o navegador...');
    await browser.close();
  }
})();
