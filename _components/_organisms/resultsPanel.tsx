import type { QueryResult } from "@/_lib/types/mystery";

interface ResultsPanelProps {
  results: QueryResult | null;
  error: string | null;
  isRunning: boolean;
}

export function ResultsPanel({ results, error, isRunning }: ResultsPanelProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold text-foreground">Resultados</h2>
      </div>

      <div className="flex-1 overflow-auto p-4">
        {isRunning && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Executando query...</p>
            </div>
          </div>
        )}

        {error && ! isRunning && (
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
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
                  <tr className="border-b border-border">
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
            <p className="text-sm text-muted-foreground">
              Execute uma query para ver os resultados
            </p>
          </div>
        )}
      </div>
    </div>
  );
}