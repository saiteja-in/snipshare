import prettier from "prettier/standalone";
import parserBabel from "prettier/parser-babel";
import parserHtml from "prettier/parser-html";
import parserPostcss from "prettier/parser-postcss";
import parserTypescript from "prettier/parser-typescript";
import parserMarkdown from "prettier/parser-markdown";
import phpPlugin from "@prettier/plugin-php/standalone";

const PARSERS: Record<string, any> = {
  javascript: { parser: "babel", plugin: parserBabel },
  typescript: { parser: "typescript", plugin: parserTypescript },
  html: { parser: "html", plugin: parserHtml },
  css: { parser: "css", plugin: parserPostcss },
  markdown: { parser: "markdown", plugin: parserMarkdown },
  php: { parser: "php", plugin: phpPlugin },
};

export async function formatCode(code: string, language: string): Promise<string> {
  const parserConfig = PARSERS[language];
  
  if (!parserConfig) {
    throw new Error(`Formatting not supported for ${language}`);
  }

  return prettier.format(code, {
    parser: parserConfig.parser,
    plugins: [parserConfig.plugin],
    semi: true,
    singleQuote: true,
    printWidth: 80,
    tabWidth: 2,
    trailingComma: "es5",
  });
}