"use client";

import { useState } from "react";
import { useQueryState } from "nuqs";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import { FiltersSidebar } from "./filters-sidebar";
import { SnippetsGrid } from "./snippets-grid";

interface Author {
  id: string;
  name: string | null;
  image: string | null;
  slug: string;
}

interface Snippet {
  id: string;
  title: string;
  description: string;
  code: string;
  language: string;
  framework: string | null;
  category: string;
  tags: string[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  views: number;
  author: Author;
  _count: {
    comments: number;
    likes: number;
    bookmarks: number;
  };
}

interface FilterOptions {
  languages: string[];
  frameworks: string[];
  categories: string[];
}

interface SnippetsBrowserProps {
  initialSnippets: Snippet[];
  filterOptions: FilterOptions;
}

export function SnippetsBrowser({
  initialSnippets,
  filterOptions,
}: SnippetsBrowserProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [snippets, setSnippets] = useState<Snippet[]>(initialSnippets);

  // Use nuqs for URL state management
  const [search, setSearch] = useQueryState("search", { defaultValue: "" });
  const [language, setLanguage] = useQueryState("language", {
    defaultValue: "all",
  });
  const [framework, setFramework] = useQueryState("framework", {
    defaultValue: "all",
  });
  const [category, setCategory] = useQueryState("category", {
    defaultValue: "all",
  });

  // Filter snippets client-side for immediate feedback
  const filteredSnippets = snippets.filter((snippet) => {
    const matchesSearch =
      !search ||
      snippet.title.toLowerCase().includes(search.toLowerCase()) ||
      snippet.description.toLowerCase().includes(search.toLowerCase()) ||
      snippet.tags.some((tag) =>
        tag.toLowerCase().includes(search.toLowerCase())
      );

    const matchesLanguage = language === "all" || snippet.language === language;
    const matchesFramework =
      framework === "all" || snippet.framework === framework;
    const matchesCategory = category === "all" || snippet.category === category;

    return (
      matchesSearch && matchesLanguage && matchesFramework && matchesCategory
    );
  });

  const handleReset = () => {
    setSearch("");
    setLanguage("all");
    setFramework("all");
    setCategory("all");
  };

  return (
    <div className="container py-6">
      <div className="flex flex-col gap-6">
        {/* <div className="flex items-center justify-between"> */}
          {/* <h1 className="text-3xl font-bold tracking-tight">Code Snippets</h1> */}
          <Button
            variant="outline"
            className="lg:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            <Filter className="mr-2 h-4 w-4" />
            Filters
          </Button>
        {/* </div> */}

        <div className="grid gap-6 lg:grid-cols-[280px_1fr] ">
          <FiltersSidebar
            isOpen={isOpen}
            onClose={() => setIsOpen(false)}
            search={search}
            language={language}
            framework={framework}
            category={category}
            languages={filterOptions.languages}
            frameworks={filterOptions.frameworks}
            categories={filterOptions.categories}
            onSearchChange={setSearch}
            onLanguageChange={setLanguage}
            onFrameworkChange={setFramework}
            onCategoryChange={setCategory}
            onReset={handleReset}
          />
          <SnippetsGrid snippets={filteredSnippets} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}
