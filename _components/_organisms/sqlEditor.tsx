"use client";

import CodeMirror from "@uiw/react-codemirror";
import { sql, SQLite } from "@codemirror/lang-sql";
import { useTheme } from "@/_context/themeProvider";

interface SqlEditorProps {
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
}

export function SqlEditor({ value, onChange, readOnly = false }: SqlEditorProps) {
  const {theme} = useTheme()
  //
  return (
    <div className="flex-1 relative border border-border overflow-hidden">
      <CodeMirror
        value={value}
        height="300px"
        extensions={[sql({ dialect: SQLite })]}
        theme={theme ?? "dark"}
        onChange={onChange}
        basicSetup={{
        lineNumbers: true,
          highlightActiveLineGutter: true,
          highlightSpecialChars: true,
          foldGutter: true,
          drawSelection: true,
          dropCursor: true,
          allowMultipleSelections: true,
          indentOnInput: true,
          bracketMatching: true,
          closeBrackets: true,
          autocompletion: true,
          rectangularSelection: true,
          crosshairCursor: true,
          highlightActiveLine: true,
          highlightSelectionMatches: true,
          closeBracketsKeymap: true,
          searchKeymap: true,
          foldKeymap: true,
          completionKeymap: true,
          lintKeymap: true,
        }}
        editable={!readOnly}
      />
    </div>
  );
}