import React from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Lightbulb,
  User,
  LogOut,
  PlusIcon,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoginButton } from "@/components/auth/login-button";
import { currentUser } from "@/lib/auth";
import { logout } from "@/actions/logout";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ModeToggle } from "./ModeToggle";
import { ExtendedUser } from "@/schemas";

// Navigation items based on actual available routes
const navItems = [
  { href: "/snippets", label: "Browse Snippets", icon: Search },
  {
    href: "/dashboard",
    label: "Dashboard",
    requiresAuth: true,
    icon: LayoutDashboard,
  },
];

const NavBar = async () => {
  const user = (await currentUser()) as ExtendedUser | undefined;

  return (
    <div className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="group flex items-center gap-2 text-xl font-bold text-foreground transition-all duration-300 hover:scale-105"
          >
            <div className="relative">
              <Lightbulb className="h-6 w-6 text-yellow-500 transition-all duration-300 group-hover:text-yellow-400" />
              <div className="absolute -inset-1 animate-pulse rounded-full bg-yellow-500/20 group-hover:bg-yellow-400/30" />
            </div>
            <span className="hidden bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent md:block">
              Snipshare
            </span>
          </Link>

          <nav className="flex items-center gap-2">
            {navItems.map(
              (item) =>
                (!item.requiresAuth || user) && (
                  <Button
                    key={item.href}
                    variant="ghost"
                    asChild
                    className="group flex items-center gap-2 transition-all duration-300 hover:bg-primary/10"
                  >
                    <Link href={item.href}>
                      <item.icon className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                      <span className="font-medium">{item.label}</span>
                    </Link>
                  </Button>
                )
            )}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {user && (
            <Button
              variant="outline"
              className="aspect-square gap-2 max-sm:p-0"
              asChild
            >
              <Link
                href="/snippets/create"
                className="flex items-center gap-2 font-medium group max-sm:sr-only"
              >
                <PlusIcon
                  className="opacity-60 sm:-ms-1 transform transition-transform duration-300 group-hover:rotate-180"
                  size={16}
                  aria-hidden="true"
                />
                Create
              </Link>
            </Button>
          )}

          <div className="transition-transform duration-300 hover:scale-105">
            <ModeToggle />
          </div>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full transition-transform duration-300 hover:scale-105 focus:ring-2 focus:ring-primary/50"
                >
                  <Avatar className="h-10 w-10 border-2 border-primary/20">
                    <AvatarImage
                      src={user.image || ""}
                      alt={user.name || "User avatar"}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-primary/10 text-sm font-semibold">
                      {user.name?.substring(0, 2).toUpperCase() ?? "AA"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-56 animate-in fade-in-0 zoom-in-95"
                align="end"
                forceMount
              >
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.name}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link
                      href={`/${user.slug}`}
                      className="cursor-pointer transition-colors duration-300 hover:bg-primary/10"
                    >
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer text-red-600 transition-colors duration-300 hover:bg-red-100 focus:bg-red-100 dark:hover:bg-red-900/50 dark:focus:bg-red-900/50"
                  asChild
                >
                  <form action={logout} className="w-full">
                    <button type="submit" className="flex w-full items-center">
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </button>
                  </form>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <LoginButton>
              <Button className="font-medium transition-transform duration-300 hover:scale-105">
                Sign In
              </Button>
            </LoginButton>
          )}
        </div>
      </div>
    </div>
  );
};

export default NavBar;
