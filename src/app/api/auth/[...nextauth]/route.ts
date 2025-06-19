
import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import prisma from '@/lib/prisma';
import type { NextAuthConfig } from 'next-auth';

// Define providers here as you add them, e.g., Google, Email, Credentials
// For now, an empty array or a placeholder provider.
// We will add Google, Facebook, and Email/Credentials providers in subsequent steps.
const providers = [];

export const authOptions: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  providers: providers,
  session: {
    strategy: 'jwt', // Using JWT for session strategy
  },
  pages: {
    signIn: '/login', // Custom login page
    // error: '/auth/error', // Custom error page (optional)
    // verifyRequest: '/auth/verify-request', // For Email provider (magic links)
  },
  callbacks: {
    async session({ session, token }) {
      // Add user ID and role to the session object
      if (token.sub && session.user) {
        session.user.id = token.sub;
      }
      if (token.role && session.user) {
        // Assuming role is stored in the token, which we'll set up in jwt callback
        (session.user as any).role = token.role;
      }
      return session;
    },
    async jwt({ token, user }) {
      // Persist user ID and role to the JWT
      if (user) {
        token.sub = user.id;
        // If your User model in DB has a 'role' field, cast 'user' to include it
        // This assumes your Prisma adapter returns the user object with 'role'
        const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
        if (dbUser && dbUser.role) {
           token.role = dbUser.role;
        }
      }
      return token;
    },
  },
  // Events can be used for things like creating a user profile in your own tables
  // if the adapter doesn't handle it exactly as you want, or for sending welcome emails.
  // events: {
  //   async signIn(message) { /* on successful sign in */ },
  //   async createUser(message) { /* user created */ }
  // }
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
