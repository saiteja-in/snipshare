import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { currentUser } from "@/lib/auth";
import { ExtendedUser } from "@/schemas";
import { redirect } from "next/navigation";
import React from "react";

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
          <CardDescription>
            Share your code snippet with the community
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="form" className="space-y-6">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="form" className="flex-1 sm:flex-none">
                Manual Entry
              </TabsTrigger>
              <TabsTrigger value="ai" className="flex-1 sm:flex-none">
                AI Assistant
              </TabsTrigger>
            </TabsList>
            <TabsContent value="form" className="space-y-6">
              //form comes here
            </TabsContent>
            <TabsContent value="ai" className="min-h-[600px]">
              //ai tab content
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateSnippetPage;
