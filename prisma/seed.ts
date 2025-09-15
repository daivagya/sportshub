import { PrismaClient } from "@/generated/prisma";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  const email = "SportshubAdmin@example.com";
  const password = "Admin@123";
  const hashedPassword = await bcrypt.hash(password, 10);

  const existingAdmin = await prisma.user.findUnique({ where: { email } });
  if (existingAdmin) {
    console.log("Admin already exists");
    return;
  }

  const admin = await prisma.user.create({
    data: {
      email,
      fullName: "Super Admin",
      passwordHash: hashedPassword,
      role: "ADMIN",
      emailVerified: true,
      updatedAt: new Date(),
    },
  });

  console.log("Admin created:", admin);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
