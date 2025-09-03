// // src/lib/prisma.ts
// import { PrismaClient } from '@prisma/client';

// declare global {
//   // avoid multiple instances in dev
//   // eslint-disable-next-line no-var
//   var prisma: PrismaClient | undefined;
// }

// export const prisma =
//   global.prisma ??
//   new PrismaClient({
//     log: ['query', 'info', 'warn', 'error'],
//   });

// if (process.env.NODE_ENV !== 'production') global.prisma = prisma;


import { PrismaClient } from "@/generated/prisma"
import "server-only"
declare global {
 
  var cachedPrisma: PrismaClient
}
 
let prisma: PrismaClient
if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient()
} else {
  if (!global.cachedPrisma) {
    global.cachedPrisma = new PrismaClient()
  }
  prisma = global.cachedPrisma
}
 
export const db = prisma