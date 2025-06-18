"use client";

import React, { useEffect, useRef, useState } from "react";
import Editor, { OnMount } from "@monaco-editor/react";

type WSMessage = {
  file: string;
  code: string;
  ext?: string;
};

const extensionToLanguage: Record<string, string> = {
  js: "javascript",
  ts: "typescript",
  py: "python",
  java: "java",
  cpp: "cpp",
  c: "c",
  html: "html",
  css: "css",
  json: "json",
  // Add more as needed
};

const LiveCodeDemo: React.FC = () => {
  const [code, setCode] = useState<string>("");
  const [file, setFile] = useState<string>("");
  const [language, setLanguage] = useState<string>("javascript");
  const editorRef = useRef<any>(null);

  // Set up WebSocket and live updates
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8080");
    ws.onmessage = (event) => {
      const { file, code, ext }: WSMessage = JSON.parse(event.data);
      setCode(code);
      setFile(file);
      setLanguage(extensionToLanguage[ext || ""] || "plaintext");
      document.title = file;
    };
    return () => ws.close();
  }, []);

  // Update Monaco language when it changes
  const handleEditorMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
  };

  useEffect(() => {
    if (editorRef.current) {
      const model = editorRef.current.getModel();
      if (model) {
        // @ts-ignore
        window.monaco?.editor?.setModelLanguage(model, language);
      }
    }
  }, [language, code]);

  return (
    <div style={{ width: "100vw", height: "90vh" }}>
      <Editor
        height="90vh"
        defaultLanguage="javascript"
        language={language}
        value={code}
        options={{
          theme: "vs-dark",
          fontSize: 16,
          minimap: { enabled: false },
          automaticLayout: true,
        }}
        onMount={handleEditorMount}
      />
      <div style={{ padding: "0.5rem", background: "#222", color: "#fff" }}>
        {file}
      </div>
    </div>
  );
};

export default LiveCodeDemo;
