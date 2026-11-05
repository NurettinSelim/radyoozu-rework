import NextAuth, { type Session } from "next-auth";
import Google from "next-auth/providers/google";

const ADMIN_EMAIL = (process.env.ADMIN_EMAIL ?? "").trim().toLowerCase();
const HOSTED_DOMAIN = process.env.AUTH_GOOGLE_HD ?? "ozyegin.edu.tr";

// Re-checked per request, not only at sign-in: a valid session for any other
// email (e.g. after ADMIN_EMAIL changes) is not an admin session.
export function isAdminSession(
  session: Session | null | undefined,
): session is Session & { user: { email: string } } {
  if (!ADMIN_EMAIL || !session?.user?.isAdmin) return false;
  return session.user.email?.toLowerCase() === ADMIN_EMAIL;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  providers: [
    Google({
      authorization: { params: { hd: HOSTED_DOMAIN, prompt: "select_account" } },
    }),
  ],
  pages: { signIn: "/admin/login" },
  // 12h instead of the 30-day default; each /admin request re-issues the
  // cookie, so only idle sessions lapse.
  session: { strategy: "jwt", maxAge: 12 * 60 * 60 },
  callbacks: {
    async signIn({ profile }) {
      const email = profile?.email?.toLowerCase();
      if (!email) return false;
      if (!ADMIN_EMAIL) return false;
      // Belt-and-suspenders: Google enforces hd + exact email, but we verify both here too.
      if (profile?.email_verified === false) return false;
      if (HOSTED_DOMAIN && !email.endsWith(`@${HOSTED_DOMAIN}`)) return false;
      return email === ADMIN_EMAIL;
    },
    async session({ session }) {
      if (session.user) session.user.isAdmin = true;
      return session;
    },
    async authorized({ auth: session, request }) {
      const isAdminRoute =
        request.nextUrl.pathname.startsWith("/admin") &&
        request.nextUrl.pathname !== "/admin/login";
      if (!isAdminRoute) return true;
      return isAdminSession(session);
    },
  },
});

declare module "next-auth" {
  interface User {
    isAdmin?: boolean;
  }
  interface Session {
    user: {
      isAdmin?: boolean;
    } & import("next-auth").DefaultSession["user"];
  }
}
