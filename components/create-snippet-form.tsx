"use client";

import { useState, useEffect } from "react";
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
  "angular-cli",
  "create-react-app",
  "html",
  "javascript",
  "polymer",
  "typescript",
  "vue",
  "node",
];

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
  };
  
  return extensionMap[lowercaseLang] || ".txt";
};

// Function to embed StackBlitz project
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
    
    // Create appropriate files based on template
    switch (templateName) {
      case "angular-cli":
        files = {
          "index.html": `<div id="app"></div>`,
          "main.ts": `console.log("Angular app")`,
          [`main${extension}`]: `${code}`,
        };
        break;
      case "create-react-app":
        files = {
          "index.html": `<div id="root"></div>`,
          "index.js": `console.log("React app")`,
          [`index${extension}`]: `${code}`,
        };
        break;
      case "html":
        files = {
          "index.html": `<div>Hello, HTML!</div>`,
          [`index${extension}`]: `${code}`,
        };
        break;
      case "javascript":
        files = {
          "index.html": `<div id="app"></div>`,
          "index.js": `console.log("Hello, JavaScript!")`,
          [`index${extension}`]: `${code}`,
        };
        break;
      case "typescript":
        files = {
          "index.html": `<div id="app"></div>`,
          "index.ts": `console.log("Hello, TypeScript!")`,
          [`index${extension}`]: `${code}`,
        };
        break;
      case "vue":
        files = {
          "public/index.html": `<div id="app"></div>`,
          "src/main.js": `console.log("Hello, Vue!")`,
          [`src/main${extension}`]: `${code}`,
        };
        break;
      case "node":
        files = {
          "index.js": `console.log("Hello, Node!")`,
          [`index${extension}`]: `${code}`,
        };
        break;
      case "polymer":
        files = {
          "index.html": `<div id="app"></div>`,
          [`index${extension}`]: `${code}`,
        };
        break;
      default:
        files = {
          "index.html": `<div id="app"></div>`,
          [`index${extension}`]: `${code}`,
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
        height: 500,
        showSidebar: true,
        openFile: `index${extension}`,
        terminalHeight: 50,
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

  const openStackBlitzEditor = () => {
    setShowStackBlitzEditor(true);
    setTimeout(() => {
      embedStackblitzProject(
        stackBlitzTemplate,
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
                  {code && <TabsTrigger value="stackblitz">Edit in StackBlitz</TabsTrigger>}
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
                </TabsContent>
                <TabsContent value="preview">
                  <CodePreview code={code} language={language} />
                </TabsContent>
                <TabsContent value="stackblitz">
                  <div className="mb-4">
                    <div className="flex items-center space-x-4 mb-4">
                      <label className="text-sm font-medium">Template:</label>
                      <Select
                        value={stackBlitzTemplate}
                        onValueChange={setStackBlitzTemplate}
                      >
                        <SelectTrigger className="w-[200px]">
                          <SelectValue placeholder="Select Template" />
                        </SelectTrigger>
                        <SelectContent>
                          {TEMPLATES.map((template) => (
                            <SelectItem key={template} value={template}>
                              {template}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button 
                        type="button" 
                        onClick={openStackBlitzEditor} 
                        variant="outline"
                      >
                        Open Editor
                      </Button>
                    </div>
                    {showStackBlitzEditor && (
                      <div 
                        id="stackblitz-container" 
                        className="w-full h-[500px] border rounded-md"
                      ></div>
                    )}
                  </div>
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