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
import embedStackblitzProject, {
  detectCodeLanguage,
  isFormattingSupported,
} from "./StackBlitz";
import {
  LANGUAGES,
  LANGUAGE_TO_TEMPLATE_MAP,
  CATEGORIES,
  TEMPLATES,
  FRAMEWORKS,
} from "@/types/form";

interface CreateSnippetFormProps {
  user: ExtendedUser;
  aiGeneratedData?: Partial<SnippetFormData> | null;
}

export function CreateSnippetForm({ user, aiGeneratedData }: CreateSnippetFormProps) {
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

  // Handle AI generated data
  useEffect(() => {
    if (aiGeneratedData) {
      if (aiGeneratedData.title) form.setValue("title", aiGeneratedData.title);
      if (aiGeneratedData.description) form.setValue("description", aiGeneratedData.description);
      if (aiGeneratedData.code) form.setValue("code", aiGeneratedData.code);
      if (aiGeneratedData.language) form.setValue("language", aiGeneratedData.language);
      if (aiGeneratedData.framework) form.setValue("framework", aiGeneratedData.framework);
      if (aiGeneratedData.category) form.setValue("category", aiGeneratedData.category);
      if (aiGeneratedData.tags) form.setValue("tags", aiGeneratedData.tags);
    }
  }, [aiGeneratedData, form]);

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
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <div className="relative">
                  <Input placeholder="Enter a descriptive title" {...field} />
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
                                    !code || !isFormattingSupported(language)
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
                      <Dialog
                        open={isStackBlitzDialogOpen}
                        onOpenChange={setIsStackBlitzDialogOpen}
                      >
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
                                      <SelectItem
                                        key={template.name}
                                        value={template.name}
                                      >
                                        {template.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {language && (
                                  <span>
                                    Best template for {language}:{" "}
                                    {LANGUAGE_TO_TEMPLATE_MAP[language] ||
                                      "javascript"}
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
                  key={field.value}
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
                <FormDescription>The programming language used</FormDescription>
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
                  key={field.value}
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
                key={field.value}
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
                    field.value
                      ? "bg-green-500"
                      : "bg-gray-300 dark:bg-gray-700"
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