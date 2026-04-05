"use client";

import { useEffect, useRef, useState } from "react";
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
      console.log("No schema provided");
      setIsLoading(true);
      return;
    }

    // Check if schema actually changed
    if (schemaRef.current === schema && database?.isReady()) {
      console.log("Schema unchanged and database ready, skipping init");
      setIsLoading(false);
      return;
    }

    // Prevent double initialization
    if (initializingRef.current) {
      console.log("Already initializing, skipping");
      return;
    }

    schemaRef.current = schema;
    initializingRef.current = true;

    const initDatabase = async () => {
      setIsLoading(true);
      setError(null);

      try {
        console.log("Starting database initialization...");
        const db = await resetDatabase(schema);
        console.log("Database initialized and schema loaded");
        
        // Test query to verify data
        const testResult = db.executeQuery("SELECT COUNT(*) as count FROM " + schema.visaoTabelas[0].nome);
        // console.log("Test query result:", testResult);
        
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

    // Cleanup on unmount only
    return () => {
      console.log("Cleanup: Component unmounting");
      // Don't close the database here as it might be reused
    };
  }, [schema]); // Removed database from dependencies

  const executeQuery = (query: string): QueryResult => {
    if (!database || !database.isReady()) {
      console.error("Database not ready when trying to execute query");
      throw new Error("Database not ready");
    }
    
    // console.log("Executing query:", query);
    const result = database.executeQuery(query);
    // console.log("Query result:", result);
    return result;
  };

  return {
    database,
    executeQuery,
    isLoading,
    error,
    setSchema: (newSchema: DatabaseSchema) => {
      if (schemaRef.current === newSchema) {
        console.log("setSchema called with same schema, ignoring");
        return;
      }
      setSchema(newSchema);
    },
    isReady: database?.isReady() || false,
  };
}