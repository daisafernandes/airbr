# Airbr — Monorepo

Monorepo com frontend em React e backend em Node.js, organizado com Turborepo e seguindo os princípios de **Clean Architecture** e **SOLID**.

## Estrutura

```
airbr/
├── apps/
│   ├── backend/              # Node.js + Express + TypeScript
│   │   └── src/
│   │       ├── domain/       # Entidades, interfaces, value objects (sem dependências externas)
│   │       │   ├── entities/
│   │       │   ├── repositories/    # Interfaces (contratos)
│   │       │   ├── use-cases/       # Interface IUseCase
│   │       │   └── value-objects/
│   │       ├── application/  # Casos de uso, DTOs, mappers (depende só do domain)
│   │       │   ├── dtos/
│   │       │   ├── mappers/
│   │       │   └── services/        # Implementação dos use cases
│   │       ├── infrastructure/ # Implementações concretas (DB, HTTP, providers)
│   │       │   ├── config/
│   │       │   ├── database/
│   │       │   │   └── repositories/
│   │       │   ├── http/
│   │       │   │   ├── controllers/
│   │       │   │   ├── middlewares/
│   │       │   │   └── routes/
│   │       │   └── providers/
│   │       └── shared/       # Utilitários transversais
│   │           ├── errors/
│   │           ├── types/
│   │           └── utils/
│   └── frontend/             # React + Vite + TypeScript
│       └── src/
│           ├── assets/       # Imagens, fontes, ícones
│           ├── components/
│           │   ├── ui/       # Componentes base reutilizáveis (Button, Input...)
│           │   ├── layout/   # Estruturas de layout (RootLayout...)
│           │   └── shared/   # Componentes compartilhados por features
│           ├── contexts/     # React Contexts (AuthContext...)
│           ├── hooks/        # Custom hooks (useCreateUser...)
│           ├── pages/        # Páginas mapeadas pelas rotas
│           ├── services/     # Camada de comunicação com a API
│           ├── styles/       # CSS global
│           ├── types/        # Tipos e interfaces TypeScript
│           └── utils/        # Funções puras auxiliares
├── packages/
│   ├── eslint-config/        # Regras ESLint compartilhadas
│   ├── typescript-config/    # tsconfig base, react e node
│   └── ui/                   # (reservado) Biblioteca de componentes compartilhados
├── .gitignore
├── .prettierrc
├── package.json              # Workspaces root
└── turbo.json                # Pipeline Turborepo
```

## Princípios adotados

### Clean Architecture (backend)
A dependência flui sempre de fora para dentro:

```
Infrastructure → Application → Domain
```

- **Domain**: zero dependências externas. Contém a lógica de negócio pura.
- **Application**: orquestra casos de uso, depende apenas do domain.
- **Infrastructure**: implementa as interfaces definidas no domain/application.

### SOLID
| Princípio | Aplicação |
|---|---|
| **S**RP | Cada classe tem uma única responsabilidade (`CreateUserService`, `UserMapper`, `UserController`) |
| **O**CP | Use cases e repositórios são extensíveis via interfaces sem alterar código existente |
| **L**SP | `InMemoryUserRepository` é substituível por qualquer implementação de `IUserRepository` |
| **I**SP | Interfaces pequenas e específicas (`IUserRepository`, `IHashProvider`, `IUseCase`) |
| **D**IP | Services dependem de abstrações (`IUserRepository`), não de implementações concretas |

## Pré-requisitos

- Node.js >= 20
- npm >= 10

## Como iniciar

```bash
# Instalar dependências de todos os projetos
npm install

# Rodar todos os projetos em modo desenvolvimento
npm run dev

# Rodar apenas o backend
npm run dev --filter=@airbr/backend

# Rodar apenas o frontend
npm run dev --filter=@airbr/frontend

# Build de produção (todos)
npm run build

# Lint (todos)
npm run lint

# Testes (todos)
npm run test
```

## Portas

| Serviço | Porta |
|---|---|
| Frontend (Vite) | http://localhost:5173 |
| Backend (Express) | http://localhost:3333 |

## Variáveis de ambiente

Copie os `.env.example` de cada app:

```bash
cp apps/backend/.env.example apps/backend/.env
cp apps/frontend/.env.example apps/frontend/.env
```
