"use client";

import { useState } from "react";
import { Badge } from "@/_components/_atoms/badge";
import { Divider } from "@/_components/_atoms/divider";
import { DatabaseSchema, VisaoTabela } from "@/_lib/types/capitulo";
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
        {database.visaoTabelas.map((table) => (
          <TableCard
            key={table.nome}
            table={table}
            isExpanded={expandedTables.includes(table.nome)}
            onToggle={() => toggleTable(table.nome)}
          />
        ))}
      </div>

      {/* Relationships */}
      {database.visaoRelacionamentos.length > 0 && (
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
              {database.visaoRelacionamentos.map((rel, index) => (
                <div
                  key={index}
                  className="bg-secondary/50 rounded-lg p-3 text-xs font-mono"
                >
                  <span className="text-primary">{rel.tabela_origem}</span>
                  <span className="text-muted-foreground">. {rel.coluna_origem}</span>
                  <span className="text-accent mx-2">→</span>
                  <span className="text-primary">{rel.tabela_destino}</span>
                  <span className="text-muted-foreground">.{rel.coluna_destino}</span>
                  <Badge variant="outline" className="ml-2 text-[10px]">
                    {rel.tipo}
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
  table: VisaoTabela;
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
            {table.nome}
          </span>
          <Badge variant="outline" className="text-xs">
            {table.colunas.length} colunas
          </Badge>
        </div>
      </button>

      {/* Table Description */}
      {table.descricao && (
        <div className="px-3 pb-2">
          <p className="text-xs text-muted-foreground">{table.descricao}</p>
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
                {table.colunas.map((column) => (
                  <tr
                    key={column.nome}
                    className="border-t border-border/50 hover:bg-secondary/30"
                  >
                    <td className="p-2">
                      <div className="flex flex-col gap-1">
                        <span className="font-mono text-foreground font-medium">
                          {column.nome}
                        </span>
                        {column.descricao && (
                          <span className="text-muted-foreground text-[10px]">
                            {column.descricao}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-2">
                      <code className="text-accent text-[11px]">
                        {column.tipo}
                      </code>
                    </td>
                    <td className="p-2">
                      <div className="flex gap-1 flex-wrap">
                        {column.chave_primaria && (
                          <Badge variant="primary" className="text-[9px] px-1. 5 py-0.5">
                            PK
                          </Badge>
                        )}
                        {column.fk_tabela && (
                          <Badge variant="success" className="text-[9px] px-1.5 py-0.5">
                            FK
                          </Badge>
                        )}
                        {! column.nulavel && (
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
          {table.exemplos && table.exemplos.length > 0 && (
            <div className="border-t border-border p-3 bg-muted/20">
              <p className="text-xs font-semibold text-foreground mb-2">
                📊 Dados de Exemplo:
              </p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-secondary/50">
                      {table.colunas.map((column) => (
                        <th
                          key={column.nome}
                          className="text-left p-2 font-mono text-[10px] font-semibold text-foreground"
                        >
                          {column.nome}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {table.exemplos.slice(0, 3).map((row, rowIndex) => (
                      <tr key={rowIndex} className="border-t border-border/30">
                        {table.colunas.map((column) => (
                          <td
                            key={column.nome}
                            className="p-2 font-mono text-[10px] text-muted-foreground"
                          >
                            {String(row.dados || "NULL")}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {table.exemplos.length > 3 && (
                <p className="text-[10px] text-muted-foreground mt-2 italic">
                  ...  e mais {table.exemplos.length - 3} linhas
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}