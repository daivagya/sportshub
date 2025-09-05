import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/authOptions";
import { db as prisma } from "@/lib/prisma";

export async function getCurrentUser() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return null;
  }
  
  // Optionally, you can fetch the complete user object from your database
  // if you need more details than what's stored in the session.
  const user = await prisma.user.findUnique({
    where: {
      id: Number(session.user.id),
    },
  });

  return user;
}