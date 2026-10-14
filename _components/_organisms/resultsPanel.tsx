import type { QueryResult } from "@/_lib/types/capitulo";
import { Search } from "feather-icons-react";

interface ResultsPanelProps {
  results: QueryResult | null;
  error: string | null;
  isRunning: boolean;
}

export function ResultsPanel({ results, error, isRunning }: ResultsPanelProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="border-b-2 border-border px-3 sm:px-4 py-2 sm:py-3">
        <h2 className="text-xs sm:text-sm font-semibold text-foreground">Resultados</h2>
      </div>

      <div className="flex-1 overflow-auto p-3 sm:p-4" aria-live="polite" aria-atomic="true">
        {isRunning && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 mb-3">
                <span className="h-2.5 w-2.5 bg-primary animate-blink-pixel" />
                <span className="h-2.5 w-2.5 bg-primary animate-blink-pixel [animation-delay:200ms]" />
                <span className="h-2.5 w-2.5 bg-primary animate-blink-pixel [animation-delay:400ms]" />
              </div>
              <p className="text-sm text-muted-foreground">Executando query...</p>
            </div>
          </div>
        )}

        {error && ! isRunning && (
          <div className="border-2 border-destructive/30 bg-destructive/10 p-4">
            <p className="text-sm font-semibold text-destructive mb-1">Erro na Query</p>
            <p className="text-sm text-destructive/80 font-mono">{error}</p>
          </div>
        )}

        {results && ! isRunning && ! error && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {results.rows.length} {results.rows.length === 1 ? "linha" : "linhas"} retornadas
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b-2 border-border">
                    {results.columns.map((column) => (
                      <th
                        key={column}
                        className="text-left p-2 font-semibold text-foreground bg-muted/50"
                      >
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {results.rows.map((row, index) => (
                    <tr key={index} className="border-b border-border/50 hover:bg-muted/20">
                      {results.columns.map((column) => (
                        <td key={column} className="p-2 text-muted-foreground font-mono">
                          {String(row[column] ??  "NULL")}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {! results && !error && !isRunning && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Search className="w-6 h-6 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">
                Os dados estão esperando. Escreva uma query para investigar.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}