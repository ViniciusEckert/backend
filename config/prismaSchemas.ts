export const prismaSchemas = {
  // ─── ENUMS ────────────────────────────────────────────────────────────────

  TipoConta: {
    type: "string",
    enum: ["CORRENTE", "POUPANCA", "SALARIO", "UNIVERSITARIA"],
    example: "CORRENTE",
  },

  TipoCartao: {
    type: "string",
    enum: ["CREDITO", "DEBITO"],
    example: "CREDITO",
  },

  TipoTransacao: {
    type: "string",
    enum: ["DEPOSITO", "SAQUE", "TRANSFERENCIA", "PAGAMENTO"],
    example: "DEPOSITO",
  },

  // ─── MODELS ───────────────────────────────────────────────────────────────

  Cliente: {
    type: "object",
    properties: {
      id: { type: "integer", example: 1 },
      nome: { type: "string", example: "João da Silva" },
      email: { type: "string", format: "email", example: "joao@email.com" },
      cpf: { type: "string", example: "123.456.789-00" },
      data_nascimento: { type: "string", example: "1990-05-15" },
      telefone: { type: "string", example: "(41) 99999-9999" },
      senha: { type: "string", example: "senha123" },
      createdAt: { type: "string", format: "date-time", example: "2024-01-01T00:00:00.000Z" },
      updateAt: { type: "string", format: "date-time", example: "2024-01-01T00:00:00.000Z" },
    },
  },

  ClienteCreate: {
    type: "object",
    required: ["nome", "email", "cpf", "data_nascimento", "telefone", "senha"],
    properties: {
      nome: { type: "string", example: "João da Silva" },
      email: { type: "string", format: "email", example: "joao@email.com" },
      cpf: { type: "string", example: "123.456.789-00" },
      data_nascimento: { type: "string", example: "1990-05-15" },
      telefone: { type: "string", example: "(41) 99999-9999" },
      senha: { type: "string", example: "senha123" },
    },
  },

  ClienteUpdate: {
    type: "object",
    properties: {
      nome: { type: "string", example: "João da Silva" },
      email: { type: "string", format: "email", example: "joao@email.com" },
      cpf: { type: "string", example: "123.456.789-00" },
      data_nascimento: { type: "string", example: "1990-05-15" },
      telefone: { type: "string", example: "(41) 99999-9999" },
      senha: { type: "string", example: "novaSenha456" },
    },
  },

  ClienteLogin: {
    type: "object",
    required: ["email", "senha"],
    properties: {
      email: { type: "string", format: "email", example: "joao@email.com" },
      senha: { type: "string", example: "senha123" },
    },
  },

  // ─── AGÊNCIA ──────────────────────────────────────────────────────────────

  Agencia: {
    type: "object",
    properties: {
      id: { type: "integer", example: 1 },
      nome: { type: "string", example: "Agência Centro" },
      numero: { type: "string", example: "0001" },
      endereco: { type: "string", example: "Rua das Flores, 123 - Curitiba/PR" },
    },
  },

  AgenciaCreate: {
    type: "object",
    required: ["nome", "numero", "endereco"],
    properties: {
      nome: { type: "string", example: "Agência Centro" },
      numero: { type: "string", example: "0001" },
      endereco: { type: "string", example: "Rua das Flores, 123 - Curitiba/PR" },
    },
  },

  AgenciaUpdate: {
    type: "object",
    properties: {
      nome: { type: "string", example: "Agência Centro Atualizada" },
      numero: { type: "string", example: "0002" },
      endereco: { type: "string", example: "Av. Principal, 456 - Curitiba/PR" },
    },
  },

  // ─── CONTA ────────────────────────────────────────────────────────────────

  Conta: {
    type: "object",
    properties: {
      id: { type: "integer", example: 1 },
      senha: { type: "string", example: "1234" },
      tipo_conta: { $ref: "#/components/schemas/TipoConta" },
      saldo: { type: "number", format: "decimal", example: 1500.50 },
      data_abertura: { type: "string", format: "date-time", example: "2024-01-01T00:00:00.000Z" },
      pix: { type: "string", nullable: true, example: "joao@email.com" },
    },
  },

  ContaCreate: {
    type: "object",
    required: ["senha", "tipo_conta", "data_abertura"],
    properties: {
      senha: { type: "string", example: "1234" },
      tipo_conta: { $ref: "#/components/schemas/TipoConta" },
      saldo: { type: "number", example: 0 },
      data_abertura: { type: "string", format: "date-time", example: "2024-01-01T00:00:00.000Z" },
      pix: { type: "string", nullable: true, example: "joao@email.com" },
    },
  },

  ContaUpdate: {
    type: "object",
    properties: {
      senha: { type: "string", example: "4321" },
      tipo_conta: { $ref: "#/components/schemas/TipoConta" },
      saldo: { type: "number", example: 2000.00 },
      pix: { type: "string", nullable: true, example: "novochave@email.com" },
    },
  },

  // ─── CARTÃO ───────────────────────────────────────────────────────────────

  Cartao: {
    type: "object",
    properties: {
      id: { type: "integer", example: 1 },
      numero_cartao: { type: "string", example: "1234 5678 9012 3456" },
      tipo_cartao: { $ref: "#/components/schemas/TipoCartao" },
      cvv: { type: "string", example: "123" },
      validade: { type: "string", format: "date-time", example: "2027-12-01T00:00:00.000Z" },
    },
  },

  CartaoCreate: {
    type: "object",
    required: ["numero_cartao", "tipo_cartao", "cvv", "validade"],
    properties: {
      numero_cartao: { type: "string", example: "1234 5678 9012 3456" },
      tipo_cartao: { $ref: "#/components/schemas/TipoCartao" },
      cvv: { type: "string", example: "123" },
      validade: { type: "string", format: "date-time", example: "2027-12-01T00:00:00.000Z" },
    },
  },

  CartaoUpdate: {
    type: "object",
    properties: {
      numero_cartao: { type: "string", example: "9876 5432 1098 7654" },
      tipo_cartao: { $ref: "#/components/schemas/TipoCartao" },
      cvv: { type: "string", example: "321" },
      validade: { type: "string", format: "date-time", example: "2029-06-01T00:00:00.000Z" },
    },
  },

  // ─── TRANSAÇÃO ────────────────────────────────────────────────────────────

  Transacao: {
    type: "object",
    properties: {
      id: { type: "integer", example: 1 },
      tipo: { $ref: "#/components/schemas/TipoTransacao" },
      valor: { type: "number", format: "decimal", example: 250.00 },
      dataTransacao: { type: "string", format: "date-time", example: "2024-06-01T10:30:00.000Z" },
      descricao: { type: "string", nullable: true, example: "Pagamento de boleto" },
    },
  },

  TransacaoCreate: {
    type: "object",
    required: ["tipo", "valor"],
    properties: {
      tipo: { $ref: "#/components/schemas/TipoTransacao" },
      valor: { type: "number", example: 250.00 },
      descricao: { type: "string", nullable: true, example: "Pagamento de boleto" },
    },
  },

  TransacaoUpdate: {
    type: "object",
    properties: {
      tipo: { $ref: "#/components/schemas/TipoTransacao" },
      valor: { type: "number", example: 300.00 },
      descricao: { type: "string", nullable: true, example: "Descrição atualizada" },
    },
  },

  // ─── FUNCIONÁRIO ──────────────────────────────────────────────────────────

  Funcionario: {
    type: "object",
    properties: {
      id: { type: "integer", example: 1 },
      nome: { type: "string", example: "Maria Souza" },
      email: { type: "string", format: "email", example: "maria@banco.com" },
      admin: { type: "boolean", example: false },
      senha: { type: "string", example: "senha456" },
    },
  },

  FuncionarioCreate: {
    type: "object",
    required: ["nome", "email", "admin", "senha"],
    properties: {
      nome: { type: "string", example: "Maria Souza" },
      email: { type: "string", format: "email", example: "maria@banco.com" },
      admin: { type: "boolean", example: false },
      senha: { type: "string", example: "senha456" },
    },
  },

  FuncionarioUpdate: {
    type: "object",
    properties: {
      nome: { type: "string", example: "Maria Souza Silva" },
      email: { type: "string", format: "email", example: "mariasilva@banco.com" },
      admin: { type: "boolean", example: true },
      senha: { type: "string", example: "novaSenha789" },
    },
  },

  FuncionarioLogin: {
    type: "object",
    required: ["email", "senha"],
    properties: {
      email: { type: "string", format: "email", example: "maria@banco.com" },
      senha: { type: "string", example: "senha456" },
    },
  },

  // ─── RELAÇÃO (corpo genérico para connect/disconnect) ─────────────────────

  RelacaoId: {
    type: "object",
    required: ["id"],
    properties: {
      id: { type: "integer", example: 1, description: "ID da entidade a ser vinculada/desvinculada" },
    },
  },

  // ─── RESPOSTAS GENÉRICAS ──────────────────────────────────────────────────

  MensagemSucesso: {
    type: "object",
    properties: {
      message: { type: "string", example: "Operação realizada com sucesso!" },
    },
  },

  ErroGenerico: {
    type: "object",
    properties: {
      error: { type: "string", example: "Erro interno do servidor." },
    },
  },

  ErroNaoEncontrado: {
    type: "object",
    properties: {
      error: { type: "string", example: "Registro não encontrado." },
    },
  },
};