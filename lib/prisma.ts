// import { PrismaClient } from '@prisma/client'

// const globalForPrisma = global as unknown as { prisma: PrismaClient }

// export const prisma =
//   globalForPrisma.prisma ||
//   new PrismaClient({
//     log: ['query'],
//   })

// if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

// ─── Graceful Shutdown Handlers ──────────────────────────────────────────────
// Ensures Prisma Client disconnects properly when the Node process exits,
// preventing orphaned connections that could exhaust the connection pool.

async function disconnectPrisma() {
  try {
    await prisma.$disconnect()
    console.log('Prisma Client disconnected gracefully')
  } catch (error) {
    console.error('Error disconnecting Prisma Client:', error)
  }
}

// Handle normal process exit
process.on('beforeExit', disconnectPrisma)

// Handle uncaught exceptions
process.on('uncaughtException', async (error) => {
  console.error('Uncaught Exception:', error)
  await disconnectPrisma()
  process.exit(1)
})

// Handle unhandled promise rejections
process.on('unhandledRejection', async (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason)
  await disconnectPrisma()
  process.exit(1)
})
