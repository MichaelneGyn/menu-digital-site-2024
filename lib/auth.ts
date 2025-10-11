
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
  adapter: PrismaAdapter(prisma as any),
  secret: process.env.NEXTAUTH_SECRET,
  // trustHost: true, // REMOVED: property not allowed in AuthOptions
  debug: true, // Sempre ativar debug para ver logs
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        console.log('🔐 Tentativa de login:', { email: credentials?.email });
        
        if (!credentials?.email || !credentials?.password) {
          console.log('❌ Credenciais inválidas');
          return null;
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            include: { restaurants: true }
          });

          console.log('👤 Usuário encontrado:', user ? 'Sim' : 'Não');

          if (!user?.password) {
            console.log('❌ Usuário não tem senha');
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          console.log('🔑 Senha válida:', isPasswordValid ? 'Sim' : 'Não');

          if (!isPasswordValid) {
            return null;
          }

          console.log('✅ Login bem-sucedido para:', user.email);
          return {
            id: user.id,
            email: user.email,
            name: user.name,
          };
        } catch (error) {
          console.error('❌ Erro na autenticação:', error);
          return null;
        }
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
    },
    async redirect({ url, baseUrl }) {
      // Permite redirecionamentos para URLs do mesmo domínio
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      // Permite redirecionamentos para o baseUrl
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    }
  },
  pages: {
    signIn: '/auth/login',
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
