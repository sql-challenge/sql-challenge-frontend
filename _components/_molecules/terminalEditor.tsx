'use client'

import { useState, useCallback } from "react"
import { Terminal, Play, Copy, Check } from "feather-icons-react"

interface Token {
  text: string
  color?: string
}

interface QueryExample {
  id: string
  label: string
  description: string
  code: Token[][]
  result: string
  columns: string[]
  rows: string[][]
}

const KEYWORD = "text-primary"
const STRING = "text-success"
const FUNCTION = "text-warning"
const COMMENT = "text-muted-foreground"
const NUMBER = "text-warning"
const OPERATOR = "text-ring"
const COLUMN = "text-accent"

const examples: QueryExample[] = [
  {
    id: "todos-casos",
    label: "Todos os Casos",
    description: "Filtre resultados com WHERE e ORDER BY",
    code: [
      [{ text: "SELECT ", color: KEYWORD }, { text: "titulo, data_crime, status, cidade" }],
      [{ text: "FROM ", color: KEYWORD }, { text: "casos" }],
      [{ text: "WHERE ", color: KEYWORD }, { text: "status = ", color: OPERATOR }, { text: "'aberto'", color: STRING }],
      [{ text: "ORDER BY ", color: KEYWORD }, { text: "data_crime ", color: COLUMN }, { text: "DESC", color: KEYWORD }],
      [{ text: "LIMIT ", color: KEYWORD }, { text: "5", color: NUMBER }, { text: ";", color: OPERATOR }],
    ],
    result: "5 casos encontrados (abertos).",
    columns: ["titulo", "data_crime", "status", "cidade"],
    rows: [
      ["O Caso do Criptógrafo", "2024-11-15", "aberto", "São Paulo"],
      ["Mistério do Banco de Dados", "2024-11-10", "aberto", "Rio de Janeiro"],
      ["Assalto ao Servidor", "2024-11-08", "aberto", "Belo Horizonte"],
      ["Invasão de Firewall", "2024-11-05", "aberto", "Curitiba"],
      ["O Enigma do SQL", "2024-11-01", "aberto", "Porto Alegre"],
    ],
  },
  {
    id: "juncoes",
    label: "Seguindo Pistas",
    description: "Relacione tabelas com JOIN",
    code: [
      [{ text: "SELECT ", color: KEYWORD }],
      [{ text: "  e.descricao, ", color: COLUMN }, { text: "l.nome ", color: COLUMN }, { text: "AS ", color: KEYWORD }, { text: "local", color: COLUMN }],
      [{ text: "FROM ", color: KEYWORD }, { text: "evidencias e" }],
      [{ text: "  JOIN ", color: KEYWORD }, { text: "locais l ", color: KEYWORD }, { text: "ON ", color: KEYWORD }, { text: "e.local_id = l.id", color: OPERATOR }],
      [{ text: "WHERE ", color: KEYWORD }, { text: "e.tipo = ", color: OPERATOR }, { text: "'digital'", color: STRING }],
      [{ text: "  AND ", color: KEYWORD }, { text: "l.cidade = ", color: OPERATOR }, { text: "'São Paulo'", color: STRING }, { text: ";", color: OPERATOR }],
    ],
    result: "3 evidências digitais em São Paulo.",
    columns: ["descricao", "local"],
    rows: [
      ["E-mail criptografado", "Escritório Central"],
      ["Log de acesso suspeito", "Servidor da Empresa"],
      ["Arquivo deletado", "Computador Pessoal"],
    ],
  },
  {
    id: "agregacoes",
    label: "Analisando Padrões",
    description: "Agrupe dados com GROUP BY",
    code: [
      [{ text: "SELECT ", color: KEYWORD }],
      [{ text: "  l.cidade, ", color: COLUMN }],
      [{ text: "  COUNT(*) ", color: FUNCTION }, { text: "AS ", color: KEYWORD }, { text: "total_casos,", color: COLUMN }],
      [{ text: "  ROUND(AVG(e.peso), ", color: FUNCTION }, { text: "2", color: NUMBER }, { text: ") ", color: FUNCTION }, { text: "AS ", color: KEYWORD }, { text: "media_peso", color: COLUMN }],
      [{ text: "FROM ", color: KEYWORD }, { text: "evidencias e" }],
      [{ text: "  JOIN ", color: KEYWORD }, { text: "locais l ", color: KEYWORD }, { text: "ON ", color: KEYWORD }, { text: "e.local_id = l.id", color: OPERATOR }],
      [{ text: "GROUP BY ", color: KEYWORD }, { text: "l.cidade", color: COLUMN }],
      [{ text: "HAVING ", color: KEYWORD }, { text: "COUNT(*) >= ", color: OPERATOR }, { text: "2", color: NUMBER }, { text: ";", color: OPERATOR }],
    ],
    result: "2 cidades com 2+ evidências.",
    columns: ["cidade", "total_casos", "media_provas"],
    rows: [
      ["São Paulo", "4", "3.50"],
      ["Rio de Janeiro", "2", "2.00"],
    ],
  },
]

