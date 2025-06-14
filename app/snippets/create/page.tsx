import React from "react";
import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { ExtendedUser } from "@/schemas";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CreateSnippetTabs } from "@/components/create-snippet-tabs";

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
          <CreateSnippetTabs user={user} />
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateSnippetPage;