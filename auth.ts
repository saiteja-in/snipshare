import NextAuth from "next-auth";
import authConfig from "./auth.config";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { db } from "./lib/db";
import { slugify } from "@/lib/slugify";
import { getUserById } from "@/actions/user";
import { getAccountByUserId } from "@/data/account";
import { UserRole } from "@prisma/client";

// 1) Grab the vanilla PrismaAdapter and cast to any so TS won’t block us
const prismaAdapter: any = PrismaAdapter(db);

// 2) Wrap/override only the createUser method
const adapter: any = {
  ...prismaAdapter,
  createUser: async (userData: any) => {
    // build a slug base from name or email prefix
    const base = slugify(userData.name ?? userData.email.split("@")[0]);
    let unique = base;
    let i = 1;

    // loop to ensure uniqueness
    while (await db.user.findUnique({ where: { slug: unique } })) {
      unique = `${base}-${i++}`;
    }

    // inject slug into the data
    const dataWithSlug = { ...userData, slug: unique };

    // call the original createUser
    return prismaAdapter.createUser(dataWithSlug);
  },
};

export const { handlers, signIn, signOut, auth, unstable_update } = NextAuth({
  adapter,
  session: { strategy: "jwt" },
  secret: process.env.NEXTAUTH_SECRET,
  ...authConfig,

  pages: {
    signIn: "/auth/login",
    error:  "/auth/error",
  },

  // you already had linkAccount — we leave it intact
  events: {
    async linkAccount({ user }) {
      await db.user.update({
        where: { id: user.id },
        data:  { emailVerified: new Date() },
      });
    },
  },

  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider !== "credentials") return true;
      const u = await getUserById(user.id!);
      return !!u?.emailVerified;
    },

    async session({ token, session }) {
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      if (token.role && session.user) {
        session.user.role = token.role as UserRole;
      }
      if (session.user) {
        session.user.name    = token.name    as string;
        session.user.email   = token.email   as string;
        session.user.isOAuth = token.isOAuth as boolean;
      }
      return session;
    },

    async jwt({ token }) {
      if (!token.sub) return token;
      const u = await getUserById(token.sub);
      if (!u) return token;
      const acct = await getAccountByUserId(u.id);
      token.isOAuth = !!acct;
      token.name    = u.name;
      token.email   = u.email;
      token.role    = u.role;
      return token;
    },
  },
});
