import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import EmailProvider from 'next-auth/providers/email';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import bcrypt from 'bcryptjs';
import { Resend } from 'resend';
import { prisma } from './db';
import { normalizeEmail } from './email-verification';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function getUserByEmail(email?: string) {
  if (!email) return null;
  return prisma.user.findUnique({ where: { email: normalizeEmail(email) } });
}

export async function userIsAdmin(email?: string) {
  if (!email) return false;
  const user = await getUserByEmail(email);
  return user?.role === 'ADMIN';
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
  providers: [
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: Number(process.env.EMAIL_SERVER_PORT),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: 'nao-responda@virtualcardapio.com.br',
      async sendVerificationRequest({ identifier: email, url }) {
        try {
          await resend.emails.send({
            from: 'Menu Digital <nao-responda@virtualcardapio.com.br>',
            to: email,
            subject: 'Ative sua conta no Menu Digital',
            html: `
              <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
                <h1 style="color: #ff6b35;">Bem-vindo ao Menu Digital!</h1>
                <p>Voce esta a um passo de criar seu cardapio digital.</p>
                <p>Clique no botao abaixo para confirmar seu email e acessar sua conta:</p>
                <a href="${url}" style="display: inline-block; background-color: #ff6b35; color: white; padding: 12px 24px; border-radius: 5px; text-decoration: none; font-weight: bold; margin-top: 10px;">
                  Confirmar email e entrar
                </a>
                <p style="margin-top: 20px; font-size: 12px; color: #666;">Se voce nao solicitou este email, pode ignora-lo com seguranca.</p>
              </div>
            `,
          });
        } catch (error) {
          console.error('Erro ao enviar e-mail de verificacao:', error);
          throw new Error('Falha ao enviar e-mail de verificacao');
        }
      },
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (process.env.NODE_ENV === 'development') {
          console.log('Tentativa de login:', { email: credentials?.email });
        }

        if (!credentials?.email || !credentials?.password) {
          if (process.env.NODE_ENV === 'development') {
            console.log('Credenciais invalidas');
          }
          return null;
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: normalizeEmail(credentials.email) },
            include: { restaurants: true },
          });

          if (process.env.NODE_ENV === 'development') {
            console.log('Usuario encontrado:', user ? 'Sim' : 'Nao');
          }

          if (!user?.password) {
            if (process.env.NODE_ENV === 'development') {
              console.log('Usuario nao tem senha');
            }
            return null;
          }

          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);

          if (process.env.NODE_ENV === 'development') {
            console.log('Senha valida:', isPasswordValid ? 'Sim' : 'Nao');
          }

          if (!isPasswordValid) {
            return null;
          }

          if (!user.emailVerified) {
            throw new Error('EMAIL_NOT_VERIFIED');
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
          };
        } catch (error) {
          if (error instanceof Error && error.message === 'EMAIL_NOT_VERIFIED') {
            throw error;
          }

          console.error(
            'Erro na autenticacao:',
            process.env.NODE_ENV === 'development' ? error : 'Erro interno'
          );
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
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
        (session.user as typeof session.user & { id: string }).id = token.id as string;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith('/')) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  pages: {
    signIn: '/auth/login',
  },
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
