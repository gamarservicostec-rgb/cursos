# Cursos GT — Plataforma Híbrida de Ensino

## Objetivo
Construir uma plataforma híbrida de ensino onde o aluno realiza matrícula e pagamento online, mas o consumo das aulas ocorre exclusivamente de forma presencial dentro da escola ("EAD presencial controlado").

## Arquitetura Geral
1. **Marketing e Vendas**: Landing pages e funil de conversão (HostGator).
2. **Checkout e Pagamento**: Integração com Mercado Pago (Checkout Transparente + Webhook).
3. **Sistema Acadêmico**: Gestão de alunos, turmas, aulas e progresso.
4. **Controle Presencial**: Validação via Token Local gerado por servidor interno na escola.
5. **Conteúdo**: Player de vídeo isolado (YouTube/Vimeo).
6. **Certificação**: Geração de certificados PDF com QR Code de autenticidade.

## Regra Absoluta
- Nenhum avanço sem testes reais.
- Congelamento progressivo de camadas validadas.
- Modularidade, Escalabilidade e Isolamento de responsabilidades.

## Tecnologias
- **Frontend**: Next.js (React + TailwindCSS)
- **Backend**: Node.js + NestJS
- **Banco**: PostgreSQL / MySQL
- **Local**: Node.js para serviço de Token Presencial
