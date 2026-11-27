import { MongoClient, ObjectId } from "mongodb";
import { headers } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";

import { auth } from "@/lib/auth";

const MONGODB_URL = process.env.MONGODB_URL;

declare global {
  var __frostfitMongoClientPromise: Promise<MongoClient> | undefined;
}

function getMongoClient() {
  if (!MONGODB_URL) {
    throw new Error("MONGODB_URL is not configured.");
  }

  if (!globalThis.__frostfitMongoClientPromise) {
    const client = new MongoClient(MONGODB_URL);
    globalThis.__frostfitMongoClientPromise = client.connect();
  }

  return globalThis.__frostfitMongoClientPromise;
}

async function getAuthenticatedUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user ?? null;
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ orderId: string }> },
) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { message: "Please sign in to cancel your orders." },
        { status: 401 },
      );
    }

    const { orderId } = await params;
    if (!ObjectId.isValid(orderId)) {
      return NextResponse.json(
        { message: "A valid orderId is required." },
        { status: 400 },
      );
    }

    const client = await getMongoClient();
    const collection = client.db("frostfit").collection("customerOrders");
    const orderIdObject = new ObjectId(orderId);
    const ownershipFilter = {
      $or: [{ customerId: user.id }, { userId: user.id }],
    };
    const order = await collection.findOne({
      _id: orderIdObject,
      ...ownershipFilter,
    });

    if (!order) {
      return NextResponse.json(
        { message: "Order not found." },
        { status: 404 },
      );
    }

    const cancellableStatuses = ["pending", "processing"];
    if (!cancellableStatuses.includes(order.status)) {
      return NextResponse.json(
        {
          message: `Orders with status "${order.status}" cannot be cancelled.`,
        },
        { status: 400 },
      );
    }

    const result = await collection.deleteOne({
      _id: orderIdObject,
      ...ownershipFilter,
      status: { $in: cancellableStatuses },
    });

    if (!result.deletedCount) {
      return NextResponse.json(
        { message: "Order status changed; refresh and try again." },
        { status: 409 },
      );
    }

    return NextResponse.json({ message: "Order cancelled successfully." });
  } catch (error) {
    console.error("Failed to cancel order:", error);
    return NextResponse.json(
      { message: "Failed to cancel order." },
      { status: 500 },
    );
  }
}
