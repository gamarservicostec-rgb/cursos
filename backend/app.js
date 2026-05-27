const fs = require('fs');
const path = require('path');

const nodeModulesPath = path.join(__dirname, 'node_modules');

if (!fs.existsSync(nodeModulesPath)) {
  // Se node_modules NÃO existe, roda o servidor de instalação
  const http = require('http');
  const { exec } = require('child_process');

  const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.write('<h2>Iniciando instalação no servidor... Aguarde (pode demorar alguns minutos).</h2>');
    res.write('<pre>');

    const cmd = 'npm install && npx prisma generate && npx prisma db push';
    const child = exec(cmd);

    child.stdout.on('data', (data) => {
      res.write(data.toString() + '\n');
    });

    child.stderr.on('data', (data) => {
      res.write('<span style="color:red">' + data.toString() + '</span>\n');
    });

    child.on('close', (code) => {
      res.write('\n</pre>');
      if (code === 0) {
        res.write('<h2 style="color:green">Instalação concluída com sucesso!</h2>');
        res.write('<p>O banco de dados foi configurado. <b>Por favor, recarregue esta página (F5) para iniciar a API real.</b></p>');
        // Encerra o servidor de instalação para que o Passenger reinicie e carregue a API real
        setTimeout(() => process.exit(0), 3000);
      } else {
        res.write('<h2 style="color:red">Erro na instalação. Código: ' + code + '</h2>');
      }
      res.end();
    });
  });

  const port = process.env.PORT || 3000;
  server.listen(port, () => {
    console.log(`Servidor de instalação rodando na porta ${port}`);
  });

} else {
  // Se node_modules EXISTE, roda a API real
  require('./dist/src/main.js');
}
