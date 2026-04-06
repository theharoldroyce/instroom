import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { prisma } from "./prisma"
import { sendWelcomeEmail } from "./email"
import bcrypt from "bcryptjs"
import { checkLoginRateLimit, resetLoginRateLimit, getClientIp } from "./rate-limit"

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
          console.error("Auth error:", error)
          return null
        }
      },
    }),
  ],
  pages: { signIn: "/login" },
  callbacks: {
    async signIn({ user, account, profile }: any) {
      // For Google OAuth, create user record if it doesn't exist
      if (account?.provider === "google" && profile?.email) {
        // Extract avatar from profile
        const avatarUrl = profile.image || profile.picture || null
        
        try {
          // Find or create user
          let dbUser = await prisma.user.findUnique({
            where: { email: profile.email },
          })
          
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
            
            // Send welcome email to new user
            try {
              await sendWelcomeEmail(dbUser.email, dbUser.name || "User")
            } catch (emailError) {
              console.error("Failed to send welcome email:", emailError instanceof Error ? emailError.message : String(emailError))
              // Continue anyway, don't fail the signin
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
            // Set user ID to database ID
            user.id = dbUser.id
            user.email = dbUser.email
            user.name = dbUser.name
            user.image = dbUser.image
            
            // Ensure onboarding record exists
            const onboarding = await prisma.onboarding.findUnique({
              where: { user_id: dbUser.id },
            })
            
            if (!onboarding) {
              await prisma.onboarding.create({
                data: { user_id: dbUser.id },
              })
            }
            
            // Create/update account record for provider tracking
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
              console.error("Account record error:", accountError instanceof Error ? accountError.message : String(accountError))
            }
          }
        } catch (error) {
          console.error("Google OAuth error:", error instanceof Error ? error.message : String(error))
          return false
        }
      }
      return true
    },
    
    // JWT callback: store user ID and email, and set 30-minute expiration
    jwt({ token, user }: any) {
      if (user) {
        token.id = user.id
        token.email = user.email
        // Set token expiration to 30 minutes from now
        token.iat = Math.floor(Date.now() / 1000)
        token.exp = Math.floor(Date.now() / 1000) + 30 * 60
      }
      return token
    },
    
    async session({ session, token }: any) {
      if (session?.user) {
        session.user.id = token.id as string;
        if (token.name) session.user.name = token.name as string;
      }
      return session;
    },
  },
}
const handler = NextAuth(nextAuthConfig)

export { handler as GET, handler as POST };
export const authOptions = nextAuthConfig;
