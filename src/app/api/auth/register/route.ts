// src/pages/api/auth/signup.ts
import { db as prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/hash";
import { NextResponse } from "next/server";
import { sendOTPEmail } from "@/lib/mailer";
import bcrypt from "bcrypt";
export async function POST(req: Request) {
  const data = await req.json();
  const { email, password, fullName, role, avatarUrl } = data;
  console.log(email);
  if (!email || !password || !fullName)
    return NextResponse.json({ error: "Missing fields" });

  if (role === "ADMIN") return NextResponse.json({ error: "Invalid role" });

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return NextResponse.json({ error: "Email already exists" });

  const passwordHash = await hashPassword(password);

  let user;
  try {
    user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName,
        role,
        avatarUrl,
        emailVerified: false,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Failed to create user" });
  }

  // 2. If role is OWNER, create FacilityOwner record
  if (role === "OWNER") {
    await prisma.facilityOwner.create({
      data: {
        userId: user.id,
        // optional: add default values for facility fields
        // facilityName: `${fullName}'s Facility`,
        // address: null,
        // phone: null,
      },
    });
  }

  // Generate OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const otpHash = await bcrypt.hash(otp, 10);
  const expiryAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes validity

  await prisma.emailOtp.create({
    data: {
      email,
      tokenHash: otpHash,
      expiresAt: expiryAt,
    },
  });

  console.log("---------------------");
  //send otp to user
  await sendOTPEmail(email, otp);

  return NextResponse.json(
    { message: "User created. OTP sent to email." },
    { status: 200 }
  );
}
