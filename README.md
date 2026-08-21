.

# Sistema Bancário — TCC Backend


API REST para gerenciamento de um sistema bancário, desenvolvida com Node.js, TypeScript, Express, Prisma e SQLite. O sistema permite o gerenciamento de clientes, funcionários, agências, contas, cartões e transações bancárias.


---


## Sobre o projeto


O projeto consiste no desenvolvimento de uma API para um sistema bancário, permitindo o cadastro, consulta, alteração e exclusão de diferentes entidades relacionadas ao funcionamento de uma instituição financeira.


O backend é responsável por disponibilizar os serviços utilizados pelo frontend, realizar as regras de negócio, controlar o acesso às informações e realizar a comunicação com o banco de dados.


| Informação | Descrição |
|---|---|
| Nome | Sistema Bancário |
| Tipo | API REST |
| Objetivo | Gerenciar clientes, funcionários, agências, contas, cartões e transações |
| Público-alvo | Funcionários, clientes e sistemas que consumam a API |
| Banco de dados | SQLite |


---


## Tecnologias utilizadas


- Node.js
- TypeScript
- Express
- Prisma ORM
- SQLite
- JWT
- Swagger
- CORS
- dotenv
- Next.js no frontend
- React
- Tailwind CSS


---


## Arquitetura do sistema


O sistema utiliza uma arquitetura baseada na separação entre frontend, backend e banco de dados.


