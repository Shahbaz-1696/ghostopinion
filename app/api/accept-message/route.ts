import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/options";
import db from "@/lib/db";
import { User } from "next-auth";

export async function POST(req: NextRequest) {
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
  const { acceptMessages } = await req.json();

  try {
    const updatedUser = await db.user.update({
      where: {
        id: userId,
      },
      data: {
        isAcceptingMessage: acceptMessages,
      },
    });

    if (!updatedUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to update user status to accept messages",
        },
        { status: 401 }
      );
    } else {
      return NextResponse.json(
        {
          success: true,
          message: "Message acceptance status updated successfully",
          updatedUser,
        },
        { status: 200 }
      );
    }
  } catch (error) {
    console.error("Failed to update user status to accept messages", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update user status to accept messages",
      },
      { status: 500 }
    );
  }
}

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
    const foundUser = await db.user.findFirst({
      where: {
        id: userId,
      },
    });

    if (!foundUser) {
      return NextResponse.json(
        {
          success: false,
          message: "User not found",
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        isAcceptingMessage: foundUser.isAcceptingMessage,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in getting message acceptance status", error);
    return NextResponse.json(
      {
        success: false,
        message: "Error in getting message acceptance status",
      },
      { status: 500 }
    );
  }
}
