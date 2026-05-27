# Arquitetura do Sistema — Cursos GT

Este documento define as diretrizes, infraestrutura e fluxos de dados para o modelo de EAD Híbrido com presença obrigatória nas unidades.

## Princípios (Revisados)
1. **Modularidade e Clean Architecture**: Backend centralizado (NestJS) subdividido em contextos bem definidos (DDD - Domain Driven Design).
2. **Sistema Híbrido Estrito**: O "Player de Aulas" exige uma autenticação de dupla via — Token JWT do Aluno + Token Físico (TOTP ou JWT Local) gerado pelo `local-node` da unidade. Sem a aprovação presencial, o payload de vídeo jamais é entregue ao front.
3. **Escalabilidade e Multi-Tenant**: O schema do banco está preparado para múltiplas Unidades Físicas, Cursos e Turmas simultâneas.
4. **Isolamento**: Camadas estritamente desacopladas para evitar falhas de segurança (ex: o frontend de pagamento não compartilha estado com o de aulas).

---

## Estrutura Técnica e Ecossistema

### 1. Camada de Frontend (Next.js - App Router)
Responsável pelas interfaces públicas e áreas logadas.
- **`/(public)`**: Landing pages e vitrine de cursos (focado em SEO, velocidade e conversão).
- **`/(auth)`**: Registro, login e onboarding.
- **`/(student)`**: Dashboard do aluno e Player de Aulas protegido (validação condicional).
- **`/(admin)`**: Área de gestão escolar, relatórios e controle de matrículas.

### 2. Camada de Backend (NestJS + Prisma)
O núcleo lógico central.
- **Módulo de Vendas e Checkout**: Criação de carrinhos, integração Mercado Pago, controle de estornos e confirmação via Webhooks.
- **Módulo Acadêmico**: Gestão relacional de Cursos, Turmas (Classes), Módulos, Aulas (Lessons), Exames e Notas.
- **Módulo de Frequência e Presença**: Endpoint de Check-in recebendo o `local_token`.
- **Módulo de Certificação**: Geração assíncrona de PDFs e Hashing.

### 3. Módulo Local Presencial (`local-node`)
Um daemon ou microserviço rodando na intranet da unidade física.
- Gera rotineiramente tokens de acesso temporários vinculados à unidade (ex: algoritmos TOTP baseados no tempo ou JWT curtos).
- Permite que a rede local valide a presença antes de liberar a comunicação com o Backend Central.

### 4. Camada de Banco de Dados (MySQL)
Modelagem relacional profunda cobrindo fluxos essenciais:
- `Users` (Alunos, Professores, Admins).
- Hierarquia de Conteúdo: `Courses` ➔ `Modules` ➔ `Subjects` ➔ `Lessons`.
- `LessonType` suportando: VIDEO (Bunny.net), TEXT e QUIZ.
- `Classes` (Turmas) e `Enrollments` (vínculo Aluno-Turma).
- `Attendances` (Registro de presença vinculado a uma aula).
- `LocalNodes` (Registro das filiais/unidades).
- `Payments` (Logs transacionais).

### 5. Sistema de Armazenamento e Upload (Local/HostGator)
- Upload via endpoint `POST /api/upload` (Node.js/Express ou rota do Next.js).
- Salvamento local no servidor (HostGator) dentro da pasta `public/uploads`.
- Imagens categorizadas: `thumbnail` (capas dos cards) e `banner` (banner topo do curso).
- A interface de administração possui componentes de "Drag and Drop" para envio desses arquivos.

### 6. Identidade Visual e Logotipo Oficial
- O logotipo oficial da marca **Cursos GT** está centralizado e armazenado fisicamente sob a pasta de recursos estáticos do frontend em `frontend/public/logos/logo.png`.
- Favicon oficial unificado mapeado em `frontend/public/favicon.png` e `frontend/src/app/favicon.ico`.
- Todos os layouts (navbar, sidebar do painel administrativo, painel do aluno), páginas públicas (Home, Cursos, Detalhes, Checkout) e formulários de autenticação (Login, Cadastro) devem utilizar a referência de imagem `/logos/logo.png` em substituição a qualquer placeholder de texto ou círculo fictício.
---

## Fluxo de Dados Principal: Consumo Híbrido (O "Coração" do App)

1. **Chegada na Unidade**: O aluno conecta-se à rede Wi-Fi da unidade.
2. **Captação do Token Local**: O frontend do aluno (via rede local) consome um endpoint do servidor `local-node` (ex: `192.168.1.10/token`) para obter um `presence_token` válido por 5 minutos.
3. **Solicitação de Aula**: O aluno clica em "Assistir" no frontend (`/(student)`).
4. **Validação**: O front envia ao backend o JWT de autenticação normal + o `presence_token`.
5. **Aprovação**: O backend cruza os dados, confirma com a chave secreta do `local-node` daquela unidade, valida se o aluno está na turma/horário correto.
6. **Entrega Segura**: O backend retorna as URLs assinadas (Signed URLs) dos vídeos, que só expiram ao término da aula. E registra a `Attendance` (Presença).

---

## Tratamento de Falhas e Logs Externos
- Todas as requisições de pagamentos (Mercado Pago) devem registrar logs completos (Request/Response) na tabela ou arquivo de log para facilitar debugging.
- Falhas de token presencial devem avisar explicitamente na UI: "Conecte-se à rede da escola para liberar a aula".
