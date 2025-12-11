"use client";

import { useEffect, useRef } from "react";

interface SqlEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function SqlEditor({ value, onChange }: SqlEditorProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [value]);

  return (
    <div className="flex-1 relative">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="-- Digite sua query SQL aqui&#10;SELECT * FROM tabela WHERE condicao = 'valor';"
        className="w-full h-full min-h-[200px] p-4 bg-background border-0 focus:outline-none focus:ring-0 font-mono text-sm text-foreground resize-none"
        spellCheck={false}
      />
    </div>
  );
}