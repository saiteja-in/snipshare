import { redirect } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, User } from "lucide-react";
import Link from "next/link";
import { DashboardSnippetCard } from "@/components/DashboardSnippetCard";
import { EmptyPlaceholder } from "@/components/EmptyPlaceholder";
import { getUserSnippets, getUserLikedSnippets } from "@/actions/snippet";
import { currentUser } from "@/lib/auth";
import { ExtendedUser } from "@/schemas";

export const metadata = {
  title: "Dashboard - Code Snippets",
  description: "Manage your code snippets",
};

export default async function DashboardPage() {
  // Get the current authenticated user
  const user = (await currentUser()) as ExtendedUser | undefined;
  console.log("user",user)


  // Redirect to login page if no user is authenticated
  if (!user) {
    redirect("/auth/login");
  }

  // Fetch user's snippets
  const { snippets: allSnippets, error: snippetsError } = await getUserSnippets(user.id);
  
  // Fetch user's liked snippets
  const { snippets: likedSnippets, error: likedError } = await getUserLikedSnippets(user.id);

  // Filter public and private snippets
  const publicSnippets = allSnippets ? allSnippets.filter(snippet => snippet.isPublic) : [];
  const privateSnippets = allSnippets ? allSnippets.filter(snippet => !snippet.isPublic) : [];

  return (
    <div className="container py-8">
      <div className="flex flex-col gap-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Manage your code snippets, create new ones, or view your liked snippets.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/snippets/create">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                New Snippet
              </Button>
            </Link>
            <Link href={`/${user.slug}`}>
              <Button variant="outline">
                <User className="mr-2 h-4 w-4" />
                Profile
              </Button>
            </Link>
          </div>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="all-snippets" className="w-full">
          <TabsList className="grid grid-cols-4 mb-8">
            <TabsTrigger value="all-snippets">All Snippets</TabsTrigger>
            <TabsTrigger value="public-snippets">Public</TabsTrigger>
            <TabsTrigger value="private-snippets">Private</TabsTrigger>
            <TabsTrigger value="liked-snippets">Liked</TabsTrigger>
          </TabsList>

          {/* All Snippets */}
          <TabsContent value="all-snippets">
            <div className="mb-4">
              <h2 className="text-2xl font-semibold mb-2">All Snippets</h2>
              <p className="text-muted-foreground">
                View and manage all your snippets. You can edit or delete any of your snippets from here.
              </p>
            </div>
            {snippetsError ? (
              <Card>
                <CardContent className="py-10">
                  <div className="text-center">
                    <p className="text-muted-foreground">
                      Error loading snippets. Please try again later.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : allSnippets && allSnippets.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allSnippets.map((snippet) => (
                  <DashboardSnippetCard 
                    key={snippet.id}
                    snippet={snippet}
                  />
                ))}
              </div>
            ) : (
              <EmptyPlaceholder>
                <EmptyPlaceholder.Icon>
                  <div className="p-3 rounded-full bg-muted">
                    <Plus className="h-6 w-6" />
                  </div>
                </EmptyPlaceholder.Icon>
                <EmptyPlaceholder.Title>No snippets yet</EmptyPlaceholder.Title>
                <EmptyPlaceholder.Description>
                  You haven&apos;t created any code snippets yet. Start by creating a new one.
                </EmptyPlaceholder.Description>
                <Link href="/snippets/create">
                  <Button>Create a snippet</Button>
                </Link>
              </EmptyPlaceholder>
            )}
          </TabsContent>

          {/* Public Snippets */}
          <TabsContent value="public-snippets">
            <div className="mb-4">
              <h2 className="text-2xl font-semibold mb-2">Public Snippets</h2>
              <p className="text-muted-foreground">
                These snippets are visible to everyone who visits your profile.
              </p>
            </div>
            {snippetsError ? (
              <Card>
                <CardContent className="py-10">
                  <div className="text-center">
                    <p className="text-muted-foreground">
                      Error loading snippets. Please try again later.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : publicSnippets.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {publicSnippets.map((snippet) => (
                  <DashboardSnippetCard 
                    key={snippet.id}
                    snippet={snippet}
                  />
                ))}
              </div>
            ) : (
              <EmptyPlaceholder>
                <EmptyPlaceholder.Icon>
                  <div className="p-3 rounded-full bg-muted">
                    <Plus className="h-6 w-6" />
                  </div>
                </EmptyPlaceholder.Icon>
                <EmptyPlaceholder.Title>No public snippets</EmptyPlaceholder.Title>
                <EmptyPlaceholder.Description>
                  You haven&apos;t created any public code snippets yet.
                </EmptyPlaceholder.Description>
                <Link href="/snippets/create">
                  <Button>Create a public snippet</Button>
                </Link>
              </EmptyPlaceholder>
            )}
          </TabsContent>

          {/* Private Snippets */}
          <TabsContent value="private-snippets">
            <div className="mb-4">
              <h2 className="text-2xl font-semibold mb-2">Private Snippets</h2>
              <p className="text-muted-foreground">
                These snippets are only visible to you.
              </p>
            </div>
            {snippetsError ? (
              <Card>
                <CardContent className="py-10">
                  <div className="text-center">
                    <p className="text-muted-foreground">
                      Error loading snippets. Please try again later.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : privateSnippets.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {privateSnippets.map((snippet) => (
                  <DashboardSnippetCard 
                    key={snippet.id}
                    snippet={snippet}
                  />
                ))}
              </div>
            ) : (
              <EmptyPlaceholder>
                <EmptyPlaceholder.Icon>
                  <div className="p-3 rounded-full bg-muted">
                    <Plus className="h-6 w-6" />
                  </div>
                </EmptyPlaceholder.Icon>
                <EmptyPlaceholder.Title>No private snippets</EmptyPlaceholder.Title>
                <EmptyPlaceholder.Description>
                  You haven&apos;t created any private code snippets yet.
                </EmptyPlaceholder.Description>
                <Link href="/snippets/create">
                  <Button>Create a private snippet</Button>
                </Link>
              </EmptyPlaceholder>
            )}
          </TabsContent>

          {/* Liked Snippets */}
          <TabsContent value="liked-snippets">
            <div className="mb-4">
              <h2 className="text-2xl font-semibold mb-2">Liked Snippets</h2>
              <p className="text-muted-foreground">
                Code snippets you&apos;ve liked from other users.
              </p>
            </div>
            {likedError ? (
              <Card>
                <CardContent className="py-10">
                  <div className="text-center">
                    <p className="text-muted-foreground">
                      Error loading liked snippets. Please try again later.
                    </p>
                  </div>
                </CardContent>
              </Card>
            ) : likedSnippets && likedSnippets.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {likedSnippets.map((snippet) => (
                  <DashboardSnippetCard 
                    key={snippet.id}
                    snippet={snippet}
                  />
                ))}
              </div>
            ) : (
              <EmptyPlaceholder>
                <EmptyPlaceholder.Icon>
                  <div className="p-3 rounded-full bg-muted">
                    <Plus className="h-6 w-6" />
                  </div>
                </EmptyPlaceholder.Icon>
                <EmptyPlaceholder.Title>No liked snippets</EmptyPlaceholder.Title>
                <EmptyPlaceholder.Description>
                  You haven&apos;t liked any snippets yet. Explore and find snippets you like.
                </EmptyPlaceholder.Description>
                <Link href="/explore">
                  <Button>Explore snippets</Button>
                </Link>
              </EmptyPlaceholder>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}