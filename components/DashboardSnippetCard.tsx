"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import { Copy, Check, Share2, Bookmark, Clock, Eye, MessageSquare, Heart, Pencil, Trash2, Loader2 } from "lucide-react";
import { deleteSnippet } from "@/actions/snippet";
import { formatDistanceToNow } from "date-fns";

interface Author {
  id?: string;
  name: string | null;
  image: string | null;
  slug: string;
}

interface DashboardSnippetCardProps {
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
  onDelete?: () => void;
}

export function DashboardSnippetCard({ snippet, onDelete }: DashboardSnippetCardProps) {
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const [copied, setCopied] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  
  useEffect(() => {
    setMounted(true);
  }, []);



  const shareSnippet = () => setIsShareDialogOpen(true);

  const copyLink = () => {
    const url = `${window.location.origin}/snippets/${snippet.id}`;
    navigator.clipboard.writeText(url);
    setLinkCopied(true);
    toast.success("Link copied to clipboard!");
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleEditClick = () => {
    router.push(`/snippets/${snippet.id}/edit`);
  };

  const handleDeleteClick = () => {
    setIsDeleteAlertOpen(true);
  };

  const handleConfirmDelete = async () => {
    try {
      setIsDeleting(true);
      setDeleteError(null);
      
      const result = await deleteSnippet(snippet.id);
      
      if (result.error) {
        setDeleteError(result.error);
        toast.error(result.error);
        setIsDeleting(false);
        return;
      }
      
      toast.success("Snippet deleted successfully");
      setIsDeleteAlertOpen(false);
      
      // Call the optional onDelete callback
      if (onDelete) {
        onDelete();
      }
      
      // Refresh the page to update the snippet list
      router.refresh();
    } catch (error) {
      console.error("Error deleting snippet:", error);
      setDeleteError("An unexpected error occurred. Please try again.");
      toast.error("Failed to delete snippet");
    } finally {
      setIsDeleting(false);
    }
  };

  const timeAgo = formatDistanceToNow(new Date(snippet.createdAt), {
    addSuffix: true,
  });
  
  const syntaxTheme = 
    (!mounted || typeof window === 'undefined') ? gruvboxLight :
    (resolvedTheme === 'dark' || 
    (resolvedTheme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)) 
      ? nightOwl 
      : gruvboxLight;

  return (
    <Card className="group flex flex-col transition-colors hover:border-primary/50 w-full">
      {/* Card Header with Edit/Delete buttons */}
      <CardHeader className="relative">
        <div className="flex flex-col gap-1">
          <div className="flex items-start justify-between">
            <Link
              href={`/snippets/${snippet.id}`}
              className="text-lg font-semibold hover:underline"
            >
              {snippet.title}
            </Link>
            {/* Edit and Delete buttons visible on hover */}
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="outline"
                size="sm"
                onClick={handleEditClick}
                className="h-8 w-8 p-0"
              >
                <Pencil className="h-4 w-4" />
                <span className="sr-only">Edit</span>
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteClick}
                className="h-8 w-8 p-0"
              >
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Delete</span>
              </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {snippet.description}
          </p>
        </div>
      </CardHeader>

      {/* Code preview area with scrolling */}
      <div className="mx-4 mb-3">
        <div className="relative h-[170px] rounded-md overflow-hidden bg-muted">
         
          
          <Link href={`/snippets/${snippet.id}`} className="block h-full">
            <div className="h-full overflow-auto thin-scrollbar bg-background">
              <SyntaxHighlighter
                language={snippet.language?.toLowerCase() || "plaintext"}
                style={syntaxTheme}
                customStyle={{
                  margin: 0,
                  padding: "12px",
                  height: "100%",
                  fontSize: "0.7rem",
                  background: "",
                  visibility: mounted ? "visible" : "hidden",
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

      {/* Tags */}
      <CardContent className="pt-0">
        <div className="flex flex-wrap gap-2 mb-2">
          <Badge
            variant={snippet.isPublic ? "default" : "secondary"}
            className={snippet.isPublic ? 
              "bg-primary/10 text-primary hover:bg-primary/20" : 
              "bg-secondary/10 text-secondary hover:bg-secondary/20"
            }
          >
            {snippet.isPublic ? "Public" : "Private"}
          </Badge>
          
          <Badge
            variant="outline"
            className="hover:bg-muted"
          >
            {snippet.language}
          </Badge>
          
          {snippet.tags.slice(0, 2).map((tag: string) => (
            <Badge key={tag} variant="outline" className="hover:bg-muted">
              {tag}
            </Badge>
          ))}
          {snippet.tags.length > 2 && (
            <Badge variant="outline" className="hover:bg-muted">
              +{snippet.tags.length - 2} more
            </Badge>
          )}
        </div>
      </CardContent>

      {/* Footer with metadata and action buttons */}
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
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8" 
              onClick={shareSnippet}
            >
              <Share2 size={14} className="mr-1" />
              Share
            </Button>
            <Link href={`/snippets/${snippet.id}`}>
              <Button
                variant="ghost"
                size="sm"
                className="group-hover:bg-primary/10"
              >
                View
              </Button>
            </Link>
          </div>
        </div>
      </CardFooter>
      
      {/* Share Dialog */}
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
          <DialogFooter className="mt-4">
            <Button
              type="button"
              variant="secondary"
              className="w-full"
              onClick={() => setIsShareDialogOpen(false)}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-destructive flex items-center">
              <Trash2 className="mr-2 h-5 w-5" /> Delete Snippet
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this snippet? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {deleteError && (
            <div className="bg-destructive/10 text-destructive p-3 rounded-md my-2">
              {deleteError}
            </div>
          )}
          
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                handleConfirmDelete();
              }}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}