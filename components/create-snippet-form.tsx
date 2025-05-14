"use client";

import { useState, useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X, Copy, Check, Wand2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CodePreview } from "@/components/snippet/code-preview";
import { createSnippet } from "@/actions/snippet";
import { formatCode } from "@/lib/code-formatter";
import { ExtendedUser } from "@/schemas";
import { CreateSnippetSchema, SnippetFormData } from "@/schemas/snippet";
import { Icons } from "./icons";
import { useRouter } from "nextjs-toploader/app";
import hljs from "highlight.js";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const LANGUAGES = [
  "JavaScript",
  "TypeScript",
  "Python",
  "Java",
  "CSS",
  "C++",
  "Ruby",
  "Go",
  "Rust",
  "PHP",
  "Swift",
];

const FRAMEWORKS = [
  "React",
  "Vue",
  "Angular",
  "Next.js",
  "Nuxt",
  "Svelte",
  "Express",
  "Django",
  "Spring",
  "Laravel",
];

const CATEGORIES = [
  "Utility Functions",
  "Components",
  "Hooks",
  "Algorithms",
  "Data Structures",
  "API",
  "Database",
  "Authentication",
  "Testing",
  "DevOps",
];

// Templates for StackBlitz
const TEMPLATES = [
  { name: "angular-cli", label: "Angular" },
  { name: "create-react-app", label: "React" },
  { name: "html", label: "HTML" },
  { name: "javascript", label: "JavaScript" },
  { name: "polymer", label: "Polymer" },
  { name: "typescript", label: "TypeScript" },
  { name: "vue", label: "Vue" },
  { name: "node", label: "Node.js" },
];

// Map languages to appropriate StackBlitz templates
const LANGUAGE_TO_TEMPLATE_MAP: Record<string, string> = {
  "JavaScript": "javascript",
  "TypeScript": "typescript",
  "HTML": "html",
  "CSS": "html", // CSS usually goes with HTML
  "Python": "node", // Fallback to node for Python
  "Java": "node", // Fallback to node for Java
  "C++": "node", // Fallback to node for C++
  "Ruby": "node", // Fallback to node for Ruby
  "Go": "node", // Fallback to node for Go
  "Rust": "node", // Fallback to node for Rust
  "PHP": "node", // Fallback to node for PHP
  "Swift": "node", // Fallback to node for Swift
};

