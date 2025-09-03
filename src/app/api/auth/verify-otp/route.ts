import { db as prisma } from "@/lib/prisma";
import bcrypt from "bcrypt";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { email, otp } = await req.json();

  if (!email || !otp) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  const otpRecord = await prisma.emailOtp.findFirst({
    where: { email },
    orderBy: { createdAt: "desc" }, // latest OTP
  });

  if (!otpRecord) {
    return NextResponse.json({ error: "OTP not found" }, { status: 400 });
  }

  if (otpRecord.expiresAt < new Date()) {
    return NextResponse.json({ error: "OTP expired" }, { status: 400 });
  }

  const isValid = await bcrypt.compare(otp, otpRecord.tokenHash);
  if (!isValid) {
    return NextResponse.json({ error: "Invalid OTP" }, { status: 400 });
  }

  // Mark user as verified
  await prisma.user.update({
    where: { email },
    data: { emailVerified: true },
  });

  return NextResponse.json({ message: "Email verified successfully" });
}
