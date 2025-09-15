// src/lib/auth.ts
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import { db as prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/hash";
import type { NextAuthOptions } from "next-auth";
import type { Role } from "@/generated/prisma"; // use your generated client types

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials) return null;

        const { email, password } = credentials;
        const user = await prisma.user.findUnique({ where: { email } });

        if (!user) return null;

        // Prevent login if email is not verified
        if (!user.emailVerified) {
          throw new Error(
            "Email not verified. Please verify your email first."
          );
        }

        const isValid = await verifyPassword(password, user.passwordHash);
        if (!isValid) return null;

        // Return minimal user object (merged into JWT)
        return {
          id: String(user.id),
          email: user.email,
          name: user.fullName,
          role: user.role as Role, // can be USER, MANAGER, or ADMIN
          image: user.avatarUrl ?? null,
          isVerified: user.emailVerified,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      // Initial login
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role; // propagate enum role
      }
      return session;
    },
  },
  pages: {
    signIn: "/", // login modal
  },
};
