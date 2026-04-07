"use client"
// eslint-disable-next-line @typescript-eslint/no-require-imports
const initSqlJs = require("sql.js");
import type { DatabaseSchema, QueryResult } from "@/_lib/types/capitulo";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let SQL: any = null;

// Alternative initialization with CDN
export async function initializeSqlJs() {
  if (!SQL) {
    try {
      // Try local first
      SQL = await initSqlJs({
        locateFile: () => `/sql-wasm.wasm`,
      });
    } catch (error) {
      console.warn("Failed to load local sql.js, trying CDN...", error);
      // Fallback to CDN
      SQL = await initSqlJs({
        locateFile: (f: string) => `https://sql.js.org/dist/${f}`,
      });
    }
  }
  return SQL;
}

export class SqlDatabase {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private db: any = null;
  private isInitialized: boolean = false;

  constructor() { }

  async initialize(): Promise<void> {
    try {
      if (!SQL) {
        await initializeSqlJs();
      }

      if (this.db) {
        // console.log("Closing existing database");
        this.db.close();
      }

      this.db = new SQL.Database();
      this.isInitialized = true;
      console.log("Database instance created");
    } catch (error) {
      console.error("Failed to initialize database:", error);
      throw new Error(
        `Database initialization failed: ${error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  async loadSchema(schema: DatabaseSchema): Promise<void> {
    if (!this.db || !this.isInitialized) {
      throw new Error("Database not initialized. Call initialize() first.");
    }

    const normalizeType = (tipo: string): string =>
      tipo.toUpperCase()
        .replace("BIGSERIAL", "INTEGER")
        .replace("SERIAL", "INTEGER")
        .replace("BIGINT", "INTEGER")
        .replace("BOOLEAN", "INTEGER")
        .replace("JSONB", "TEXT")
        .replace("TIMESTAMP", "TEXT")
        .replace("DATE", "TEXT")
        .replace(/VARCHAR(\(\d+\))?/, "TEXT")
        .replace(/DECIMAL(\(\d+,\d+\))?/, "REAL");

    try {
      this.db.run("BEGIN TRANSACTION;");

      for (const table of schema.visaoTabelas) {
        if (!table.colunas || table.colunas.length === 0) continue;

        const columns = table.colunas.map((col) => {
          let def = `"${col.nome}" ${normalizeType(col.tipo)}`;
          if (col.chave_primaria) def += " PRIMARY KEY";
          else if (!col.nulavel) def += " NOT NULL";
          return def;
        });

        const createTableSQL = `CREATE TABLE "${table.nome}" (${columns.join(", ")});`;
        this.db.run(createTableSQL);

        if (table.exemplos && table.exemplos.length > 0) {
          for (const exemplo of table.exemplos) {
            const row = exemplo.dados;
            const columnNames = Object.keys(row);
            if (columnNames.length === 0) continue;

            const values = columnNames.map((key) => {
              const val = row[key];
              if (val === null || val === undefined) return "NULL";
              if (typeof val === "boolean") return val ? "1" : "0";
              if (typeof val === "string") return `'${val.replace(/'/g, "''")}'`;
              return String(val);
            });

            const colList = columnNames.map(c => `"${c}"`).join(", ");
            const insertSQL = `INSERT INTO "${table.nome}" (${colList}) VALUES (${values.join(", ")});`;
            this.db.run(insertSQL);
          }
        }
      }

      this.db.run("COMMIT;");
    } catch (error) {
      try { this.db.run("ROLLBACK;"); } catch { /* ignore */ }
      console.error("Error loading schema:", error);
      throw error;
    }
  }

  executeQuery(query: string): QueryResult {
    if (!this.db || !this.isInitialized) {
      console.error("Database not initialized");
      throw new Error("Database not initialized. Call initialize() first.");
    }

    try {
      const cleanQuery = query.trim();

      if (!cleanQuery) {
        throw new Error("Empty query");
      }

      console.log("Executing SQL:", cleanQuery);

      // Execute the query
      const results = this.db.exec(cleanQuery);
      // console.log("Raw SQL.js results:", results);

      // Handle queries that don't return data (INSERT, UPDATE, DELETE, CREATE, etc.)
      if (!results || results.length === 0) {
        const upperQuery = cleanQuery.toUpperCase();
        if (
          upperQuery.startsWith("INSERT") ||
          upperQuery.startsWith("UPDATE") ||
          upperQuery.startsWith("DELETE") ||
          upperQuery.startsWith("CREATE") ||
          upperQuery.startsWith("DROP") ||
          upperQuery.startsWith("ALTER")
        ) {
          const changes = this.db.getRowsModified();
          return {
            columns: ["message"],
            rows: [
              {
                message: `Query executada com sucesso. ${changes} linha(s) afetada(s).`,
              },
            ],
          };
        }

        // For SELECT queries that return no results
        return {
          columns: [],
          rows: [],
        };
      }

      // Handle SELECT queries with results
      const result = results[0];

      // SQL.js can return either 'columns' or 'lc' (lowercase columns)
      const columns = result.columns || (result as { lc?: string[] }).lc || [];
      const values = result.values || [];

      if (!columns || columns.length === 0) {
        console.warn("Result missing columns:", result);
        return {
          columns: [],
          rows: [],
        };
      }

      if (!values || values.length === 0) {
        console.log("Query returned no rows");
        return {
          columns,
          rows: [],
        };
      }

      // Convert array of arrays to array of objects
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rows = values.map((row: any) => {
        const rowObj: Record<string, unknown> = {};
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        columns.forEach((col: any, index: any) => {
          rowObj[col] = row[index];
        });
        return rowObj;
      });

      // console.log("Processed result:", { columns, rowCount: rows.length, rows });
      return {
        columns,
        rows,
      };
    } catch (error) {
      console.error("Query execution error:", error);
      throw error;
    }
  }

  getTables(): string[] {
    if (!this.db || !this.isInitialized) {
      return [];
    }

    try {
      const result = this.db.exec(
        "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;"
      );

      if (result.length === 0) return [];

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return result[0].values.map((row: any) => row[0] as string);
    } catch (error) {
      console.error("Error getting tables:", error);
      return [];
    }
  }

  close(): void {
    if (this.db) {
      console.log("Closing database");
      this.db.close();
      this.db = null;
      this.isInitialized = false;
    }
  }

  isReady(): boolean {
    const ready = this.isInitialized && this.db !== null;
    return ready;
  }

  verifyData(tableName: string): number {
    if (!this.db || !this.isInitialized) {
      return 0;
    }

    try {
      const result = this.db.exec(`SELECT COUNT(*) FROM ${tableName}`);
      return result[0]?.values[0]?.[0] as number || 0;
    } catch (error) {
      console.error("Error verifying data:", error);
      return 0;
    }
  }
}

// Singleton instance - use Map to store per-mystery databases
const databaseInstances = new Map<string, SqlDatabase>();

export function getDatabase(mysteryId?: string): SqlDatabase {
  const key = mysteryId || "default";

  if (!databaseInstances.has(key)) {
    console.log(`Creating new database instance for: ${key}`);
    databaseInstances.set(key, new SqlDatabase());
  }

  return databaseInstances.get(key)!;
}

export async function resetDatabase(
  schema: DatabaseSchema,
  mysteryId?: string
): Promise<SqlDatabase> {
  const db = getDatabase(mysteryId);
  await db.initialize();
  await db.loadSchema(schema);

  // Verify data was loaded
  const firstTable = schema.visaoTabelas[0]?.nome;
  if (firstTable) {
    const rowCount = db.verifyData(firstTable);
    console.log(`Verification: Table ${firstTable} has ${rowCount} rows`);
  }

  return db;
}

export function clearAllDatabases(): void {
  databaseInstances.forEach((db) => db.close());
  databaseInstances.clear();
  console.log("All databases cleared");
}