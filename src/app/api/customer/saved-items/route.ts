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

async function getAuthenticatedUserId() {
  const session = await auth.api.getSession({ headers: await headers() });
  return session?.user?.id ?? null;
}

export async function GET() {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json(
        { message: "Please sign in to view saved items." },
        { status: 401 },
      );
    }

    const client = await getMongoClient();
    const collection = client.db("frostfit").collection("customerSavedItems");

    const rawItems = await collection
      .find({ userId })
      .sort({ updatedAt: -1 })
      .toArray();

    const items = rawItems.map((item) => ({
      ...item,
      _id: String(item._id),
    }));

    return NextResponse.json({ items });
  } catch (error) {
    console.error("Failed to fetch saved items:", error);
    return NextResponse.json(
      { message: "Failed to load saved items." },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json(
        { message: "Please sign in to save items for order." },
        { status: 401 },
      );
    }

    const body = (await request.json().catch(() => null)) as Record<
      string,
      unknown
    > | null;

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        { message: "Invalid request payload." },
        { status: 400 },
      );
    }

    const productId =
      typeof body.productId === "string" ? body.productId.trim() : "";
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const brand = typeof body.brand === "string" ? body.brand.trim() : "";
    const sku = typeof body.sku === "string" ? body.sku.trim() : "";
    const thumbnail =
      typeof body.thumbnail === "string" ? body.thumbnail.trim() : "";
    const size = typeof body.size === "string" ? body.size.trim() : "";
    const color = typeof body.color === "string" ? body.color.trim() : "";
    const unitPrice = Number(body.unitPrice);
    const quantity = Number(body.quantity);

    if (!productId || !name) {
      return NextResponse.json(
        { message: "productId and name are required." },
        { status: 400 },
      );
    }

    if (!Number.isFinite(unitPrice) || unitPrice < 0) {
      return NextResponse.json(
        { message: "Valid unitPrice is required." },
        { status: 400 },
      );
    }

    if (!Number.isInteger(quantity) || quantity < 1) {
      return NextResponse.json(
        { message: "Quantity must be at least 1." },
        { status: 400 },
      );
    }

    const client = await getMongoClient();
    const collection = client.db("frostfit").collection("customerSavedItems");
    const now = new Date();

    const result = await collection.findOneAndUpdate(
      { userId, productId, size, color },
      {
        $set: {
          name,
          brand,
          sku,
          thumbnail,
          unitPrice,
          quantity,
          updatedAt: now,
        },
        $setOnInsert: {
          userId,
          productId,
          size,
          color,
          createdAt: now,
        },
      },
      { upsert: true, returnDocument: "after" },
    );

    if (!result) {
      return NextResponse.json(
        { message: "Could not save item." },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        message: "Item saved for order.",
        item: { ...result, _id: String(result._id) },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Failed to save item:", error);
    return NextResponse.json(
      { message: "Failed to save item." },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const userId = await getAuthenticatedUserId();
    if (!userId) {
      return NextResponse.json(
        { message: "Please sign in to remove saved items." },
        { status: 401 },
      );
    }

    const itemId = request.nextUrl.searchParams.get("itemId")?.trim() ?? "";
    if (!ObjectId.isValid(itemId)) {
      return NextResponse.json(
        { message: "A valid itemId is required." },
        { status: 400 },
      );
    }

    const client = await getMongoClient();
    const collection = client.db("frostfit").collection("customerSavedItems");

    const result = await collection.deleteOne({
      _id: new ObjectId(itemId),
      userId,
    });

    if (!result.deletedCount) {
      return NextResponse.json(
        { message: "Saved item not found." },
        { status: 404 },
      );
    }

    return NextResponse.json({ message: "Saved item removed." });
  } catch (error) {
    console.error("Failed to remove saved item:", error);
    return NextResponse.json(
      { message: "Failed to remove saved item." },
      { status: 500 },
    );
  }
}
