"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { SqlDatabase, resetDatabase } from "@/_lib/services/sql";
import type { DatabaseSchema, QueryResult } from "@/_lib/types/capitulo";

export function useSqlDatabase(schemaArg: DatabaseSchema | null = null) {
  const [schema, setSchema] = useState<DatabaseSchema | null>(schemaArg);
  const [database, setDatabase] = useState<SqlDatabase | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const schemaRef = useRef<DatabaseSchema | null>(null);
  const initializingRef = useRef(false);

  // Initialize database when schema changes
  useEffect(() => {
    if (!schema) {
      setIsLoading(true);
      return;
    }

    if (schemaRef.current === schema && database?.isReady()) {
      setIsLoading(false);
      return;
    }

    if (initializingRef.current) {
      return;
    }

    schemaRef.current = schema;
    initializingRef.current = true;

    const initDatabase = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const db = await resetDatabase(schema);
        db.executeQuery("SELECT COUNT(*) as count FROM " + schema.visaoTabelas[0].nome);
        setDatabase(db);
      } catch (err) {
        console.error("Failed to initialize database:", err);
        setError(err instanceof Error ? err.message : "Failed to initialize database");
      } finally {
        setIsLoading(false);
        initializingRef.current = false;
      }
    };

    initDatabase();

    return () => {
      // Don't close the database here as it might be reused
    };
  }, [schema]); // Removed database from dependencies

  const executeQuery = (query: string): QueryResult => {
    if (!database || !database.isReady()) {
      console.error("Database not ready when trying to execute query");
      throw new Error("Database not ready");
    }
    
    return database.executeQuery(query);
  };

  const setSchemaStable = useCallback((newSchema: DatabaseSchema) => {
    if (schemaRef.current === newSchema) {
      return;
    }
    setSchema(newSchema);
  }, []);

  return {
    database,
    executeQuery,
    isLoading,
    error,
    setSchema: setSchemaStable,
    isReady: database?.isReady() || false,
  };
}