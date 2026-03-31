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
        console.log("=== GoogleProvider profile callback ===")
        console.log("Raw Google profile:", profile)
        console.log("picture field:", profile.picture)
        
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
        console.log("=== Google OAuth signIn START ===")
        console.log("Profile object keys:", Object.keys(profile))
        console.log("Full Profile object:", JSON.stringify(profile))
        
        // Ensure image is extracted - try both 'image' (from profile callback) and 'picture' (raw Google)
        const avatarUrl = profile.image || profile.picture || null
        console.log("Avatar URL to be saved:", avatarUrl)
        console.log("Profile:", { 
          email: profile.email, 
          name: profile.name,
          image: profile.image,
          picture: profile.picture,
          avatarUrl: avatarUrl
        })
        console.log("Account:", { provider: account.provider, providerAccountId: account.providerAccountId })
        
        try {
          // Find or create user
          console.log("Looking up user by email:", profile.email)
          let dbUser = await prisma.user.findUnique({
            where: { email: profile.email },
          })
          console.log("User lookup result:", dbUser ? "Found existing user" : "No user found, creating new")
          
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
            console.log("User created successfully:", dbUser.id, "Image saved:", dbUser.image)
          } else {
            dbUser = await prisma.user.update({
              where: { email: profile.email },
              data: {
                name: profile.name || dbUser.name,
                image: avatarUrl || dbUser.image, // Update avatar if available
              },
            })
            console.log("User updated. Image:", dbUser.image)
          }
          
          if (dbUser) {
            // Override user.id with database ID (not Google sub ID)
            user.id = dbUser.id
            user.email = dbUser.email
            user.name = dbUser.name
            user.image = dbUser.image
            console.log("User object updated with database ID:", dbUser.id)
            
            // Create onboarding record if it doesn't exist
            console.log("Checking for existing onboarding...")
            const onboarding = await prisma.onboarding.findUnique({
              where: { user_id: dbUser.id },
            })
            
            if (!onboarding) {
              console.log("Creating onboarding record...")
              await prisma.onboarding.create({
                data: { user_id: dbUser.id },
              })
              console.log("Onboarding created")
            } else {
              console.log("Onboarding already exists")
            }
            
            // Create subscription if it doesn't exist
            console.log("Checking for existing subscription...")
            const subscription = await prisma.userSubscription.findUnique({
              where: { user_id: dbUser.id },
            })
            
            if (!subscription) {
              console.log("Creating subscription...")
              const trialPlan = await prisma.subscriptionPlan.findFirst({
                where: { name: "Solo" },
              })
              
              if (trialPlan) {
                console.log("Found Solo plan:", trialPlan.id)
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
                console.log("Subscription created")
              } else {
                console.error("Solo plan not found!")
              }
            } else {
              console.log("Subscription already exists")
            }
            
            // Create Account record for provider tracking
            console.log("Creating/updating Account record...")
            console.log("Full account object:", JSON.stringify(account, null, 2))
            console.log("Account tokens:", {
              access_token: account.access_token ? "Present" : "NULL",
              refresh_token: account.refresh_token ? "Present" : "NULL",
              expires_at: account.expires_at,
              token_type: account.token_type,
              scope: account.scope,
              id_token: account.id_token ? "Present" : "NULL"
            })
            try {
              if (!account.providerAccountId) {
                console.error("Missing providerAccountId in account object")
                console.log("Account object:", account)
              } else {
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
                console.log("Account record created/updated")
              }
            } catch (accountError) {
              console.error("Error creating Account record:", accountError)
              // Continue anyway, don't fail the signin
            }
          }
        } catch (error) {
          console.error("=== Google OAuth signIn FAILED ===")
          console.error("Error in signIn callback:", error)
          console.error("Error details:", error instanceof Error ? error.message : String(error))
          return false
        }
      }
      return true
    },
    
    // JWT callback: store user ID and email
    jwt({ token, user }: any) {
      if (user) {
        token.id = user.id
        token.email = user.email
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
