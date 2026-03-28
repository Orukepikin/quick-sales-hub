import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";
import { sendMessageSchema } from "@/lib/validations";

// GET /api/chat — Get user's conversations
export async function GET(req: NextRequest) {
  try {
    const payload = getUserFromRequest(req);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: { userId: payload.userId },
        },
      },
      include: {
        listing: {
          select: { id: true, title: true, price: true, images: true },
        },
        participants: {
          include: {
            user: {
              select: { id: true, name: true, avatar: true, isVerified: true },
            },
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            content: true,
            createdAt: true,
            senderId: true,
            isRead: true,
          },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    // Count unread messages per conversation
    const conversationsWithUnread = await Promise.all(
      conversations.map(async (convo) => {
        const unreadCount = await prisma.message.count({
          where: {
            conversationId: convo.id,
            receiverId: payload.userId,
            isRead: false,
          },
        });
        return { ...convo, unreadCount };
      })
    );

    return NextResponse.json({ conversations: conversationsWithUnread });
  } catch (error) {
    console.error("Get conversations error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/chat — Send a message (creates conversation if needed)
export async function POST(req: NextRequest) {
  try {
    const payload = getUserFromRequest(req);
    if (!payload) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validated = sendMessageSchema.parse(body);

    let conversationId = validated.conversationId;

    // Create conversation if it doesn't exist
    if (!conversationId) {
      // Check for existing conversation between these users about this listing
      const existing = await prisma.conversation.findFirst({
        where: {
          listingId: validated.listingId,
          AND: [
            { participants: { some: { userId: payload.userId } } },
            { participants: { some: { userId: validated.receiverId } } },
          ],
        },
      });

      if (existing) {
        conversationId = existing.id;
      } else {
        const newConvo = await prisma.conversation.create({
          data: {
            listingId: validated.listingId,
            participants: {
              create: [
                { userId: payload.userId },
                { userId: validated.receiverId },
              ],
            },
          },
        });
        conversationId = newConvo.id;
      }
    }

    // Create the message
    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId: payload.userId,
        receiverId: validated.receiverId,
        content: validated.content,
      },
      include: {
        sender: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    // Update conversation timestamp
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    });

    // Create notification for receiver
    await prisma.notification.create({
      data: {
        userId: validated.receiverId,
        title: "New Message",
        body: `${message.sender.name}: ${validated.content.slice(0, 50)}`,
        type: "message",
        data: { conversationId, messageId: message.id },
      },
    });

    return NextResponse.json({ message, conversationId }, { status: 201 });
  } catch (error: any) {
    if (error.name === "ZodError") {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error("Send message error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
