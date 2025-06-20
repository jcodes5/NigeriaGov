
import NextAuth from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import prisma from '@/lib/prisma';
import type { NextAuthConfig, User as NextAuthUser } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GoogleProvider from "next-auth/providers/google";
import bcrypt from 'bcryptjs';

// Define providers here as you add them
const providers = [
  GoogleProvider({
    clientId: process.env.GOOGLE_CLIENT_ID as string,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
  }),
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
        // User not found or password not set (e.g., OAuth user trying credentials)
        throw new Error('Invalid email or password.');
      }

      const isValidPassword = await bcrypt.compare(credentials.password as string, user.password);

      if (!isValidPassword) {
        throw new Error('Invalid email or password.');
      }
      
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role, 
      };
    }
  }),
  // FacebookProvider will be added here
];

export const authOptions: NextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  providers: providers,
  session: {
    strategy: 'jwt', 
  },
  pages: {
    signIn: '/login', 
    // error: '/auth/error', 
    // verifyRequest: '/auth/verify-request', 
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (account && user) { // Persist user ID and role to the JWT
        token.id = user.id;
        token.role = (user as any).role; 
      }
      return token;
    },
    async session({ session, token }) {
      if (token.id && session.user) {
        session.user.id = token.id as string;
      }
      if (token.role && session.user) {
        (session.user as any).role = token.role; 
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
