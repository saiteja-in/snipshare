"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import {
  nightOwl,
  gruvboxLight,
} from "react-syntax-highlighter/dist/esm/styles/prism";

interface CodePreviewProps {
  code: string;
  language: string;
}

export function CodePreview({ code, language }: CodePreviewProps) {
  const { theme } = useTheme();
  const [copied, setCopied] = useState(false);

  const copy = () => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative rounded-lg border">
      <div className="flex items-center justify-between border-b px-4 py-2">
        <span className="text-sm font-medium">Preview</span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 space-x-2"
          onClick={copy}
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
          <span>{copied ? "Copied!" : "Copy code"}</span>
        </Button>
      </div>
      <div className="overflow-x-auto p-4">
        <SyntaxHighlighter
          language={language?.toLowerCase() || "plaintext"}
          style={theme === "dark" ? nightOwl : gruvboxLight}
          customStyle={{
            margin: 0,
            background: "transparent",
            minHeight: "300px",
          }}
          showLineNumbers={true}
          wrapLines={true}
          lineProps={(lineNumber) => ({
            style: {
              display: "block",
              width: "100%",
            },
          })}
        >
          {code || "// Your code preview will appear here"}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}