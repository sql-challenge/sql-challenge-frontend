import type { Mystery, MysteryDetail } from "@/_lib/types/mystery";

export const mockMysteries: Mystery[] = [
  {
    id: "1",
    title: "O Caso do SELECT Perdido",
    description: "Um desenvolvedor júnior precisa encontrar todos os clientes ativos no banco de dados, mas não sabe como fazer isso.",
    difficulty: "beginner",
    category: "Fundamentos SQL",
    xpReward: 100,
    estimatedTime: "5 min",
    status: "available",
    completionRate: 92,
    icon: "🔍",
    tags: ["SELECT", "WHERE", "básico"],
    createdAt: "2024-01-15",
    updatedAt: "2024-01-15",
  },
  {
    id: "2",
    title: "Mistério dos JOINs Quebrados",
    description: "Dados de pedidos e clientes estão separados.  Você precisa uni-los para resolver o caso.",
    difficulty: "intermediate",
    category: "JOINs e Relacionamentos",
    xpReward: 250,
    estimatedTime: "12 min",
    status: "available",
    completionRate: 67,
    icon: "🔗",
    tags: ["JOIN", "INNER JOIN", "relacionamentos"],
    createdAt: "2024-01-20",
    updatedAt: "2024-01-20",
  },
  // Add more mysteries...
];

export const mockMysteryDetail: MysteryDetail = {
  ... mockMysteries[0],
  storyIntro: "Era uma manhã chuvosa quando o detetive SQL recebeu um chamado urgente.. .",
  storyContext: "A empresa TechCorp perdeu acesso aos dados de seus clientes ativos. Você foi chamado para resolver este caso usando suas habilidades em SQL.",
  objectives: [
    "Encontrar todos os clientes com status 'ativo'",
    "Ordenar os resultados por nome",
    "Retornar apenas id, nome e email",
  ],
  hints: [
    {
      id: "1",
      order: 1,
      content: "Use a cláusula WHERE para filtrar registros",
      xpPenalty: 10,
    },
    {
      id: "2",
      order: 2,
      content: "A coluna 'status' contém o valor que você procura",
      xpPenalty: 15,
    },
  ],
  database: {
    tables: [
      {
        name: "clientes",
        description: "Tabela contendo informações dos clientes",
        columns: [
          {
            name: "id",
            type: "INTEGER",
            nullable: false,
            primaryKey: true,
            description: "Identificador único do cliente",
          },
          {
            name: "nome",
            type: "VARCHAR(100)",
            nullable: false,
            primaryKey: false,
            description: "Nome completo do cliente",
          },
          {
            name: "email",
            type: "VARCHAR(100)",
            nullable: false,
            primaryKey: false,
            description: "Email do cliente",
          },
          {
            name: "status",
            type: "VARCHAR(20)",
            nullable: false,
            primaryKey: false,
            description: "Status do cliente (ativo, inativo, suspenso)",
          },
        ],
        sampleData: [
          { id: 1, nome: "João Silva", email: "joao@email.com", status: "ativo" },
          { id: 2, nome: "Maria Santos", email: "maria@email.com", status: "inativo" },
        ],
      },
    ],
    relationships: [],
  },
  expectedOutput: {
    columns: ["id", "nome", "email"],
    rows: [
      { id: 1, nome: "João Silva", email: "joao@email.com" },
      { id: 3, nome: "Pedro Costa", email: "pedro@email. com" },
    ],
  },
  testCases: [
    {
      id: "1",
      description: "Deve retornar apenas clientes ativos",
      expectedResult: {
        columns: ["id", "nome", "email"],
        rows: [
          { id: 1, nome: "João Silva", email: "joao@email. com" },
        ],
      },
      weight: 100,
    },
  ],
};