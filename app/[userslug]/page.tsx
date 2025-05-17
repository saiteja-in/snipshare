import { getUserBySlug, getUserSnippets, getUserLikedSnippets } from "@/actions/snippet";
import { UserPageClient } from "./user-page-client";
import { notFound, redirect } from "next/navigation";

type Props = {
  params: { userslug: string };
};

export default async function UserPage({ params }: Props) {
  const userslug = params.userslug;
  
  // Fetch user data by slug
  const { user, error } = await getUserBySlug(userslug);
  
  // If user not found, show 404 page
  if (error || !user) {
    notFound();
  }
  
  // Fetch user's snippets
  const { snippets: userSnippets } = await getUserSnippets(user.id);
  
  // Fetch user's liked snippets
  const { snippets: likedSnippets } = await getUserLikedSnippets(user.id);
  
  return (
    <UserPageClient 
      user={user} 
      initialSnippets={userSnippets || []} 
      initialLikedSnippets={likedSnippets || []} 
    />
  );
}