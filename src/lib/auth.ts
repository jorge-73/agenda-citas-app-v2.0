import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { db } from "./db";
import type { UserRole } from "@/types";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  providers: [
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        rememberMe: { label: "Recordarme", type: "hidden" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email as string },
        });

        if (!user || !user.password) {
          return null;
        }

        const isValid = await bcrypt.compare(
          credentials.password as string,
          user.password
        );

        if (!isValid) {
          return null;
        }

        const authorizedUser = {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role as UserRole,
          rememberMe: credentials.rememberMe === "true",
        };
        return authorizedUser;
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        if ((user as { rememberMe?: boolean }).rememberMe) {
          token.rememberMe = true;
        }
      }
      const userId = token.id as string | undefined;
      if (userId && !(token.timezone as string | undefined)) {
        const pref = await db.userPreference.findUnique({
          where: { userId },
          select: { timezone: true },
        });
        token.timezone = pref?.timezone || null;
      }
      if (!(token.rememberMe as boolean | undefined) && token.iat) {
        const sevenDays = 7 * 24 * 60 * 60;
        const age = Math.floor(Date.now() / 1000) - (token.iat as number);
        if (age > sevenDays) {
          return null;
        }
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
        session.user.preferences = { timezone: token.timezone as string | null | undefined };
      }
      return session;
    },
  },
});