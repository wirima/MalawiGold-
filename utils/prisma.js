import { PrismaClient } from '@prisma/client'
import { withAccelerate } from '@prisma/extension-accelerate'

// This creates a "singleton" of the PrismaClient.
// It checks if an instance already exists in the "global" scope.
// If not, it creates a new one. This is crucial for Next.js/Vercel
// in a development environment to prevent creating too many clients.

const prismaClientSingleton = () => {
  return new PrismaClient().$extends(withAccelerate())
}

const globalForPrisma = globalThis 

const prisma = globalForPrisma.prisma ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma