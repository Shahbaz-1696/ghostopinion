import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";
import { sendVerificationEmail } from "@/helpers/sendVerificationEmail";
import bcrypt from "bcrypt";
import { signupSchema } from "@/schemas/signupSchema";

export async function POST(req: NextRequest) {
  try {
    const { email, username, password } = await req.json();
    const { success } = await signupSchema.safeParse({
      email,
      username,
      password,
    });
    if (!success) {
      return NextResponse.json(
        {
          message: "Inputs are incorrect",
        },
        {
          status: 411,
        }
      );
    }
    const existingUserVerifiedByUsername = await db.user.findFirst({
      where: {
        username,
        isVerified: true,
      },
    });

    if (existingUserVerifiedByUsername) {
      return NextResponse.json(
        {
          success: false,
          message: "Username is already taken",
        },
        {
          status: 400,
        }
      );
    }

    const existingUserByEmail = await db.user.findFirst({
      where: {
        email,
      },
    });

    const verifyCode = Math.floor(100000 + Math.random() * 900000).toString();

    if (existingUserByEmail) {
      if (existingUserByEmail.isVerified) {
        return NextResponse.json(
          {
            success: false,
            message: "User alreay exists with this email",
          },
          {
            status: 400,
          }
        );
      } else {
        const hashedPassword = await bcrypt.hash(password, 10);
        const updatedUser = await db.user.update({
          where: {
            email,
          },
          data: {
            password: hashedPassword,
            verifyCode,
            verfiyCodeExpiry: new Date(Date.now() + 3600000),
          },
        });

        return NextResponse.json({
          id: updatedUser.id,
        });
      }
    } else {
      const hashedPassword = await bcrypt.hash(password, 10);
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 1);

      const newUser = await db.user.create({
        data: {
          username,
          email,
          password: hashedPassword,
          isVerified: false,
          isAcceptingMessage: true,
          verfiyCodeExpiry: expiryDate,
          verifyCode,
        },
      });
      return NextResponse.json(
        {
          id: newUser.id,
          success: true,
          message: "User registered successfully. Please verify your email",
        },
        {
          status: 201,
        }
      );
    }

    // send verification email
    const emailResponse = await sendVerificationEmail(
      email,
      username,
      verifyCode
    );

    if (!emailResponse.success) {
      return NextResponse.json(
        {
          success: false,
          message: emailResponse.message,
        },
        {
          status: 500,
        }
      );
    }
  } catch (error) {
    console.error("Error registrating user", error);
    return NextResponse.json(
      {
        status: false,
        message: "Error registrating user",
      },
      {
        status: 500,
      }
    );
  }
}
