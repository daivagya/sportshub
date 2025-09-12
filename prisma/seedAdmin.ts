import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

// Directly create PrismaClient instance
const prisma = new PrismaClient();

async function main() {
  const email = "admin@example.com";
  const password = "Admin@123";
  const hashedPassword = await bcrypt.hash(password, 10);

  const existingAdmin = await prisma.user.findUnique({ where: { email } });

  if (existingAdmin) {
    console.log("Admin already exists");
    return;
  }

  const admin = await prisma.user.create({
    data: {
      fullName: "Super Admin",
      email,
      passwordHash: hashedPassword,
      role: "ADMIN",
      emailVerified: true,
    },
  });

  console.log("✅ Admin created:", admin);
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
