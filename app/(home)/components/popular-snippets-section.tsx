"use client";

import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {SnippetCard} from "@/components/SnippetCard";

interface PopularSnippetsSectionProps {
  popularSnippets: any[];
  recentSnippets: any[];
}

export default function PopularSnippetsSection({ 
  popularSnippets, 
  recentSnippets 
}: PopularSnippetsSectionProps) {
  const displaySnippets = popularSnippets.length > 0 ? popularSnippets : recentSnippets;

  return (
    <div className="py-24 px-24">
      <div className="container">
        <div className="text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 text-sm text-primary font-medium bg-primary/10 py-1 px-3 rounded-full mb-4"
          >
            <Sparkles className="h-4 w-4" />
            <span>Featured Snippets</span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-3xl font-bold tracking-tight mb-4"
          >
            Popular Code Snippets
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-muted-foreground max-w-[600px] mx-auto"
          >
            Discover the most useful and popular code snippets from our community
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {displaySnippets.length === 0 ? (
            // Loading skeleton
            [...Array(6)].map((_, i) => (
              <div key={i} className="rounded-xl border bg-card p-6 space-y-4 animate-pulse">
                <div className="h-6 bg-muted rounded w-3/4" />
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-full" />
                  <div className="h-4 bg-muted rounded w-5/6" />
                </div>
                <div className="flex gap-2">
                  <div className="h-6 w-16 bg-muted rounded-full" />
                  <div className="h-6 w-16 bg-muted rounded-full" />
                </div>
              </div>
            ))
          ) : (
            displaySnippets.map((snippet: any, index: number) => (
              <motion.div
                key={snippet.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * index }}
                viewport={{ once: true }}
              >
                <SnippetCard 
                  snippet={snippet} 
                  isPreview={true}
                />
              </motion.div>
            ))
          )}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          viewport={{ once: true }}
          className="flex justify-center mt-12"
        >
          <Button variant="outline" size="lg" className="h-12 px-6" asChild>
            <Link href="/snippets">
              View All Snippets
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </div>
  );
}