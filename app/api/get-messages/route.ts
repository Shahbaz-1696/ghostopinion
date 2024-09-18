import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/options";
import db from "@/lib/db";
import { User } from "next-auth";

export async function GET() {
  const session = await getServerSession(authOptions);
  const user: User = session?.user;

  if (!session || !user) {
    return NextResponse.json(
      {
        success: false,
        message: "Not Authenticated",
      },
      { status: 401 }
    );
  }

  const userId = user.id;
  try {
    const messages = await db.message.findMany({
      where: {
        userId: userId,
      },
    });
    if (!messages || messages.length === 0) {
      return NextResponse.json(
        {
          success: false,
          message: "No messages found for the user",
        },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      messages: messages.map((message) => message.createdAt),
    });
  } catch (error) {
    console.error("No messages found for the user", error);
    return NextResponse.json(
      {
        success: false,
        message: "No messages found for the user",
      },
      { status: 404 }
    );
  }
}
