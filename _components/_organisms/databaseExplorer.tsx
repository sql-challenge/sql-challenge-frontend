"use client";

import { useState } from "react";
import { Badge } from "@/_components/_atoms/badge";
import { Divider } from "@/_components/_atoms/divider";
import type { DatabaseSchema, Table } from "@/_lib/types/mystery";
import { ChevronDown, ChevronRight, Database } from "feather-icons-react";

interface DatabaseExplorerProps {
  database: DatabaseSchema;
}

export function DatabaseExplorer({ database }: DatabaseExplorerProps) {
  const [expandedTables, setExpandedTables] = useState<string[]>([]);

  const toggleTable = (tableName: string) => {
    setExpandedTables((prev) =>
      prev.includes(tableName)
        ? prev.filter((name) => name !== tableName)
        : [...prev, tableName]
    );
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Database className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-bold text-foreground">
          Estrutura do Banco de Dados
        </h3>
      </div>

      <p className="text-sm text-muted-foreground">
        Explore as tabelas e colunas disponíveis para resolver o mistério. 
      </p>

      <Divider />

      {/* Tables List */}
      <div className="space-y-3">
        {database.tables.map((table) => (
          <TableCard
            key={table.name}
            table={table}
            isExpanded={expandedTables.includes(table.name)}
            onToggle={() => toggleTable(table.name)}
          />
        ))}
      </div>

      {/* Relationships */}
      {database.relationships.length > 0 && (
        <>
          <Divider />
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xl">🔗</span>
              <h4 className="text-sm font-semibold text-foreground">
                Relacionamentos
              </h4>
            </div>
            <div className="space-y-2">
              {database. relationships.map((rel, index) => (
                <div
                  key={index}
                  className="bg-secondary/50 rounded-lg p-3 text-xs font-mono"
                >
                  <span className="text-primary">{rel.fromTable}</span>
                  <span className="text-muted-foreground">. {rel.fromColumn}</span>
                  <span className="text-accent mx-2">→</span>
                  <span className="text-primary">{rel.toTable}</span>
                  <span className="text-muted-foreground">.{rel.toColumn}</span>
                  <Badge variant="outline" className="ml-2 text-[10px]">
                    {rel.type}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

interface TableCardProps {
  table: Table;
  isExpanded: boolean;
  onToggle: () => void;
}

function TableCard({ table, isExpanded, onToggle }: TableCardProps) {
  return (
    <div className="border border-border rounded-lg overflow-hidden bg-card">
      {/* Table Header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-3 hover:bg-secondary/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          )}
          <span className="font-mono text-sm font-semibold text-primary">
            {table.name}
          </span>
          <Badge variant="outline" className="text-xs">
            {table. columns.length} colunas
          </Badge>
        </div>
      </button>

      {/* Table Description */}
      {table.description && (
        <div className="px-3 pb-2">
          <p className="text-xs text-muted-foreground">{table.description}</p>
        </div>
      )}

      {/* Columns */}
      {isExpanded && (
        <div className="border-t border-border">
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left p-2 font-semibold text-foreground">
                    Coluna
                  </th>
                  <th className="text-left p-2 font-semibold text-foreground">
                    Tipo
                  </th>
                  <th className="text-left p-2 font-semibold text-foreground">
                    Propriedades
                  </th>
                </tr>
              </thead>
              <tbody>
                {table.columns.map((column) => (
                  <tr
                    key={column.name}
                    className="border-t border-border/50 hover:bg-secondary/30"
                  >
                    <td className="p-2">
                      <div className="flex flex-col gap-1">
                        <span className="font-mono text-foreground font-medium">
                          {column.name}
                        </span>
                        {column.description && (
                          <span className="text-muted-foreground text-[10px]">
                            {column.description}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-2">
                      <code className="text-accent text-[11px]">
                        {column.type}
                      </code>
                    </td>
                    <td className="p-2">
                      <div className="flex gap-1 flex-wrap">
                        {column.primaryKey && (
                          <Badge variant="primary" className="text-[9px] px-1. 5 py-0.5">
                            PK
                          </Badge>
                        )}
                        {column.foreignKey && (
                          <Badge variant="success" className="text-[9px] px-1.5 py-0.5">
                            FK
                          </Badge>
                        )}
                        {! column.nullable && (
                          <Badge variant="warning" className="text-[9px] px-1.5 py-0.5">
                            NOT NULL
                          </Badge>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Sample Data */}
          {table.sampleData && table.sampleData.length > 0 && (
            <div className="border-t border-border p-3 bg-muted/20">
              <p className="text-xs font-semibold text-foreground mb-2">
                📊 Dados de Exemplo:
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-secondary/50">
                      {table.columns.map((column) => (
                        <th
                          key={column.name}
                          className="text-left p-2 font-mono text-[10px] font-semibold text-foreground"
                        >
                          {column.name}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {table.sampleData.slice(0, 3).map((row, rowIndex) => (
                      <tr key={rowIndex} className="border-t border-border/30">
                        {table.columns.map((column) => (
                          <td
                            key={column.name}
                            className="p-2 font-mono text-[10px] text-muted-foreground"
                          >
                            {String(row[column.name] ??  "NULL")}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {table.sampleData.length > 3 && (
                <p className="text-[10px] text-muted-foreground mt-2 italic">
                  ...  e mais {table.sampleData.length - 3} linhas
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}