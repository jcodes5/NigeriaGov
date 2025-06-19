
import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import prisma from '@/lib/prisma';
import type { NextAuthConfig, User as NextAuthUser } from 'next-auth'; // Import User type from next-auth
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';

// Define providers here as you add them
const providers = [
  CredentialsProvider({
    name: 'Credentials',
    credentials: {
      email: { label: "Email", type: "email" },
      password: { label: "Password", type: "password" }
    },
    async authorize(credentials) {
      if (!credentials?.email || !credentials.password) {
        throw new Error('Email and password are required.');
      }

      const user = await prisma.user.findUnique({
        where: { email: credentials.email as string },
      });

      if (!user || !user.password) {
        // User not found or password not set (e.g., OAuth user)
        throw new Error('Invalid email or password.');
      }

      const isValidPassword = await bcrypt.compare(credentials.password as string, user.password);

      if (!isValidPassword) {
        throw new Error('Invalid email or password.');
      }
      
      // Return user object that NextAuth expects
      // Ensure this matches the shape expected by your session/jwt callbacks
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role, // Custom property
      };
    }
  }),
  // GoogleProvider will be added here
  // FacebookProvider will be added here
];

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
    async jwt({ token, user }) {
      // Persist user ID and role to the JWT
      if (user) { // user object is available during sign-in
        token.id = user.id;
        token.role = (user as any).role; // Cast if 'role' is not in NextAuthUser type
      }
      return token;
    },
    async session({ session, token }) {
      // Add user ID and role to the session object from the JWT
      if (token.id && session.user) {
        session.user.id = token.id as string;
      }
      if (token.role && session.user) {
        (session.user as any).role = token.role; // Cast if 'role' is not in Session['user'] type
      }
      return session;
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
