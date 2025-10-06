
import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import bcrypt from 'bcryptjs';
import { prisma } from './db';

export async function getUserByEmail(email?: string) {
  if (!email) return null;
  return prisma.user.findUnique({ where: { email } });
}

export async function userIsAdmin(email?: string) {
  if (!email) return false;
  const user = await getUserByEmail(email);
  return user?.role === 'ADMIN';
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV !== 'production',
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
          include: { restaurants: true }
        });

        if (!user?.password) {
          return null;
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
        };
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        (session.user as any).id = token.id as string;
      }
      return session;
    }
  },
  pages: {
    signIn: '/auth/login',
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
