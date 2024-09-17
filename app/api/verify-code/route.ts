import db from "@/lib/db";
import { z } from "zod";
import { verifySchema } from "@/schemas/verifySchema";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { username, code } = await req.json();
    const decodedUsername = decodeURIComponent(username);
    const user = await db.user.findFirst({
      where: {
        username: decodedUsername,
      },
    });

    if (!user) {
      return NextResponse.json(
        {
          status: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    const isCodeValid = user.verifyCode === code;
    const isCodeNotExpired = new Date(user.verfiyCodeExpiry) > new Date();

    if (isCodeValid && isCodeNotExpired) {
      user.isVerified = true;
      return NextResponse.json(
        {
          status: true,
          message: "Account verified successfully",
        },
        { status: 200 }
      );
    } else if (!isCodeNotExpired) {
      return NextResponse.json(
        {
          status: false,
          message:
            "Verification code has expired. Please signup again to get a new code",
        },
        { status: 400 }
      );
    } else {
      return NextResponse.json(
        {
          status: false,
          message: "Incorrect verification code",
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Error in verifying user", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error in verifying user",
      },
      { status: 500 }
    );
  }
}
