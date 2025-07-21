"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { motion } from "framer-motion";
import { Code2, Sparkles, ArrowRight, Play } from "lucide-react";
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

const stats = [
  { value: "10K+", label: "Snippets" },
  { value: "5K+", label: "Developers" },
  { value: "50+", label: "Languages" },
];

interface HeroSectionProps {
  user: any;
}

export default function HeroSection({ user }: HeroSectionProps) {
  return (
    <div className="relative overflow-hidden min-h-[90vh] flex items-center">
      {/* Enhanced Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-background" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 via-transparent to-transparent" />
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03] bg-[linear-gradient(to_right,#000_1px,transparent_1px),linear-gradient(to_bottom,#000_1px,transparent_1px)] bg-[size:4rem_4rem]" />
      </div>
      
      <div className="container relative z-10 mx-auto px-4">
        <div className="flex flex-col items-center text-center py-16 md:py-20 lg:py-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex flex-col items-center gap-8 md:gap-12 max-w-4xl"
          >
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="group relative"
            >
              <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-primary/10 rounded-full blur-sm group-hover:blur-md transition-all duration-300" />
              <div className="relative flex items-center justify-center gap-2 text-sm font-medium bg-background/80 backdrop-blur-sm border border-primary/20 px-4 py-2 rounded-full hover:bg-primary/5 transition-all duration-300">
                <Sparkles className="h-4 w-4 text-primary" />
                <span>Share your code with the world</span>
              </div>
            </motion.div>

            {/* Main heading */}
            <div className="space-y-4 md:space-y-6">
  <motion.h1
    className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay: 0.2 }}
  >
    <span className="bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground to-foreground/70">
      Share & Discover
    </span>
    <br />
    <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-primary to-primary/80">
      Code Snippets
    </span>
  </motion.h1>

  <motion.p
    className="text-sm md:text-base lg:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.6, delay: 0.3 }}
  >
    A modern platform for developers to share, discover, and reuse code snippets. 
    Save time, learn faster, and build better with our curated collection.
  </motion.p>
</div>

            {/* CTA Buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center items-center w-full sm:w-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              {user ? (
                <Button size="lg" className="h-12 px-8 text-base group relative overflow-hidden" asChild>
                  <Link href="/snippets/create">
                    <Code2 className="mr-2 h-5 w-5 transition-transform group-hover:scale-110" />
                    Create Snippet
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              ) : (
                <Button size="lg" className="h-12 px-8 text-base group relative overflow-hidden" asChild>
                  <Link href="/auth/register">
                    Get Started
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              )}
              
              <Button 
                size="lg" 
                variant="outline" 
                className="h-12 px-8 text-base group border-2 hover:bg-muted/50" 
                asChild
              >
                <Link href="/snippets">
                  <Play className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
                  Browse Snippets
                </Link>
              </Button>
            </motion.div>

            {/* Social proof section */}
            <motion.div
              className="flex flex-col sm:flex-row items-center gap-6 sm:gap-8 mt-8"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              {/* User avatars */}
              <div className="flex items-center gap-4">
                <div className="flex -space-x-3">
                  {avatars.map((avatar, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.6 + i * 0.1 }}
                      className="h-10 w-10 rounded-full border-3 border-background relative overflow-hidden ring-2 ring-primary/20 hover:ring-primary/40 transition-all duration-300"
                    >
                      <Image
                        src={avatar.image}
                        alt={avatar.alt}
                        fill
                        className="object-cover"
                      />
                    </motion.div>
                  ))}
                </div>
                <div className="text-sm text-muted-foreground">
                  <p className="font-medium">Join 5,000+ developers</p>
                  <p>sharing their code</p>
                </div>
              </div>

              {/* Stats */}
              <div className="hidden sm:block w-px h-12 bg-border" />
              <div className="flex gap-6">
                {stats.map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.7 + i * 0.1 }}
                    className="text-center"
                  >
                    <div className="text-lg font-bold text-foreground">{stat.value}</div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Floating elements for visual interest */}
      {/* <div className="absolute top-1/4 left-10 w-2 h-2 bg-primary/30 rounded-full animate-pulse hidden lg:block" />
      <div className="absolute top-1/3 right-20 w-1 h-1 bg-primary/40 rounded-full animate-pulse hidden lg:block" />
      <div className="absolute bottom-1/4 left-1/4 w-1.5 h-1.5 bg-primary/20 rounded-full animate-pulse hidden lg:block" /> */}
    </div>
  );
}