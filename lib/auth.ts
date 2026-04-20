import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { prisma } from "./prisma"
import { sendWelcomeEmail } from "./email"
import { syncBrandActivityWithSubscription } from "./subscription-limits"
import bcrypt from "bcryptjs"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      email?: string | null
      name?: string | null
      image?: string | null
    }
  }
}

const nextAuthConfig = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
      allowDangerousEmailAccountLinking: true,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          })

          if (!user?.password_hash) {
            return null
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password_hash
          )

          if (!isPasswordValid) {
            return null
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          }
        } catch (error) {
          return null
        }
      },
    }),
  ],
  pages: { signIn: "/login" },
  callbacks: {
    async signIn({ user, account, profile }: any) {
      if (account?.provider === "google" && profile?.email) {
        const avatarUrl = profile.image || profile.picture || null
        
        try {
          let dbUser = await prisma.user.findUnique({
            where: { email: profile.email },
          })
          
          const isNewUser = !dbUser
          
          if (!dbUser) {
            dbUser = await prisma.user.create({
              data: {
                email: profile.email,
                name: profile.name || profile.email.split("@")[0],
                image: avatarUrl, 
                platform_role: "user",
                is_active: true,
              },
            })
            
            try {
              await sendWelcomeEmail(dbUser.email, dbUser.name || "User")
            } catch (emailError) {
              // Silently continue on email error
            }
          } else {
            dbUser = await prisma.user.update({
              where: { email: profile.email },
              data: {
                name: profile.name || dbUser.name,
                image: avatarUrl || dbUser.image,
              },
            })
          }
          
          if (dbUser) {
            user.id = dbUser.id
            user.email = dbUser.email
            user.name = dbUser.name
            user.image = dbUser.image
            user.isNewUser = isNewUser
            
            if (isNewUser) {
              const onboarding = await prisma.onboarding.findUnique({
                where: { user_id: dbUser.id },
              })
              
              if (!onboarding) {
                await prisma.onboarding.create({
                  data: { 
                    user_id: dbUser.id,
                    operator_type: "",
                  },
                })
              }
            }
            
            try {
              await prisma.account.upsert({
                where: {
                  provider_providerAccountId: {
                    provider: account.provider,
                    providerAccountId: account.providerAccountId,
                    },
                  },
                  create: {
                    userId: dbUser.id,
                    type: account.type || "oauth",
                    provider: account.provider,
                    providerAccountId: account.providerAccountId,
                    access_token: account.access_token || null,
                    refresh_token: account.refresh_token || null,
                    expires_at: account.expires_at || null,
                    token_type: account.token_type || null,
                    scope: account.scope || null,
                    id_token: account.id_token || null,
                  },
                  update: {
                    access_token: account.access_token || null,
                    refresh_token: account.refresh_token || null,
                    expires_at: account.expires_at || null,
                    token_type: account.token_type || null,
                    scope: account.scope || null,
                    id_token: account.id_token || null,
                  },
                })
            } catch (accountError) {
              // Silently continue on account error
            }
          }
        } catch (error) {
          return false
        }
      }
      return true
    },
    
    jwt({ token, user }: any) {
      if (user) {
        token.id = user.id
        token.email = user.email
        // Only set isNewUser if it was explicitly provided (from Google OAuth flow)
        if (user.isNewUser !== undefined) {
          token.isNewUser = user.isNewUser
        }
        token.iat = Math.floor(Date.now() / 1000)
        token.exp = Math.floor(Date.now() / 1000) + 30 * 60
      }
      return token
    },
    
    async session({ session, token }: any) {
      if (session?.user) {
        session.user.id = token.id as string;
        if (token.name) session.user.name = token.name as string;
        // Only set isNewUser if it was explicitly provided (from Google OAuth flow)
        if (token.isNewUser !== undefined) {
          session.user.isNewUser = token.isNewUser
        }
        
        // Sync brand activity with subscription status on each session
        await syncBrandActivityWithSubscription(session.user.id)
      }
      return session;
    },
    
    redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      if (url.includes("/onboarding") || url.includes("/signup")) {
        return url;
      }
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      else if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
}
const handler = NextAuth(nextAuthConfig)

export { handler as GET, handler as POST };
export const authOptions = nextAuthConfig;
