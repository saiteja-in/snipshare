"use client";

import { useState } from "react";
import Link from "next/link";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { CircleX } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { SnippetCard } from "@/components/SnippetCard";

// Types for our component props
interface User {
  id: string;
  name: string | null;
  email: string | null;
  slug: string;
  image: string | null;
  role: string;
  _count: {
    snippets: number;
    snippetLikes: number;
    bookmarks: number;
  };
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
  author: {
    name: string | null;
    image: string | null;
    slug: string;
  };
  _count: {
    comments: number;
    likes: number;
    bookmarks: number;
  };
}

interface UserPageClientProps {
  user: User;
  initialSnippets: Snippet[];
  initialLikedSnippets: Snippet[];
}

export function UserPageClient({
  user,
  initialSnippets,
  initialLikedSnippets,
}: UserPageClientProps) {
  const [activeTab, setActiveTab] = useState<string>("snippets");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Filter snippets based on search query
  const filteredSnippets =
    activeTab === "snippets"
      ? initialSnippets.filter(
          (snippet) =>
            snippet.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            snippet.description
              .toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            snippet.tags.some((tag) =>
              tag.toLowerCase().includes(searchQuery.toLowerCase())
            )
        )
      : initialLikedSnippets.filter(
          (snippet) =>
            snippet.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            snippet.description
              .toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            snippet.tags.some((tag) =>
              tag.toLowerCase().includes(searchQuery.toLowerCase())
            )
        );

  return (
    <div className="min-h-screen flex flex-col">
      <div className="flex-1">
        <div className="flex mx-auto px-2 sm:px-4 md:px-16  mt-16">
          <div className="flex flex-col md:flex-row gap-6 md:gap-16 w-full">
            {/* User Profile Sidebar */}
            <div className="flex md:w-[20%] md:min-w-[300px] flex-col items-center w-full">
              <div className="flex flex-col items-center md:items-start space-y-6">
                <Avatar className="h-[120px] w-[120px]">
                  {user.image ? (
                    <AvatarImage
                      src={user.image}
                      alt={user.name || user.slug}
                    />
                  ) : (
                    <AvatarFallback>
                      {user.name
                        ? user.name.charAt(0).toUpperCase()
                        : user.slug.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>

                <div className="space-y-2 text-center md:text-left">
                  <h1 className="text-3xl font-semibold tracking-tight">
                    {user.name || user.slug}
                  </h1>
                  <p className="text-lg text-muted-foreground">@{user.slug}</p>
                </div>

                <div className="flex items-center md:justify-start justify-center gap-4 pt-2">
                  {/* Social links can be added here if needed */}
                </div>
              </div>
            </div>

            {/* Main Content Area */}
            <div className="w-full md:w-[80%]">
              {/* Tabs Header */}
              <div className="flex flex-col gap-4 mb-6">
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-4">
                    <Tabs
                      value={activeTab}
                      onValueChange={setActiveTab}
                      className="w-full md:w-auto"
                    >
                      <TabsList className="w-full md:w-auto h-8 -space-x-px bg-background p-0 shadow-sm shadow-black/5 rtl:space-x-reverse">
                        <TabsTrigger
                          value="snippets"
                          className="flex-1 md:flex-initial relative overflow-hidden rounded-none border border-border h-8 px-4 after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 first:rounded-s last:rounded-e data-[state=active]:bg-muted data-[state=active]:after:bg-foreground"
                        >
                          <div className="flex items-center gap-2">
                            <span className="truncate">Snippets</span>
                            <span className="text-xs text-muted-foreground tabular-nums">
                              {user._count.snippets}
                            </span>
                          </div>
                        </TabsTrigger>
                        <TabsTrigger
                          value="likes"
                          className="flex-1 md:flex-initial relative overflow-hidden rounded-none border border-border h-8 px-4 after:pointer-events-none after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 first:rounded-s last:rounded-e data-[state=active]:bg-muted data-[state=active]:after:bg-foreground"
                        >
                          <div className="flex items-center gap-2">
                            <span className="truncate">Liked Snippets</span>
                            <span className="text-xs text-muted-foreground tabular-nums">
                              {user._count.snippetLikes}
                            </span>
                          </div>
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>

                  {/* Search Input */}
                  <div className="flex items-center gap-2 md:w-auto min-w-0">
                    <div className="relative flex-1 min-w-0 lg:min-w-[250px] md:min-w-[100px]">
                      <Input
                        type="text"
                        placeholder={`Search ${user.slug}'s ${activeTab}...`}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full h-8 min-w-[100px] [&::placeholder]:pe-8 lg:[&::placeholder]:pe-16"
                      />
                      {searchQuery ? (
                        <button
                          className="absolute inset-y-0 end-0 flex h-full w-8 md:w-9 items-center justify-center rounded-e-lg text-muted-foreground/80 outline-offset-2 transition-colors hover:text-foreground focus:z-10"
                          onClick={() => setSearchQuery("")}
                          aria-label="Clear search"
                        >
                          <CircleX
                            size={16}
                            strokeWidth={2}
                            aria-hidden="true"
                          />
                        </button>
                      ) : (
                        <div className="pointer-events-none absolute inset-y-0 end-0 flex items-center justify-center pe-2 text-muted-foreground">
                          <kbd className="hidden lg:inline-flex size-5 items-center justify-center rounded border bg-muted px-1 font-[inherit] text-[0.625rem] font-medium text-muted-foreground/70">
                            <span className="text-[11px] font-sans">/</span>
                          </kbd>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Snippets Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                {filteredSnippets.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <p className="text-muted-foreground">
                      {searchQuery
                        ? `No ${activeTab} found matching "${searchQuery}"`
                        : `No ${activeTab} found`}
                    </p>
                  </div>
                ) : (
                  filteredSnippets.map((snippet) => (
                    <SnippetCard
                      key={snippet.id} // Added the key prop
                      snippet={snippet}
                      isPreview={true}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
