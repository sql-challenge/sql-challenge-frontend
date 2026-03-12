// --- CapituloView & DatabaseSchema types ---
export class Desafio {
    constructor(
        public id: number,
        public titulo: string,
        public descricao: string,
        // public xpRecompensa: number,
        public tempoEstimado: string,
        public taxaConclusao: number,
        public criadoEm: string,
        public atualizadoEm: string
    ) {}
}

export class Capitulo {
  constructor(
    public id: number,
    public idDesafio: number,
    public introHistoria: string,
    public xp_recompensa: number,
    public contextoHistoria: string,
    public numero: number
  ) {}
}

export interface Objetivo {
  id: number;
  idCapitulo: number;
  descricao: string;
  ordem: number;
}

export interface Dica {
  id: number;
  idCapitulo: number;
  ordem: number;
  conteudo: string;
  penalidadeXp: number;
}

export interface Consulta {
  id: number;
  idCapitulo: number;
  colunas: string[];
  resultado: Record<string, unknown>[];
}

export interface DatabaseSchema {
  visaoTabelas: VisaoTabela[];
  visaoRelacionamentos: VisaoRelacionamento[];
}

export interface VisaoTabela {
  id: number;
  id_visao: number;
  nome: string;
  descricao: string | null;
  colunas: VisaoColuna[];
  exemplos: VisaoDadoExemplo[];
}

export interface VisaoColuna {
  id: number;
  id_tabela: number;
  nome: string;
  tipo: string;
  nulavel: boolean;
  chave_primaria: boolean;
  fk_tabela?: string | null;
  fk_coluna?: string | null;
  descricao: string | null;
}

export interface VisaoRelacionamento {
  id: number;
  id_visao: number;
  tabela_origem: string;
  tabela_destino: string;
  tipo: "one-to-one" | "one-to-many" | "many-to-many";
  coluna_origem: string;
  coluna_destino: string;
}

export interface VisaoDadoExemplo {
  id: number;
  id_tabela: number;
  dados: Record<string, unknown>;
}

// Example CapituloView using the new DDL-matching names
export interface CapituloView {
  capitulo: Capitulo;
  objetivos: Objetivo[];
  dicas: Dica[];
  consultaSolucao: Consulta;
  schema: DatabaseSchema;
}

// --- EXAMPLE MOCK ---

// export const mockCapituloView: CapituloView = {
//   capitulo: {
//     id: 1,
//     idDesafio: 1,
//     introHistoria: "Descubra o paradeiro do banco perdido.",
//     xp_recompensa: 100,
//     contextoHistoria: "O banco sumiu com todos os dados dos clientes...",
//     numero: 1,
//   },
//   objetivos: [
//     { id: 11, idCapitulo: 1, descricao: "Identificar todos os clientes.", ordem: 1 }
//   ],
//   dicas: [
//     { id: 21, idCapitulo: 1, ordem: 1, conteudo: "Considere a tabela customers.", penalidadeXp: 10 }
//   ],
//   consultaSolucao: {
//     id: 31,
//     idCapitulo: 1,
//     colunas: ["cliente_id", "saldo"],
//     resultado: [{ cliente_id: 1, saldo: 999 }]
//   },
//   schema: {
//     visaoTabelas: [
//       {
//         nome: "customers",
//         descricao: "Tabela de clientes do banco.",
//         colunas: [
//           { id: 1,id_tabela: 1, nome: "cliente_id", tipo: "integer", nulavel: false, chave_primaria: true, descricao: "ID único do cliente" },
//           { id: 2, id_tabela: 1, nome: "nome", tipo: "varchar(100)", nulavel: false, chave_primaria: false, descricao: "Nome completo do cliente" },
//           { id: 3, id_tabela: 1, nome: "email", tipo: "varchar(100)", nulavel: true, chave_primaria: false, descricao: "E-mail do cliente" },
//           { id: 4, id_tabela: 1, nome: "saldo", tipo: "decimal", nulavel: false, chave_primaria: false, descricao: "Saldo na conta do cliente" }
//         ],
//         exemplos: [
//           { : 1, nome: "Alice", email: "alice@email.com", saldo: 999 },
//           { cliente_id: 2, nome: "Bob", email: "bob@email.com", saldo: 1500 }
//         ]
//       },
//       {
//         nome: "accounts",
//         descricao: "Contas bancárias dos clientes.",
//         colunas: [
//           { id: 5, id_tabela: 2, nome: "account_id", tipo: "integer", nulavel: false, chave_primaria: true, descricao: "ID da conta" },
//           { id: 6, id_tabela: 2, nome: "cliente_id", tipo: "integer", nulavel: false, chave_primaria: false, fk_tabela: "customers", fk_coluna: "cliente_id", descricao: "ID do cliente (FK para customers)" },
//           { id: 7, id_tabela: 2, nome: "tipo", tipo: "varchar(20)", nulavel: false, chave_primaria: false, descricao: "Tipo de conta" }
//         ],
//         exemplos: [
//           { account_id: 1, cliente_id: 1, tipo: "corrente" }
//         ]
//       }
//     ],
//     visaoRelacionamentos: [
//       {
//         tabela_origem: "accounts",
//         coluna_origem: "cliente_id",
//         tabela_destino: "customers",
//         coluna_destino: "cliente_id",
//         tipo: "one-to-many"
//       }
//     ]
//   }
// };