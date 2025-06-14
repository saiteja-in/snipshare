import { LANGUAGES } from "@/types/form";
import { toast } from "sonner";
export const isFormattingSupported = (language: string) => {
  const normalizedLanguage = language?.toLowerCase();
  return (
    normalizedLanguage === "javascript" ||
    normalizedLanguage === "typescript" ||
    normalizedLanguage === "html" ||
    normalizedLanguage === "css" ||
    normalizedLanguage === "markdown" ||
    normalizedLanguage === "php"
  );
};

// Function to detect code language using highlight.js
export const detectCodeLanguage = (code: string): string => {
  if (!code) return "";
  try {
    const result = hljs.highlightAuto(code);
    // Map highlight.js language names to our LANGUAGES array format
    const detectedLang = result.language;

    if (!detectedLang) return "";

    // Convert first letter to uppercase for consistency with our LANGUAGES array
    const formattedLang =
      detectedLang.charAt(0).toUpperCase() + detectedLang.slice(1);

    // Check if the detected language is in our list
    if (LANGUAGES.includes(formattedLang)) {
      return formattedLang;
    } else if (
      formattedLang.toLowerCase() === "jsx" ||
      formattedLang.toLowerCase() === "tsx"
    ) {
      return "JavaScript";
    } else {
      return "";
    }
  } catch (error) {
    console.error("Error detecting language:", error);
    return "";
  }
};
const getExtensionByName = (language: string): string => {
  if (!language) return ".txt";
  const lowercaseLang = language.toLowerCase();

  const extensionMap: Record<string, string> = {
    javascript: ".js",
    typescript: ".ts",
    python: ".py",
    java: ".java",
    css: ".css",
    "c++": ".cpp",
    ruby: ".rb",
    go: ".go",
    rust: ".rs",
    php: ".php",
    swift: ".swift",
    html: ".html",
  };

  return extensionMap[lowercaseLang] || ".txt";
};
const embedStackblitzProject = async (
  templateName: string,
  code: string,
  language: string,
  title: string,
  description: string
) => {
  try {
    // Import StackBlitz SDK dynamically to prevent server-side rendering issues
    const sdk = (await import("@stackblitz/sdk")).default;

    const extension = getExtensionByName(language);
    let files: { [fileName: string]: string } = {};

    // Create appropriate files based on template with better structure
    switch (templateName) {
      case "angular-cli":
        files = {
          "index.html": `<div id="app">Loading Angular app...</div>`,
          "main.ts": `import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { AppModule } from './app/app.module';

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));`,
          [`src/app/app.component${extension}`]: code,
        };
        break;
      case "create-react-app":
        files = {
          "public/index.html": `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title || "React App"}</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>`,
          "src/index.js": `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);`,
          [`src/App${extension}`]: code,
        };
        break;
      case "html":
        files = {
          "index.html": `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title || "HTML Snippet"}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    }
  </style>
</head>
<body>
  ${language?.toLowerCase() === "html" ? code : '<div id="app"></div>'}
</body>
${language?.toLowerCase() !== "html" ? `<script src="./script${extension}"></script>` : ""}
</html>`,
          ...(language?.toLowerCase() !== "html"
            ? { [`script${extension}`]: code }
            : {}),
        };
        break;
      case "javascript":
        files = {
          "index.html": `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title || "JavaScript Snippet"}</title>
</head>
<body>
  <div id="app">Open the console to see the output</div>
  <script src="./index.js"></script>
</body>
</html>`,
          "index.js": code,
        };
        break;
      case "typescript":
        files = {
          "index.html": `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title || "TypeScript Snippet"}</title>
</head>
<body>
  <div id="app">Open the console to see the output</div>
  <script src="./index.ts"></script>
</body>
</html>`,
          "index.ts": code,
        };
        break;
      case "vue":
        files = {
          "public/index.html": `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>${title || "Vue Snippet"}</title>
</head>
<body>
  <div id="app"></div>
</body>
</html>`,
          "src/main.js": `import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')`,
          "src/App.vue": code,
        };
        break;
      case "node":
        files = {
          "index.js": code,
          "package.json": `{
  "name": "${title?.toLowerCase().replace(/\s+/g, "-") || "node-snippet"}",
  "version": "1.0.0",
  "description": "${description || "A Node.js snippet"}",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  }
}`,
        };
        break;
      case "polymer":
        files = {
          "index.html": `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title || "Polymer Snippet"}</title>
  <script src="https://unpkg.com/@webcomponents/webcomponentsjs@2.5.0/webcomponents-loader.js"></script>
  <script type="module">
    import { PolymerElement, html } from 'https://unpkg.com/@polymer/polymer/polymer-element.js?module';
  </script>
</head>
<body>
  <div id="app"></div>
  <script>
    ${code}
  </script>
</body>
</html>`,
        };
        break;
      default:
        files = {
          "index.html": `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title || "Code Snippet"}</title>
</head>
<body>
  <div id="app">Code Snippet</div>
  <script src="./script${extension}"></script>
</body>
</html>`,
          [`script${extension}`]: code,
        };
    }

    // Create and embed the project
    sdk.embedProject(
      "stackblitz-container",
      {
        title: title || "Code Snippet",
        description: description || "Edit this code in StackBlitz",
        template: templateName as
          | "angular-cli"
          | "create-react-app"
          | "html"
          | "javascript"
          | "polymer"
          | "typescript"
          | "vue"
          | "node",
        files: files,
        settings: {
          compile: {
            trigger: "auto",
            clearConsole: false,
          },
        },
      },
      {
        height: 600,
        showSidebar: true,
        openFile: Object.keys(files)[Object.keys(files).length - 1], // Open the file with the code
        terminalHeight: 50,
        hideNavigation: false,
      }
    );
  } catch (error) {
    console.error("StackBlitz embedding error:", error);
    toast.error("Failed to open StackBlitz editor");
  }
};

export default embedStackblitzProject;
