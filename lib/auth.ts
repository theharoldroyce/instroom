import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import GoogleProvider from "next-auth/providers/google"
import { prisma } from "./prisma"
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
      authorization: {
        params: {
          access_type: "offline",
          prompt: "consent",
        },
      },
      profile(profile: any) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture || null,
        }
      },
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("No credentials provided");
          return null;
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });
          if (!user?.password_hash) {
            return null;
          }
          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password_hash
          );
          if (!isPasswordValid) {
            return null;
          }
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          };
        } catch (error) {
          console.error("Auth error:", error);
          return null;
        }
      },
    }),
  ],
  pages: { signIn: "/login" },
  callbacks: {
    async signIn({ user, account, profile }: any) {
      // For Google OAuth, create user record if it doesn't exist
      if (account?.provider === "google" && profile?.email) {
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
            // Override user.id with database ID (not Google sub ID)
            user.id = dbUser.id
            user.email = dbUser.email
            user.name = dbUser.name
            user.image = dbUser.image

            // Create onboarding record if it doesn't exist
            const onboarding = await prisma.onboarding.findUnique({
              where: { user_id: dbUser.id },
            })

            if (!onboarding) {
              await prisma.onboarding.create({
                data: { user_id: dbUser.id },
              })
            }

            // Create subscription if it doesn't exist
            const subscription = await prisma.userSubscription.findUnique({
              where: { user_id: dbUser.id },
            })

            if (!subscription) {
              const trialPlan = await prisma.subscriptionPlan.findFirst({
                where: { name: "solo" },
              })

              if (trialPlan) {
                const trialEndDate = new Date()
                trialEndDate.setDate(trialEndDate.getDate() + 14)

                await prisma.userSubscription.create({
                  data: {
                    user_id: dbUser.id,
                    plan_id: trialPlan.id,
                    status: "trialing",
                    current_period_end: trialEndDate,
                  },
                })
              }
            }

            // Create Account record for provider tracking
            if (account.providerAccountId) {
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
                console.error("Error creating Account record:", accountError)
              }
            }
          }
        } catch (error) {
          console.error("Google OAuth signIn error:", error)
          return false
        }
      }
      return true
    },
    
    jwt({ token, user }: any) {
      if (user) {
        token.id = user.id
        token.email = user.email
      }
      return token
    },

    async session({ session, token }: any) {
      if (session?.user) {
        session.user.id = token.id as string
      }
      return session
    },
  },
}
const handler = NextAuth(nextAuthConfig)

export { handler as GET, handler as POST }
