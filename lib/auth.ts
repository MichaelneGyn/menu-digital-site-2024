
import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import EmailProvider from "next-auth/providers/email";
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import bcrypt from 'bcryptjs';
import { prisma } from './db';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

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
  debug: process.env.NODE_ENV === 'development',
  providers: [
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD
        }
      },
      from: 'nao-responda@virtualcardapio.com.br',
      async sendVerificationRequest({ identifier: email, url }) {
        const { host } = new URL(url);
        try {
          await resend.emails.send({
            from: 'Menu Digital <nao-responda@virtualcardapio.com.br>',
            to: email,
            subject: `Ative sua conta no Menu Digital`,
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #ff6b35;">Bem-vindo ao Menu Digital! 🚀</h1>
                <p>Você está a um passo de criar seu cardápio digital.</p>
                <p>Clique no botão abaixo para confirmar seu e-mail e acessar sua conta:</p>
                <a href="${url}" style="display: inline-block; background-color: #ff6b35; color: white; padding: 12px 24px; border-radius: 5px; text-decoration: none; font-weight: bold; margin-top: 10px;">
                  Confirmar E-mail e Entrar
                </a>
                <p style="margin-top: 20px; font-size: 12px; color: #666;">Se você não solicitou este e-mail, pode ignorá-lo com segurança.</p>
              </div>
            `
          });
        } catch (error) {
          console.error('Erro ao enviar e-mail de verificação:', error);
          throw new Error('Falha ao enviar e-mail de verificação');
        }
      },
    }),
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
