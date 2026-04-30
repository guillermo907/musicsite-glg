import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { isAdminEmail } from "@/lib/admin-emails";

export const { handlers, auth, signIn, signOut } = NextAuth({
  secret:
    process.env.AUTH_SECRET ??
    process.env.NEXTAUTH_SECRET ??
    (process.env.NODE_ENV !== "production" ? "local-development-secret-change-before-deploy" : undefined),
  trustHost: true,
  session: {
    strategy: "jwt"
  },
  pages: {
    signIn: "/admin/login",
    error: "/admin/login",
    verifyRequest: "/admin/login?check=email"
  },
  providers: [Google],
  callbacks: {
    async signIn({ user }) {
      return isAdminEmail(user.email);
    }
  }
});
