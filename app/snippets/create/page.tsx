import React from "react";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { ExtendedUser } from "@/schemas";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { HouseIcon, BoxIcon } from "lucide-react";
import { CreateSnippetForm } from "@/components/create-snippet-form";

const CreateSnippetPage = async () => {
  const user = (await currentUser()) as ExtendedUser | undefined;
  if (!user) {
    redirect("/auth/login?callbackUrl=/snippets/create");
  }

  return (
    <div className="container py-6">
      <Card>
        <CardHeader>
          <CardTitle>Create Snippet</CardTitle>
          <CardDescription>Share your code snippet with the community</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="form">
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
             <CreateSnippetForm user={user} />
            </TabsContent>
            <TabsContent value="ai" className="min-h-[600px]">
            //2
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateSnippetPage;
