import { getPublicSnippets, getFilterOptions } from "@/actions/snippet";
import { SnippetsBrowser } from "@/components/snippets/snippets-browser";

export default async function SnippetsPage() {
  // Fetch initial data on the server
  const [snippetsResult, filterOptionsResult] = await Promise.all([
    getPublicSnippets(),
    getFilterOptions(),
  ]);

  const snippets = snippetsResult.success ? snippetsResult.snippets : [];
  const filterOptions = filterOptionsResult.success
    ? filterOptionsResult.options
    : { languages: [], frameworks: [], categories: [] };

  return (
    <SnippetsBrowser initialSnippets={snippets} filterOptions={filterOptions} />
  );
}