// Function to check if formatting is supported for a language
const isFormattingSupported = (language: string) => {
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
const detectCodeLanguage = (code: string): string => {
  if (!code) return "";
  try {
    const result = hljs.highlightAuto(code);
    // Map highlight.js language names to our LANGUAGES array format
    const detectedLang = result.language;
    
    if (!detectedLang) return "";
    
    // Convert first letter to uppercase for consistency with our LANGUAGES array
    const formattedLang = detectedLang.charAt(0).toUpperCase() + detectedLang.slice(1);
    
    // Check if the detected language is in our list
    if (LANGUAGES.includes(formattedLang)) {
      return formattedLang;
    } else if (formattedLang.toLowerCase() === "jsx" || formattedLang.toLowerCase() === "tsx") {
      return "JavaScript";
    } else {
      return "";
    }
  } catch (error) {
    console.error("Error detecting language:", error);
    return "";
  }
};

// Function to get extension by language name for StackBlitz
const getExtensionByName = (language: string): string => {
  if (!language) return ".txt";
  const lowercaseLang = language.toLowerCase();
  
  const extensionMap: Record<string, string> = {
    "javascript": ".js",
    "typescript": ".ts",
    "python": ".py",
    "java": ".java",
    "css": ".css",
    "c++": ".cpp",
    "ruby": ".rb",
    "go": ".go",
    "rust": ".rs",
    "php": ".php",
    "swift": ".swift",
    "html": ".html",
  };
  
  return extensionMap[lowercaseLang] || ".txt";
};

// Function to embed StackBlitz project with improved project structure
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
${language?.toLowerCase() !== "html" ? `<script src="./script${extension}"></script>` : ''}
</html>`,
          ...(language?.toLowerCase() !== "html" ? { [`script${extension}`]: code } : {})
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
  "name": "${title?.toLowerCase().replace(/\s+/g, '-') || "node-snippet"}",
  "version": "1.0.0",
  "description": "${description || "A Node.js snippet"}",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  }
}`
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
        template: templateName as "angular-cli" | "create-react-app" | "html" | "javascript" | "polymer" | "typescript" | "vue" | "node",
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

interface CreateSnippetFormProps {
  user: ExtendedUser;
}

export function CreateSnippetForm({ user }: CreateSnippetFormProps) {
  const router = useRouter();
  const [tagInput, setTagInput] = useState("");
  const [stackBlitzTemplate, setStackBlitzTemplate] = useState("javascript");
  const [showStackBlitzEditor, setShowStackBlitzEditor] = useState(false);
  const [isStackBlitzDialogOpen, setIsStackBlitzDialogOpen] = useState(false);
  const [hasEditorLoaded, setHasEditorLoaded] = useState(false);
  const editorInitializedRef = useRef(false);

  const form = useForm<SnippetFormData>({
    resolver: zodResolver(CreateSnippetSchema),
    defaultValues: {
      title: "",
      description: "",
      code: "",
      language: "",
      framework: "",
      category: "",
      tags: [],
      isPublic: true,
    },
  });

  const { isSubmitting } = form.formState;
  const code = form.watch("code");
  const language = form.watch("language");
  const title = form.watch("title");
  const description = form.watch("description");
  const isPublic = form.watch("isPublic");

  // Auto-detect language when code changes
  useEffect(() => {
    if (code && !language) {
      const detectedLanguage = detectCodeLanguage(code);
      if (detectedLanguage) {
        form.setValue("language", detectedLanguage);
      }
    }
  }, [code, language, form]);

  // Get the appropriate StackBlitz template when language changes
  useEffect(() => {
    if (language) {
      const bestTemplate = LANGUAGE_TO_TEMPLATE_MAP[language] || "javascript";
      setStackBlitzTemplate(bestTemplate);
    }
  }, [language]);

  // Reset editor status when dialog closes
  useEffect(() => {
    if (!isStackBlitzDialogOpen) {
      setHasEditorLoaded(false);
      editorInitializedRef.current = false;
    }
  }, [isStackBlitzDialogOpen]);

  // Auto-load the editor when dialog opens
  useEffect(() => {
    if (isStackBlitzDialogOpen && !hasEditorLoaded) {
      loadEditor();
    }
  }, [isStackBlitzDialogOpen, hasEditorLoaded]);

  const onSubmit = async (data: SnippetFormData) => {
    try {
      const result = await createSnippet(data);
      
      if (result.error) {
        return toast.error(result.error);
      }
      
      toast.success("Snippet created successfully");
      
      if (result.snippet) {
        router.push(`/snippets/${result.snippet.id}`);
      }
      router.refresh();
    } catch (error) {
      toast.error("Failed to create snippet");
    }
  };

  const addTag = (tag: string) => {
    const currentTags = form.getValues("tags");
    if (tag && !currentTags.includes(tag) && currentTags.length < 5) {
      form.setValue("tags", [...currentTags, tag]);
      setTagInput("");
    } else if (currentTags.length >= 5) {
      toast.error("Maximum 5 tags allowed");
    }
  };

  const removeTag = (tagToRemove: string) => {
    const currentTags = form.getValues("tags");
    form.setValue(
      "tags",
      currentTags.filter((tag) => tag !== tagToRemove)
    );
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addTag(tagInput.trim());
    }
  };

  const handleFormatCode = async () => {
    const currentCode = form.getValues("code");
    const currentLanguage = form.getValues("language")?.toLowerCase();

    if (!currentCode || !currentLanguage) return;

    if (!isFormattingSupported(currentLanguage)) {
      toast.error(`Formatting not supported for ${form.getValues("language")}`);
      return;
    }

    try {
      const formatted = await formatCode(currentCode, currentLanguage);
      form.setValue("code", formatted);
      toast.success("Code formatted successfully");
    } catch (error) {
      console.error("Format error:", error);
      toast.error("Failed to format code. Make sure the code is valid.");
    }
  };

  const loadEditor = () => {
    setShowStackBlitzEditor(true);
    setHasEditorLoaded(true);
    
    // Initialize editor with a slight delay to ensure DOM elements are ready
    setTimeout(() => {
      embedStackblitzProject(
        stackBlitzTemplate,
        code,
        language,
        title || "Code Snippet",
        description || "Edit your code in StackBlitz"
      );
      editorInitializedRef.current = true;
    }, 200);
  };

  const handleDialogOpen = () => {
    setIsStackBlitzDialogOpen(true);
    // The editor will auto-load due to the useEffect hook
  };

  const handleTemplateChange = (newTemplate: string) => {
    setStackBlitzTemplate(newTemplate);
    // Reload the editor with the new template
    setTimeout(() => {
      embedStackblitzProject(
        newTemplate,
        code,
        language,
        title || "Code Snippet",
        description || "Edit your code in StackBlitz"
      );
    }, 100);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6"
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input
                    placeholder="Enter a descriptive title"
                    {...field}
                  />
                  <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
                    {field.value.length}/100
                  </div>
                </div>
              </FormControl>
              <FormDescription>
                A clear title that describes what your code does
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <div className="relative">
                  <Textarea
                    placeholder="Describe what your code snippet does"
                    className="min-h-[100px]"
                    {...field}
                  />
                  <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
                    {field.value.length}/2000
                  </div>
                </div>
              </FormControl>
              <FormDescription>
                Explain how to use the code and what problem it solves
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="code"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Code</FormLabel>
              <Tabs defaultValue="write" className="w-full">
                <TabsList className="mb-2">
                  <TabsTrigger value="write">Write</TabsTrigger>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                </TabsList>
                <TabsContent value="write">
                  <FormControl>
                    <div className="relative">
                      <div className="absolute right-2 top-2 z-10 flex items-center gap-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <div>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  onClick={handleFormatCode}
                                  disabled={
                                    !code ||
                                    !isFormattingSupported(language)
                                  }
                                >
                                  <Wand2 className="mr-2 h-4 w-4" />
                                  Format
                                </Button>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              {isFormattingSupported(language)
                                ? "Format your code"
                                : "Formatting not available for this language"}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <Textarea
                        placeholder="Paste your code here"
                        className="min-h-[300px] font-mono"
                        {...field}
                      />
                      <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
                        {field.value.length}/10000
                      </div>
                    </div>
                  </FormControl>
                  <div className="flex w-full items-center justify-center">
                    {code !== "" && (
                      <Dialog open={isStackBlitzDialogOpen} onOpenChange={setIsStackBlitzDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            type="button"
                            className="mt-3 flex items-center justify-center gap-2 rounded-md bg-blue-500 hover:bg-blue-600 text-white px-4 py-2"
                            onClick={handleDialogOpen}
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            >
                              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                            </svg>
                            Edit in StackBlitz
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-4xl lg:max-w-5xl xl:max-w-6xl">
                          <DialogHeader>
                            <DialogTitle>Edit Code in StackBlitz</DialogTitle>
                            <DialogDescription className="flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                              <div className="flex items-center">
                                <span className="mr-3">Template:</span>
                                <Select
                                  value={stackBlitzTemplate}
                                  onValueChange={handleTemplateChange}
                                >
                                  <SelectTrigger className="w-[180px]">
                                    <SelectValue placeholder="Select Template" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {TEMPLATES.map((template) => (
                                      <SelectItem key={template.name} value={template.name}>
                                        {template.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {language && (
                                  <span>
                                    Best template for {language}: {LANGUAGE_TO_TEMPLATE_MAP[language] || "javascript"}
                                  </span>
                                )}
                              </div>
                            </DialogDescription>
                          </DialogHeader>
                          <div 
                            id="stackblitz-container" 
                            className="w-full h-[600px] border rounded-md overflow-hidden"
                          ></div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </TabsContent>
                <TabsContent value="preview">
                  <CodePreview code={code} language={language} />
                </TabsContent>
              </Tabs>
              <FormDescription>
                The actual code snippet you want to share
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid gap-4 md:grid-cols-2">
          <FormField
            control={form.control}
            name="language"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Language</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a language" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {LANGUAGES.map((lang) => (
                      <SelectItem key={lang} value={lang}>
                        {lang}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  The programming language used
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="framework"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Framework (Optional)</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value || ""}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a framework" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {FRAMEWORKS.map((fw) => (
                      <SelectItem key={fw} value={fw}>
                        {fw}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  The framework or library used (if any)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="category"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {CATEGORIES.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Choose the most relevant category for your snippet
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tags</FormLabel>
              <FormControl>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {field.value.map((tag) => (
                      <Badge key={tag} variant="secondary">
                        {tag}
                        <button
                          type="button"
                          className="ml-1"
                          onClick={() => removeTag(tag)}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                    <Input
                      placeholder="Add a tag (press Enter)"
                      className="!mt-0 w-[200px]"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleTagInputKeyDown}
                    />
                  </div>
                </div>
              </FormControl>
              <FormDescription>
                Add up to 5 tags to help others find your snippet
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isPublic"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
              <FormControl>
                <div 
                  className={`flex h-10 w-16 cursor-pointer rounded-full p-1 transition-colors ${
                    field.value ? "bg-green-500" : "bg-gray-300 dark:bg-gray-700"
                  }`}
                  onClick={() => form.setValue("isPublic", !field.value)}
                >
                  <div 
                    className={`h-8 w-8 transform rounded-full bg-white shadow-md transition-transform ${
                      field.value ? "translate-x-6" : "translate-x-0"
                    }`}
                  >
                    {field.value ? (
                      <Eye className="h-8 w-8 p-1.5 text-green-500" />
                    ) : (
                      <EyeOff className="h-8 w-8 p-1.5 text-gray-500" />
                    )}
                  </div>
                </div>
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Visibility: {field.value ? "Public" : "Private"}
                </FormLabel>
                <FormDescription>
                  {field.value 
                    ? "Anyone can view this snippet" 
                    : "Only you can view this snippet"}
                </FormDescription>
              </div>
            </FormItem>
          )}
        />

        <div className="flex items-center gap-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting && (
              <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
            )}
            Create Snippet
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}