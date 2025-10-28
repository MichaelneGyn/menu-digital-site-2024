
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
  debug: process.env.NODE_ENV === 'development', // Debug apenas em desenvolvimento
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        // 🔒 SEGURANÇA: Logs apenas em desenvolvimento
        if (process.env.NODE_ENV === 'development') {
          console.log('🔐 Tentativa de login:', { email: credentials?.email });
        }
        
        if (!credentials?.email || !credentials?.password) {
          if (process.env.NODE_ENV === 'development') {
            console.log('❌ Credenciais inválidas');
          }
          return null;
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
            include: { restaurants: true }
          });

          if (process.env.NODE_ENV === 'development') {
            console.log('👤 Usuário encontrado:', user ? 'Sim' : 'Não');
          }

          if (!user?.password) {
            if (process.env.NODE_ENV === 'development') {
              console.log('❌ Usuário não tem senha');
            }
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          // 🔒 Não logar resultado de validação em produção (facilita brute force)
          if (process.env.NODE_ENV === 'development') {
            console.log('🔑 Senha válida:', isPasswordValid ? 'Sim' : 'Não');
          }

          if (!isPasswordValid) {
            return null;
          }

          if (process.env.NODE_ENV === 'development') {
            console.log('✅ Login bem-sucedido para:', user.email);
          }
          return {
            id: user.id,
            email: user.email,
            name: user.name,
          };
        } catch (error) {
          // 🔒 Sempre logar erros (mas sem expor detalhes sensíveis)
          console.error('❌ Erro na autenticação:', process.env.NODE_ENV === 'development' ? error : 'Erro interno');
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
