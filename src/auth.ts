import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Nodemailer from "next-auth/providers/nodemailer";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";
import { isAdminEmail } from "@/lib/admin-emails";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  secret:
    process.env.AUTH_SECRET ??
    (process.env.NODE_ENV !== "production" ? "local-development-secret-change-before-deploy" : undefined),
  trustHost: true,
  session: {
    strategy: "database"
  },
  pages: {
    signIn: "/admin/login",
    verifyRequest: "/admin/login?check=email"
  },
  providers: [
    Google,
    Nodemailer({
      server: process.env.EMAIL_SERVER ?? "smtp://localhost:1025",
      from: process.env.EMAIL_FROM ?? "Guillermo Lopez <no-reply@localhost>"
    })
  ],
  callbacks: {
    async signIn({ user }) {
      return isAdminEmail(user.email);
    }
  }
});
