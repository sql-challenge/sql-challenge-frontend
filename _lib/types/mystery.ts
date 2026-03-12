export type DifficultyLevel = "beginner" | "intermediate" | "advanced" | "expert";

export type MysteryStatus = "finished" | "available"; // can change!

export interface Hint {
  id: string;
  order: number;
  content: string;
  xpPenalty: number;
}

export interface DatabaseSchema { // adapt on management of database schemas
  tables: Table[];
  relationships: Relationship[];
}

export interface Table {
  name: string;
  description: string;
  columns: Column[];
  sampleData: Record<string, unknown>[];
}

export interface Column {
  name: string;
  type: string;
  nullable: boolean;
  primaryKey: boolean;
  foreignKey?: {
    table: string;
    column: string;
  };
  description: string;
}

export interface Relationship {
  fromTable: string;
  toTable: string;
  type: "one-to-one" | "one-to-many" | "many-to-many";
  fromColumn: string;
  toColumn: string;
}

export interface QueryResult {
  columns: string[];
  rows: Record<string, unknown>[];
}

export interface TestCase {
  id: string;
  description: string;
  expectedResult: QueryResult;
  weight: number; // percentage of total score
}

export interface UserMysteryProgress {
  mysteryId: string;
  userId: string;
  status: MysteryStatus;
  attempts: number;
  hintsUsed: number;
  currentQuery: string;
  startedAt?: string;
  completedAt?: string;
  timeSpent: number; // in seconds
  score?: number;
}