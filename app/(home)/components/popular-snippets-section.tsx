"use client";

import { motion } from "framer-motion";
import { Sparkles, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SnippetCard } from "@/components/SnippetCard";

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
    <section className="py-12 md:py-16 lg:py-24 px-4 md:px-6 lg:px-8">
      <div className="container mx-auto">
        <div className="text-center mb-8 md:mb-12 lg:mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 text-sm text-primary font-medium bg-primary/10 py-2 px-4 rounded-full mb-4 md:mb-6"
          >
            <Sparkles className="h-4 w-4" />
            <span>Featured Snippets</span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            viewport={{ once: true }}
            className="text-2xl md:text-3xl lg:text-4xl font-bold tracking-tight mb-3 md:mb-4"
          >
            Popular Code Snippets
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            viewport={{ once: true }}
            className="text-sm md:text-base text-muted-foreground max-w-[90%] md:max-w-[600px] mx-auto px-2"
          >
            Discover the most useful and popular code snippets from our community
          </motion.p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          viewport={{ once: true }}
          className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 max-w-7xl mx-auto"
        >
          {displaySnippets.length === 0 ? (
            // Loading skeleton - mobile responsive
            [...Array(3)].map((_, i) => (
              <div 
                key={i} 
                className="rounded-xl border bg-card p-4 md:p-6 space-y-3 md:space-y-4 animate-pulse"
              >
                <div className="h-5 md:h-6 bg-muted rounded w-3/4" />
                <div className="space-y-2">
                  <div className="h-3 md:h-4 bg-muted rounded w-full" />
                  <div className="h-3 md:h-4 bg-muted rounded w-5/6" />
                </div>
                <div className="flex gap-2">
                  <div className="h-5 md:h-6 w-14 md:w-16 bg-muted rounded-full" />
                  <div className="h-5 md:h-6 w-14 md:w-16 bg-muted rounded-full" />
                </div>
                <div className="h-24 md:h-32 bg-muted rounded" />
              </div>
            ))
          ) : (
            displaySnippets.slice(0, 3).map((snippet: any, index: number) => (
              <motion.div
                key={snippet.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 * (index + 1) }}
                viewport={{ once: true }}
                className="h-full"
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
          transition={{ duration: 0.5, delay: 0.6 }}
          viewport={{ once: true }}
          className="flex justify-center mt-8 md:mt-12"
        >
          <Button 
            variant="outline" 
            size="lg" 
            className="h-10 md:h-12 px-6 md:px-8 text-sm md:text-base font-medium group hover:bg-primary hover:text-primary-foreground transition-all duration-300" 
            asChild
          >
            <Link href="/snippets">
              View All Snippets
              <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </motion.div>
      </div>
    </section>
  );
}