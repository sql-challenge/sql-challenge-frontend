export type DifficultyLevel = "beginner" | "intermediate" | "advanced" | "expert";

export type MysteryStatus = "available" | "completed" | "locked";

export interface Mystery {
  id: string;
  title: string;
  description: string;
  difficulty: DifficultyLevel;
  category: string;
  xpReward: number;
  estimatedTime: string;
  status: MysteryStatus;
  completionRate: number;
  icon: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface MysteryDetail extends Mystery {
  storyIntro: string;
  storyContext: string;
  objectives: string[];
  hints: MysteryHint[];
  database: MysteryDatabase;
  solution: MysterySolution;
}

export interface MysteryHint {
  id: string;
  order: number;
  content: string;
  xpPenalty: number;
}

export interface MysteryDatabase {
  tables: MysteryTable[];
  relationships: MysteryRelationship[];
}

export interface MysteryTable {
  name: string;
  description: string;
  columns: MysteryColumn[];
  sampleData: Record<string, unknown>[];
}

export interface MysteryColumn {
  name: string;
  type: string;
  nullable: boolean;
  primaryKey: boolean;
  description: string;
}

export interface MysteryRelationship {
  fromTable: string;
  toTable: string;
  type: "one-to-one" | "one-to-many" | "many-to-many";
  fromColumn: string;
  toColumn: string;
}

export interface MysterySolution {
  query: string;
  columns: string[];
  expectedRows: Record<string, unknown>[];
}
