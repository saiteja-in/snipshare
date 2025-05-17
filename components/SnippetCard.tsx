"use client";

import { useState } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { nightOwl, gruvboxLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { Copy, Check, Share2, Bookmark, Clock, Eye, MessageSquare, Heart } from "lucide-react";

interface Author {
  id?: string;  // Made optional to accommodate different author structures
  name: string | null;
  image: string | null;
  slug: string;
}

interface SnippetCardProps {
  snippet: {
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
  };
  isPreview?: boolean;
}

export function SnippetCard({ snippet, isPreview = true }: SnippetCardProps) {
  const { theme } = useTheme();
  const [copied, setCopied] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const copyCode = () => {
    if (!snippet?.code) return;
    navigator.clipboard.writeText(snippet.code);
    setCopied(true);
    toast.success("Code copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  const shareSnippet = () => setIsShareDialogOpen(true);

  const copyLink = () => {
    const url = `${window.location.origin}/snippets/${snippet.id}`;
    navigator.clipboard.writeText(url);
    setLinkCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const timeAgo = formatDistanceToNow(new Date(snippet.createdAt), {
    addSuffix: true,
  });

  return (
    <Card className="group flex flex-col transition-colors hover:border-primary/50 w-full">
      <CardHeader>
        <div className="flex flex-col gap-1">
          <div className="flex items-start justify-between">
            <Link
              href={`/snippets/${snippet.id}`}
              className="text-lg font-semibold hover:underline"
            >
              {snippet.title}
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Bookmark className="h-4 w-4" />
            </Button>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {snippet.description}
          </p>
        </div>
      </CardHeader>

      {/* Code preview area with scrolling */}
      {isPreview ? (
        <div className="mx-4 mb-3">
          <div className="relative h-[170px] rounded-md overflow-hidden bg-muted">
           
            <Link href={`/snippets/${snippet.id}`} className="block h-full">
              <div className="h-full overflow-auto thin-scrollbar bg-background">
                <SyntaxHighlighter
                  language={snippet.language?.toLowerCase() || "plaintext"}
                  style={theme === "dark" ? nightOwl : gruvboxLight}
                  customStyle={{
                    margin: 0,
                    padding: "12px",
                    height: "100%",
                    fontSize: "0.7rem",
                    background: "",
                  }}
                  className="bg-background"
                  wrapLines={false}
                  showLineNumbers={false}
                >
                  {snippet.code}
                </SyntaxHighlighter>
              </div>
            </Link>
          </div>
        </div>
      ) : (
        <CardContent className="px-0">
          <div className="relative h-[350px] rounded-md overflow-hidden bg-muted mx-4">
            <div className="absolute top-0 right-0 z-10 p-1">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 bg-background/80 backdrop-blur-sm hover:bg-background"
                onClick={copyCode}
              >
                {copied ? (
                  <>
                    <Check size={14} className="mr-1" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy size={14} className="mr-1" />
                    Copy
                  </>
                )}
              </Button>
            </div>
            <div className="h-full overflow-auto thin-scrollbar">
              <SyntaxHighlighter
                language={snippet.language?.toLowerCase() || "plaintext"}
                style={theme === "dark" ? nightOwl : gruvboxLight}
                customStyle={{
                  margin: 0,
                  padding: "16px",
                  minHeight: "100%",
                  fontSize: "0.85rem",
                  backgroundColor: "transparent",
                }}
                wrapLines={true}
                showLineNumbers={true}
              >
                {snippet.code}
              </SyntaxHighlighter>
            </div>
          </div>
        </CardContent>
      )}

      <CardContent className={isPreview ? "pt-0" : ""}>
        <div className="flex flex-wrap gap-2">
          <Badge
            variant="default"
            className="bg-primary/10 text-primary hover:bg-primary/20"
          >
            {snippet.language}
          </Badge>
         {/*  {snippet.framework && (
            <Badge variant="outline" className="hover:bg-muted">
              {snippet.framework}
            </Badge>
          )} */}
          {snippet.tags.slice(0, 3).map((tag: string) => (
            <Badge key={tag} variant="outline" className="hover:bg-muted">
              {tag}
            </Badge>
          ))}
          {snippet.tags.length > 3 && (
            <Badge variant="outline" className="hover:bg-muted">
              +{snippet.tags.length - 3} more
            </Badge>
          )}
        </div>
      </CardContent>

      <CardFooter className="mt-auto pt-0">
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-3">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link href={`/${snippet.author.slug}`}>
                    <Avatar className="h-6 w-6">
                      <AvatarImage
                        src={snippet.author.image || ""}
                        alt={snippet.author.name || ""}
                      />
                        <AvatarFallback className="text-sm font-medium">
  {snippet.author.name 
    ? (snippet.author.name.split(' ').length > 1 
        ? `${snippet.author.name.split(' ')[0][0]}${snippet.author.name.split(' ')[1][0]}`.toUpperCase()
        : snippet.author.name[0].toUpperCase())
    : (snippet.author.slug 
        ? (snippet.author.slug.split('-').length > 1
            ? `${snippet.author.slug.split('-')[0][0]}${snippet.author.slug.split('-')[1][0]}`.toUpperCase()
            : snippet.author.slug[0].toUpperCase())
        : '?')}
</AvatarFallback>
                    </Avatar>
                  </Link>
                </TooltipTrigger>
                <TooltipContent>{snippet.author.name || snippet.author.slug}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <span className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-3 w-3" />
              {timeAgo}
            </span>
            
            {!isPreview && (
              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1" title="Views">
                  <Eye size={14} />
                  {snippet.views}
                </span>
                <span className="flex items-center gap-1" title="Likes">
                  <Heart size={14} />
                  {snippet._count.likes}
                </span>
                <span className="flex items-center gap-1" title="Comments">
                  <MessageSquare size={14} />
                  {snippet._count.comments}
                </span>
              </div>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {!isPreview && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8" 
                onClick={shareSnippet}
              >
                <Share2 size={14} className="mr-1" />
                Share
              </Button>
            )}
            <Link href={`/snippets/${snippet.id}`}>
              <Button
                variant="ghost"
                size="sm"
                className="group-hover:bg-primary/10"
              >
                View Snippet
              </Button>
            </Link>
          </div>
        </div>
      </CardFooter>
      
      <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Share snippet</DialogTitle>
            <DialogDescription>
              Share this snippet with others by copying the link below
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center space-x-2">
            <div className="grid flex-1 gap-2">
              <Input
                readOnly
                value={`${typeof window !== "undefined" ? window.location.origin : ""}/snippets/${snippet.id}`}
                className="w-full"
              />
            </div>
            <Button
              type="button"
              variant="secondary"
              className="px-3"
              onClick={copyLink}
            >
              {linkCopied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              <span className="sr-only">Copy link</span>
            </Button>
          </div>
          <div className="mt-4 flex justify-end">
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              onClick={() => setIsShareDialogOpen(false)}
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}