export function TerminalEditor() {
  const [activeTab, setActiveTab] = useState(0)
  const [copied, setCopied] = useState(false)

  const example = examples[activeTab]

  const handleCopy = useCallback(() => {
    const text = example.code.map(line => line.map(t => t.text).join("")).join("\n")
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }).catch(() => {})
  }, [example])

  return (
    <div className="border-2 border-primary/40 bg-card shadow-pixel">
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-secondary border-b-2 border-primary/20">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            <div className="w-3 h-3 bg-destructive" />
            <div className="w-3 h-3 bg-warning" />
            <div className="w-3 h-3 bg-success" />
          </div>
          <span className="text-xs text-muted-foreground ml-3 tracking-wider uppercase">
            <span className="inline-flex items-center gap-1.5">
              <Terminal size={12} className="text-primary" />
              Terminal de Investiga&ccedil;&atilde;o
            </span>
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
          aria-label={copied ? "Copiado" : "Copiar query"}
        >
          {copied ? (
            <>
              <Check size={14} className="text-success" />
              <span className="text-success">Copiado</span>
            </>
          ) : (
            <>
              <Copy size={14} />
              <span>Copiar</span>
            </>
          )}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b-2 border-primary/10 bg-secondary/50 overflow-x-auto" role="tablist" aria-label="Exemplos de queries">
        {examples.map((ex, i) => (
          <button
            key={ex.id}
            role="tab"
            aria-selected={i === activeTab}
            onClick={() => setActiveTab(i)}
            className={`px-4 py-2 text-xs tracking-wide whitespace-nowrap transition-colors cursor-pointer border-b-2 -mb-[2px] ${
              i === activeTab
                ? "text-primary border-primary bg-primary/10"
                : "text-muted-foreground border-transparent hover:text-foreground"
            }`}
          >
            <span className="inline-flex items-center gap-1.5">
              {ex.label}
            </span>
          </button>
        ))}
      </div>

      {/* Code Area */}
      <div className="relative">
        {/* Description */}
        <div className="px-4 pt-3 pb-1">
          <p className="text-xs text-muted-foreground">
            <span className="text-primary">--</span> {example.description}
          </p>
        </div>

        {/* SQL Code */}
        <div className="px-4 py-3 overflow-x-auto">
          <pre className="text-sm leading-relaxed">
            {example.code.map((line, li) => (
              <div key={li} className="whitespace-pre">
                {li === example.code.length - 1 ? (
                  <>
                    <span className="text-muted-foreground/50 select-none">{`  `}</span>
                    {line.map((token, ti) => (
                      <span key={ti} className={token.color || "text-foreground"}>
                        {token.text}
                      </span>
                    ))}
                    <span className="inline-block w-2 h-[0.9em] ml-0.5 bg-primary align-text-bottom animate-blink-pixel" />
                  </>
                ) : (
                  <>
                    <span className="text-muted-foreground/50 select-none">{`  `}</span>
                    {line.map((token, ti) => (
                      <span key={ti} className={token.color || "text-foreground"}>
                        {token.text}
                      </span>
                    ))}
                  </>
                )}
              </div>
            ))}
          </pre>
        </div>

        {/* Result Area */}
        <div className="border-t-2 border-primary/10 bg-secondary/30">
          <div className="px-4 py-2 flex items-center gap-2">
            <Play size={12} className="text-success" />
            <span className="text-xs text-success/80">Resultado:</span>
            <span className="text-xs text-muted-foreground">{example.result}</span>
          </div>
          <div className="px-4 pb-4 overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b-2 border-primary/20">
                  {example.columns.map((col) => (
                    <th key={col} className="text-left py-1.5 pr-4 text-primary font-semibold tracking-wider uppercase">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {example.rows.map((row, ri) => (
                  <tr key={ri} className="border-b border-primary/10 last:border-0">
                    {row.map((cell, ci) => (
                      <td key={ci} className="py-1 pr-4 text-foreground/80">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
