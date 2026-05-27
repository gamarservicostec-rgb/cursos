@echo off
title Cursos GT - Setup e Inicializacao
color 0B
clear

echo =======================================================================
echo          ____ _   _ ____  ____   ___  ____     ____ _____ 
echo         / ___^| ^| ^| ^|  _ \/ ___^| / _ \/ ___^|   / ___^|_   _^|
echo        ^| ^|   ^| ^| ^| ^| ^|_) \___ \^| ^| ^| \___ \   ^| ^|  _  ^| ^|  
echo        ^| ^|___^| ^|_^| ^|  _ < ___) ^| ^|_^| ^|___) ^|  ^| ^|_^| ^| ^| ^|  
echo         \____^|\___/^|_^| \_\____/ \___/^|____/    \____^| ^|_^|  
echo =======================================================================
echo.
echo           PLATAFORMA CURSOS GT - GERENCIADOR DE INICIALIZACAO
echo.
echo =======================================================================
echo.

:: Verificar se o Node.js esta instalado no sistema host
node -v >nul 2>&1
if %errorlevel% neq 0 (
    color 0C
    echo [ERRO] Node.js nao foi detectado no seu sistema!
    echo Por favor, instale o Node.js LTS em: https://nodejs.org/
    echo Pressione qualquer tecla para sair...
    pause >nul
    exit /b 1
)

echo [OK] Node.js detectado com sucesso.
echo.

:menu
echo Escolha uma opcao:
echo.
echo [1] Setup Inicial Completo (Instalar dependencias + Sincronizar Banco + Iniciar Servidores)
echo [2] Apenas Iniciar Servidores (Backend + Frontend)
echo [3] Sincronizar Schema com o Banco de Dados (Prisma DB Push)
echo [4] Sair
echo.
set /p opcao="Digite a opcao desejada (1-4): "

if "%opcao%"=="1" goto setup_completo
if "%opcao%"=="2" goto iniciar_servidores
if "%opcao%"=="3" goto prisma_push
if "%opcao%"=="4" exit
echo Opcao invalida, tente novamente.
echo.
goto menu

:setup_completo
cls
color 0E
echo =======================================================================
echo                INICIANDO SETUP COMPLETO DA PLATAFORMA
echo =======================================================================
echo.

:: 1. Backend Dependencies
echo >>> 1. Instalando dependencias do Backend (NestJS)...
cd backend
call npm install
if %errorlevel% neq 0 (
    color 0C
    echo.
    echo [ERRO] Falha ao instalar dependencias do Backend. Verifique sua conexao.
    pause
    goto menu
)
echo [OK] Dependencias do Backend instaladas com sucesso.
echo.

:: 2. Prisma Generate
echo >>> 2. Gerando Cliente do Prisma...
call npx prisma generate
if %errorlevel% neq 0 (
    color 0C
    echo.
    echo [ERRO] Falha ao gerar Prisma Client.
    pause
    goto menu
)
echo [OK] Prisma Client gerado com sucesso.
echo.

:: 3. Prisma DB Push
echo >>> 3. Sincronizando Schema com o seu Banco de Dados MySQL (HostGator/Local)...
echo Nota: Certifique-se de que o banco de dados e a conexao no arquivo backend/.env estao corretos.
set /p db_confirm="Deseja rodar o sync de banco agora? (S/N): "
if /i "%db_confirm%"=="S" (
    call npx prisma db push
    if %errorlevel% neq 0 (
        color 0C
        echo.
        echo [ALERTA] Nao foi possivel conectar ao banco de dados MySQL para sincronizar o schema.
        echo Verifique a string de conexao no arquivo "backend/.env" e execute a opcao [3] mais tarde.
        echo Pressione qualquer tecla para continuar o setup...
        pause >nul
        color 0E
    ) else (
        echo [OK] Banco de dados sincronizado com sucesso!
    )
) else (
    echo Sincronizacao de banco ignorada.
)
echo.
cd ..

:: 4. Frontend Dependencies
echo >>> 4. Instalando dependencias do Frontend (Next.js)...
cd frontend
call npm install
if %errorlevel% neq 0 (
    color 0C
    echo.
    echo [ERRO] Falha ao instalar dependencias do Frontend. Verifique sua conexao.
    pause
    goto menu
)
echo [OK] Dependencias do Frontend instaladas com sucesso.
echo.
cd ..

goto iniciar_servidores

:iniciar_servidores
cls
color 0A
echo =======================================================================
echo                INICIANDO SERVIDORES DA PLATAFORMA CURSOS GT
echo =======================================================================
echo.
echo [INFO] Iniciando o Backend em uma nova janela (porta 3000)...
start "Backend - Cursos GT" cmd /k "cd backend && title Backend - Cursos GT && npm run start:dev"

echo [INFO] Iniciando o Frontend em uma nova janela (porta 3001)...
start "Frontend - Cursos GT" cmd /k "cd frontend && title Frontend - Cursos GT && npm run dev"

echo.
echo =======================================================================
echo [SUCESSO] Servidores em processo de inicializacao!
echo.
echo >>> O Frontend estara acessivel em: http://localhost:3001
echo >>> O Backend estara acessivel em:  http://localhost:3000
echo =======================================================================
echo.
echo Abrindo o navegador na tela de Login da plataforma em 5 segundos...
timeout /t 5 >nul
start http://localhost:3001/login
echo.
echo Bom trabalho! Voce pode fechar esta janela agora. Os servidores continuam rodando nas outras janelas.
pause >nul
exit

:prisma_push
cls
color 0E
echo =======================================================================
echo          SINCRONIZANDO SCHEMA COM BANCO DE DADOS MYSQL
echo =======================================================================
echo.
echo Executando 'npx prisma db push' na pasta backend...
cd backend
call npx prisma db push
if %errorlevel% neq 0 (
    color 0C
    echo.
    echo [ERRO] Falha ao sincronizar o banco de dados.
    echo Verifique suas credenciais de conexao MySQL em backend/.env
) else (
    color 0A
    echo.
    echo [SUCESSO] Schema sincronizado com o MySQL com sucesso!
)
cd ..
echo.
echo Pressione qualquer tecla para voltar ao menu...
pause >nul
goto menu
