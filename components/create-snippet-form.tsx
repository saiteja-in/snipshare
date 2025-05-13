"use client";

import { useState } from "react";
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
import { X, Copy, Check, Wand2 } from "lucide-react";
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

const LANGUAGES = [
  "JavaScript",
  "TypeScript",
  "Python",
  "Java",
  "Css",
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

interface CreateSnippetFormProps {
  user: ExtendedUser;
}

export function CreateSnippetForm({ user }: CreateSnippetFormProps) {
  const router = useRouter();
  const [tagInput, setTagInput] = useState("");

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

  const onSubmit = async (data: SnippetFormData) => {
    try {
      const result = await createSnippet(data);
      
      if (result.error) {
        return toast.error(result.error);
      }
      
      toast.success("Snippet created successfully");
      //optimise this later
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
                  defaultValue={field.value}
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
                  defaultValue={field.value}
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
                defaultValue={field.value}
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