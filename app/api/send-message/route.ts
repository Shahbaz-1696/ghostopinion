import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { username, content } = await req.json();
    const user = await db.user.findFirst({
      where: {
        username: username,
      },
    });
    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    if (!user.isAcceptingMessage) {
      return NextResponse.json(
        {
          success: false,
          message: "User is not accepting the messages",
        },
        { status: 403 }
      );
    }

    const newMessage = await db.message.create({
      data: {
        content: content,
        createdAt: new Date(),
        userId: user.id,
      },
    });

    return NextResponse.json(
      {
        id: newMessage.id,
        success: true,
        message: "New message has been posted",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in sending the message", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error in sending the message",
      },
      { status: 500 }
    );
  }
}
