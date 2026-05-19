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

const KEYWORD = "text-purple-400"
const STRING = "text-green-400/90"
const FUNCTION = "text-amber-400/90"
const COMMENT = "text-muted-foreground italic"
const NUMBER = "text-amber-400"
const OPERATOR = "text-blue-400"
const COLUMN = "text-cyan-300"

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
    <div className="rounded-xl border-2 border-primary/30 bg-black/80 shadow-xl shadow-primary/10 overflow-hidden backdrop-blur-sm">
      {/* Terminal Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-black/40 border-b border-primary/20">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-destructive/80" />
            <div className="w-3 h-3 rounded-full bg-warning/80" />
            <div className="w-3 h-3 rounded-full bg-success/80" />
          </div>
          <span className="text-xs text-gray-400 font-mono ml-3 tracking-wider uppercase">
            <span className="inline-flex items-center gap-1.5">
              <Terminal size={12} className="text-primary" />
              Terminal de Investigação
            </span>
          </span>
        </div>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-200 transition-colors cursor-pointer"
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
      <div className="flex border-b border-primary/10 bg-black/20 overflow-x-auto" role="tablist" aria-label="Exemplos de queries">
        {examples.map((ex, i) => (
          <button
            key={ex.id}
            role="tab"
            aria-selected={i === activeTab}
            onClick={() => setActiveTab(i)}
            className={`px-4 py-2.5 text-xs font-mono tracking-wide whitespace-nowrap transition-colors cursor-pointer border-b-2 ${
              i === activeTab
                ? "text-primary border-primary bg-primary/10"
                : "text-gray-400 border-transparent hover:text-gray-200 hover:bg-white/5"
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
          <p className="text-xs text-gray-400 font-mono">
            <span className="text-primary">--</span> {example.description}
          </p>
        </div>

        {/* SQL Code */}
        <div className="px-4 py-3 overflow-x-auto">
          <pre className="font-mono text-sm leading-relaxed">
            {example.code.map((line, li) => (
              <div key={li} className="whitespace-pre">
                {li === example.code.length - 1 ? (
                  <>
                    <span className="text-muted-foreground/50 select-none">{`  `}</span>
                    {line.map((token, ti) => (
                      <span key={ti} className={token.color || "text-gray-200"}>
                        {token.text}
                      </span>
                    ))}
                    <span className="inline-block w-2 h-4 ml-0.5 bg-primary/70 animate-pulse align-text-bottom" />
                  </>
                ) : (
                  <>
                    <span className="text-muted-foreground/50 select-none">{`  `}</span>
                    {line.map((token, ti) => (
                      <span key={ti} className={token.color || "text-gray-200"}>
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
        <div className="border-t border-primary/10 bg-black/30">
          <div className="px-4 py-2 flex items-center gap-2">
            <Play size={12} className="text-success" />
            <span className="text-xs font-mono text-success/80">Resultado:</span>
            <span className="text-xs font-mono text-gray-400">{example.result}</span>
          </div>
          <div className="px-4 pb-4 overflow-x-auto">
            <table className="w-full text-xs font-mono">
              <thead>
                <tr className="border-b border-primary/20">
                  {example.columns.map((col) => (
                    <th key={col} className="text-left py-1.5 pr-4 text-primary/80 font-semibold tracking-wider uppercase">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {example.rows.map((row, ri) => (
                  <tr key={ri} className="border-b border-primary/5 last:border-0">
                    {row.map((cell, ci) => (
                      <td key={ci} className="py-1 pr-4 text-gray-300">
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
