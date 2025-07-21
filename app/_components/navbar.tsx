// app/components/navbar.tsx

import React from "react";
import Link from "next/link";
import {
  LayoutDashboard,
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
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ModeToggle } from "./ModeToggle";
import { ExtendedUser } from "@/schemas";

// Define navigation items
const navItems = [
  { href: "/snippets", label: "Browse Snippets", icon: Search },
  { href: "/dashboard", label: "Dashboard", requiresAuth: true, icon: LayoutDashboard },
];

const NavBar = async () => {
  const user = (await currentUser()) as ExtendedUser | undefined;

  return (
    <header className="border-b px-4 md:px-6 sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center justify-between gap-4">
        {/* Left section: Brand and Nav Items */}
        <div className="flex items-center gap-2">
          {/* Mobile menu (popover) */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                className="group size-8 md:hidden"
                variant="ghost"
                size="icon"
              >
                <svg
                  width={16}
                  height={16}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-menu"
                >
                  <path d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </Button>
            </PopoverTrigger>

            <PopoverContent align="start" className="w-36 p-1 md:hidden">
              <NavigationMenu className="max-w-none *:w-full">
                <NavigationMenuList className="flex-col items-start gap-0">
                  {navItems.map(
                    (item) =>
                      (!item.requiresAuth || user) && (
                        <NavigationMenuItem key={item.href} className="w-full">
                          <NavigationMenuLink
                            href={item.href}
                            className="py-1.5 flex items-center gap-2"
                          >
                            <item.icon className="h-4 w-4" />
                            {item.label}
                          </NavigationMenuLink>
                        </NavigationMenuItem>
                      )
                  )}
                </NavigationMenuList>
              </NavigationMenu>
            </PopoverContent>
          </Popover>

          {/* Desktop nav + logo */}
          <div className="flex items-center gap-6">
            <Link href="/" className="text-xl font-bold font-reggae-one">
              SnipShare
            </Link>

            <NavigationMenu className="max-md:hidden">
              <NavigationMenuList className="gap-2">
                {navItems.map(
                  (item) =>
                    (!item.requiresAuth || user) && (
                      <NavigationMenuItem key={item.href}>
                        <NavigationMenuLink
                          href={item.href}
                          className="text-muted-foreground hover:text-primary py-1.5 font-medium flex items-center gap-2"
                        >
                          <item.icon className="h-4 w-4" />
                          {item.label}
                        </NavigationMenuLink>
                      </NavigationMenuItem>
                    )
                )}
              </NavigationMenuList>
            </NavigationMenu>
          </div>
        </div>

        {/* Right section: Create Button / Auth / Avatar / Mode Toggle */}
        <div className="flex items-center gap-2">
          {user && (
            <Button variant="outline" size="sm" asChild>
              <Link
                href="/snippets/create"
                className="flex items-center gap-2 font-medium group"
              >
                <PlusIcon
                  className="opacity-60 transition-transform duration-300 group-hover:rotate-180"
                  size={16}
                />
                <span className="max-sm:hidden">Create</span>
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
                  className="h-8 w-8 rounded-full hover:scale-105 transition-transform"
                  size="icon"
                >
                  <Avatar className="h-8 w-8 border-2 border-primary/20">
                    <AvatarImage
                      src={user.image || ""}
                      alt={user.name || "User avatar"}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-primary/10 text-xs font-semibold">
                      {user.name?.substring(0, 2).toUpperCase() ?? "AA"}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>

              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator />

                <DropdownMenuGroup>
                  <DropdownMenuItem asChild>
                    <Link
                      href={`/${user.slug}`}
                      className="cursor-pointer hover:bg-primary/10"
                    >
                      <User className="mr-2 h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>

                <DropdownMenuSeparator />

                <DropdownMenuItem asChild className="text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50">
                  <form action={logout} className="w-full">
                    <button type="submit" className="flex w-full items-center">
                      <LogOut className="mr-2 h-4 w-4" />
                      Log out
                    </button>
                  </form>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <LoginButton>
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </LoginButton>
              <LoginButton>
                <Button size="sm">Get Started</Button>
              </LoginButton>
            </>
          )}
        </div>
      </div>
    </header>
  );
};

export default NavBar;
