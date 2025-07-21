"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
import { Code2, Sparkles } from "lucide-react";
import Image from "next/image";

const avatars = [
  {
    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?&w=64&h=64&dpr=2&q=70&crop=faces&fit=crop",
    alt: "Developer 1",
  },
  {
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?&w=64&h=64&dpr=2&q=70&crop=faces&fit=crop",
    alt: "Developer 2",
  },
  {
    image: "https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?&w=64&h=64&dpr=2&q=70&crop=faces&fit=crop",
    alt: "Developer 3",
  },
  {
    image: "https://images.unsplash.com/photo-1517841905240-472988babdf9?&w=64&h=64&dpr=2&q=70&crop=faces&fit=crop",
    alt: "Developer 4",
  },
];

interface HeroSectionProps {
  user: any;
}

export default function HeroSection({ user }: HeroSectionProps) {
  return (
    <div className="relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
      
      <div className="container relative">
        <div className="flex flex-col items-center text-center py-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col items-center gap-8 max-w-[800px]"
          >
            <div className="space-y-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="flex items-center justify-center gap-2 text-sm text-primary font-medium bg-primary/10 w-fit mx-auto py-1 px-3 rounded-full"
              >
                <Sparkles className="h-4 w-4" />
                <span>Share your code with the world</span>
              </motion.div>

              <motion.h1
                className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-foreground to-foreground/70"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                Share & Discover
                <span className="block text-primary">Code Snippets</span>
              </motion.h1>

              <motion.p
                className="text-lg text-muted-foreground max-w-[600px]"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                A modern platform for developers to share, discover, and reuse code snippets. 
                Save time and improve your workflow with our curated collection.
              </motion.p>
            </div>

            <motion.div
              className="flex flex-wrap gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              {user ? (
                <Button size="lg" className="h-12 px-6" asChild>
                  <Link href="/snippets/create">
                    <Code2 className="mr-2 h-5 w-5" />
                    Create Snippet
                  </Link>
                </Button>
              ) : (
                <Button size="lg" className="h-12 px-6" asChild>
                  <Link href="/auth/register">Get Started</Link>
                </Button>
              )}
              <Button size="lg" variant="outline" className="h-12 px-6" asChild>
                <Link href="/snippets">Browse Snippets</Link>
              </Button>
            </motion.div>

            <motion.div
              className="flex items-center gap-4 text-sm text-muted-foreground dark:bg-muted/50 bg-gray-200 rounded-full py-2 px-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <div className="flex -space-x-2">
                {avatars.map((avatar, i) => (
                  <div
                    key={i}
                    className="h-8 w-8 rounded-full border-2 border-background relative overflow-hidden"
                  >
                    <Image
                      src={avatar.image}
                      alt={avatar.alt}
                      fill
                      className="object-cover"
                    />
                  </div>
                ))}
              </div>
              <p>Join thousands of developers sharing their code</p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}