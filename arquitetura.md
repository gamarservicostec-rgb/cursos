# Arquitetura do Sistema — Cursos GT

## Princípios
1. **Modularidade**: Camadas desacopladas via interfaces e services.
2. **Escalabilidade**: Preparado para múltiplas unidades e turmas.
3. **Isolamento**: Separação clara entre Auth, Pagamentos, Aulas e Admin.
4. **Segurança**: Bloqueio de acesso externo para conteúdos de aula via Token Presencial.

## Camadas Técnicas
- **Camada 1 (Vendas)**: Landing Pages públicas.
- **Camada 2 (Checkout)**: Mercado Pago API.
- **Camada 3 (Acadêmica)**: Lógica de negócio e gestão educacional.
- **Camada 4 (Presencial)**: Servidor Local -> Geração de Token -> Validação Backend.
- **Camada 5 (Aulas)**: Player componentizado e protegido.
- **Camada 6 (Certificação)**: Engine de PDF e Hashing.

## Estrutura de Pastas
- `backend/`: Core API (NestJS).
- `frontend/`: Interface do usuário (Next.js).
- `local-node/`: Serviço de rede local para tokens.
- `shared/`: Contratos de dados compartilhados.
- `database/`: Scripts SQL e migrações.
- `docs/`: Documentação técnica e checklists de homologação.