```text
Frontend
   |
   | HTTP / JSON
   v
Backend
   |
   | Express
   v
Routes
   |
   v
Controllers
   |
   v
Prisma ORM
   |
   v
SQLite

O frontend realiza requisições HTTP para a API. O backend recebe essas requisições, encaminha para as rotas e controllers responsáveis e executa as regras de negócio.

O Prisma é utilizado como ORM para realizar a comunicação entre a aplicação e o banco de dados SQLite.

Estrutura do projeto
TCC-backend/
├── config/
│   ├── prisma.ts
│   └── swaggerConfig.ts
├── generated/
│   └── prisma/
├── prisma/
│   ├── migrations/
│   └── schema.prisma
├── src/
│   ├── controllers/
│   │   ├── agencias.ts
│   │   ├── clientes.ts
│   │   ├── contas.ts
│   │   ├── funcionarios.ts
│   │   ├── cartoes.ts
│   │   └── transacoes.ts
│   ├── middlewares/
│   ├── routes.ts
│   ├── app.ts
│   └── index.ts
├── package.json
├── tsconfig.json
├── prisma.config.ts
└── README.md

A organização do projeto separa as responsabilidades de cada parte da aplicação. Os controllers concentram as operações relacionadas às entidades, enquanto as rotas definem os endpoints disponíveis para acesso à API.

Como executar

Primeiramente, instale as dependências do projeto:

npm install

Configure o arquivo .env na raiz do backend:

DATABASE_URL="file:./dev.db"
PORT=8080
JWT_SECRET="sua_chave_secreta"

Gere o Prisma Client:

npx prisma generate

Execute as migrations:

npx prisma migrate dev

Para iniciar o servidor em desenvolvimento:

npm run dev

Após iniciar o backend, a API estará disponível em:

http://localhost:8080

A documentação interativa da API pode ser acessada em:

http://localhost:8080/docs
Autenticação

O sistema utiliza autenticação baseada em JWT para controlar o acesso às funcionalidades que necessitam de identificação do usuário.

Após realizar o login, o sistema gera um token que pode ser utilizado nas requisições autenticadas.

O token deve ser enviado no cabeçalho da requisição:

Authorization: Bearer <token>

A autenticação também permite diferenciar os níveis de acesso do sistema, principalmente entre clientes e funcionários.

API

A API disponibiliza endpoints para gerenciamento das principais entidades do sistema bancário.

Clientes
Método	Rota	Descrição
GET	/clientes	Lista os clientes
GET	/clientes/:id	Busca um cliente pelo ID
POST	/clientes	Cadastra um cliente
PUT	/clientes/:id	Atualiza um cliente
DELETE	/clientes/:id	Remove um cliente

Exemplo de cadastro:

{
  "nome": "João da Silva",
  "cpf": "12345678900",
  "email": "joao@email.com",
  "telefone": "41999999999"
}
Funcionários
Método	Rota	Descrição
GET	/funcionarios	Lista os funcionários
GET	/funcionarios/:id	Busca um funcionário
POST	/funcionarios	Cadastra um funcionário
PUT	/funcionarios/:id	Atualiza um funcionário
DELETE	/funcionarios/:id	Remove um funcionário

Os funcionários possuem acesso a funcionalidades administrativas do sistema.

Agências
Método	Rota	Descrição
GET	/agencias	Lista as agências
GET	/agencias/:id	Busca uma agência
POST	/agencias	Cadastra uma agência
PUT	/agencias/:id	Atualiza uma agência
DELETE	/agencias/:id	Remove uma agência
Contas
Método	Rota	Descrição
GET	/contas	Lista as contas
GET	/contas/:id	Busca uma conta
POST	/contas	Cria uma conta
PUT	/contas/:id	Atualiza uma conta
DELETE	/contas/:id	Remove uma conta

As contas possuem informações como tipo de conta, saldo, senha, data de abertura e chave Pix, além dos relacionamentos com clientes e agências.

Exemplo:

{
  "senha": "123456",
  "tipo_conta": "CORRENTE",
  "saldo": 700,
  "pix": "cliente@email.com",
  "clienteIds": [1],
  "agenciaIds": [1]
}
Cartões
Método	Rota	Descrição
GET	/cartoes	Lista os cartões
GET	/cartoes/:id	Busca um cartão
POST	/cartoes	Cadastra um cartão
PUT	/cartoes/:id	Atualiza um cartão
DELETE	/cartoes/:id	Remove um cartão
Transações
Método	Rota	Descrição
GET	/transacoes	Lista as transações
GET	/transacoes/:id	Busca uma transação
POST	/transacoes	Cria uma transação
PUT	/transacoes/:id	Atualiza uma transação
DELETE	/transacoes/:id	Remove uma transação

As transações podem representar operações bancárias realizadas pelas contas, incluindo transferências entre contas.

Em uma transferência, o sistema verifica a conta de origem, a conta de destino, o proprietário da conta e o saldo disponível antes de realizar a operação.

Exemplo:

{
  "tipo": "TRANSFERENCIA",
  "valor": 100,
  "descricao": "Transferência bancária",
  "contaOrigemId": 1,
  "contaDestinoId": 2
}
Banco de dados

O projeto utiliza SQLite como banco de dados e Prisma ORM para gerenciamento e comunicação com os dados.

Os principais modelos utilizados no sistema são:

Cliente
Funcionario
Agencia
Conta
Cartao
Transacao

Os modelos possuem relacionamentos entre si para representar a estrutura de uma instituição bancária.

De forma simplificada:

Cliente
   |
   | possui
   v
Conta
   |
   | realiza
   v
Transacao


Agencia
   |
   | possui
   v
Conta


Conta
   |
   | possui
   v
Cartao

O arquivo prisma/schema.prisma contém a definição dos modelos, atributos, tipos de dados e relacionamentos utilizados pelo banco.

Regras de negócio

O backend possui regras para garantir a integridade das operações realizadas pelo sistema.

Entre elas estão:

Validação dos dados recebidos nas requisições.
Verificação da existência dos registros antes de operações.
Controle das contas de origem e destino em transferências.
Verificação do saldo disponível para transferências.
Verificação da propriedade da conta durante operações bancárias.
Atualização do saldo das contas após transferências.
Controle de acesso às funcionalidades administrativas.
Relacionamento entre clientes, contas, agências, cartões e transações.

Nas transferências, a atualização dos saldos e o registro das transações são realizados dentro de uma operação de banco de dados, evitando que apenas uma parte da operação seja concluída.

Swagger

O projeto possui documentação interativa utilizando Swagger UI.

Após iniciar o backend, acesse:

http://localhost:8080/docs

A interface permite visualizar os endpoints disponíveis, seus métodos HTTP, parâmetros, corpos das requisições e respostas esperadas.

A configuração da documentação está localizada em:

config/swaggerConfig.ts

A integração com o Express é realizada no arquivo:

src/app.ts
Frontend Web

O frontend do sistema é desenvolvido utilizando Next.js e React.

Ele é responsável pela interface utilizada pelos usuários para acessar as funcionalidades disponibilizadas pelo backend.

Entre as funcionalidades estão:

Login.
Cadastro e gerenciamento de clientes.
Gerenciamento de funcionários.
Gerenciamento de agências.
Gerenciamento de contas.
Gerenciamento de cartões.
Visualização de transações.
Operações administrativas.

O frontend realiza requisições HTTP para o backend e apresenta os dados retornados pela API ao usuário.

A aplicação também possui áreas específicas para funcionários, permitindo o gerenciamento de informações administrativas do sistema.

Integração entre os sistemas

A comunicação entre frontend e backend ocorre por meio de uma API REST utilizando HTTP e JSON.

Usuário
   |
   v
Frontend Next.js
   |
   | HTTP / JSON
   v
API Express
   |
   v
Controllers
   |
   v
Prisma
   |
   v
SQLite

Dessa forma, o frontend não acessa diretamente o banco de dados. Todas as operações passam pelo backend, que é responsável por validar as informações e executar as regras de negócio.

Scripts principais

Os comandos utilizados no desenvolvimento podem variar conforme a configuração do package.json.

Comandos principais:

npm install

Instala as dependências do projeto.

npm run dev

Inicia o servidor em modo de desenvolvimento.

npx prisma generate

Gera o Prisma Client.

npx prisma migrate dev

Executa as migrations do banco de dados.

npx prisma studio

Abre a interface visual do banco de dados através do Prisma Studio.