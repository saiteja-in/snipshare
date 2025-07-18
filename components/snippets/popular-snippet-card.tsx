"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, Eye } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface PopularSnippetCardProps {
  snippet: {
    id: string;
    title: string;
    description: string;
    language: string;
    createdAt: string;
    author: {
      name: string;
      image: string | null;
      slug: string;
    };
    _count: {
      likes: number;
    };
  };
}

export function PopularSnippetCard({ snippet }: PopularSnippetCardProps) {
  return (
    <Link href={`/snippets/${snippet.id}`} className="block">
      <Card className="hover:shadow-md transition-shadow cursor-pointer group w-full">
        <CardContent className="p-3">
          <div className="space-y-3 min-w-0">
            {/* Header with language badge */}
            <div className="flex items-center justify-between gap-2">
              <Badge variant="secondary" className="text-xs flex-shrink-0 truncate max-w-[120px]">
                {snippet.language}
              </Badge>
              <div className="flex items-center space-x-1 text-muted-foreground flex-shrink-0">
                <Heart className="h-3 w-3" />
                <span className="text-xs">{snippet._count.likes}</span>
              </div>
            </div>

            {/* Title */}
            <h3 className="font-medium text-sm line-clamp-2 group-hover:text-primary transition-colors min-w-0">
              {snippet.title}
            </h3>

            {/* Description */}
            <p className="text-xs text-muted-foreground line-clamp-2 min-w-0">
              {snippet.description}
            </p>

            {/* Author and date */}
            <div className="flex items-center justify-between gap-2 min-w-0">
              <div className="flex items-center space-x-2 min-w-0 flex-1">
                <Avatar className="h-4 w-4 flex-shrink-0">
                  <AvatarImage src={snippet.author.image || "/placeholder.svg"} />
                  <AvatarFallback className="text-xs">
                    {snippet.author.name?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground truncate min-w-0">
                  {snippet.author.name}
                </span>
              </div>
              <span className="text-xs text-muted-foreground flex-shrink-0">
                {(() => {
                  try {
                    const date = new Date(snippet.createdAt);
                    if (!isNaN(date.getTime())) {
                      const timeAgo = formatDistanceToNow(date, { addSuffix: true });
                      // Shorten common time formats for space
                      return timeAgo
                        .replace('about ', '')
                        .replace(' ago', '')
                        .replace('minutes', 'min')
                        .replace('hours', 'hr')
                        .replace('days', 'd')
                        .replace('months', 'mo')
                        .replace('years', 'yr');
                    }
                    return '';
                  } catch (e) {
                    return '';
                  }
                })()}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}