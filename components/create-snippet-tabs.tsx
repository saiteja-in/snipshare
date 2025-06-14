"use client";

import { useState } from "react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HouseIcon, BoxIcon } from "lucide-react";
import { CreateSnippetForm } from "@/components/create-snippet-form";
import { SnippetAI } from "@/components/snippet-ai";
import { ExtendedUser } from "@/schemas";
import { SnippetFormData } from "@/schemas/snippet";

interface CreateSnippetTabsProps {
  user: ExtendedUser;
}

export function CreateSnippetTabs({ user }: CreateSnippetTabsProps) {
  const [activeTab, setActiveTab] = useState("form");
  const [aiGeneratedData, setAiGeneratedData] = useState<Partial<SnippetFormData> | null>(null);

  const handleAIGenerated = (snippet: {
    title: string;
    description: string;
    code: string;
    language: string;
    framework?: string;
    category: string;
    tags: string[];
  }) => {
    setAiGeneratedData(snippet);
    setActiveTab("form");
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <ScrollArea>
        <TabsList className="before:bg-border relative mb-3 h-auto w-full gap-0.5 bg-transparent p-0 before:absolute before:inset-x-0 before:bottom-0 before:h-px">
          <TabsTrigger
            value="form"
            className="bg-muted overflow-hidden rounded-b-none border-x border-t py-2 data-[state=active]:z-10 data-[state=active]:shadow-none"
          >
            <HouseIcon className="-ms-0.5 me-1.5 opacity-60" size={16} aria-hidden="true" />
            Manual Entry
          </TabsTrigger>
          <TabsTrigger
            value="ai"
            className="bg-muted overflow-hidden rounded-b-none border-x border-t py-2 data-[state=active]:z-10 data-[state=active]:shadow-none"
          >
            <BoxIcon className="-ms-0.5 me-1.5 opacity-60" size={16} aria-hidden="true" />
            AI Assistant
          </TabsTrigger>
        </TabsList>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      <TabsContent value="form" className="space-y-6">
        <CreateSnippetForm user={user} aiGeneratedData={aiGeneratedData} />
      </TabsContent>
      <TabsContent value="ai" className="min-h-[600px]">
        <SnippetAI onSnippetGenerated={handleAIGenerated} />
      </TabsContent>
    </Tabs>
  );
}