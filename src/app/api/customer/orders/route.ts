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

export async function GET() {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { message: "Please sign in to view your orders." },
        { status: 401 },
      );
    }

    const client = await getMongoClient();
    const collection = client.db("frostfit").collection("customerOrders");

    const rawOrders = await collection
      .find({ $or: [{ customerId: user.id }, { userId: user.id }] })
      .sort({ createdAt: -1 })
      .toArray();

    const orders = rawOrders.map((order) => ({
      ...order,
      _id: String(order._id),
      customerId: String(order.customerId ?? order.userId ?? ""),
    }));

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Failed to fetch orders:", error);
    return NextResponse.json(
      { message: "Failed to load orders." },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    if (!user) {
      return NextResponse.json(
        { message: "Please sign in to place an order." },
        { status: 401 },
      );
    }

    const body = (await request.json().catch(() => null)) as {
      savedItemIds?: unknown;
      shippingAddress?: Record<string, unknown>;
      paymentMethod?: unknown;
    } | null;

    const rawIds = Array.isArray(body?.savedItemIds) ? body.savedItemIds : [];
    const savedItemIds = rawIds.filter(
      (id): id is string => typeof id === "string",
    );

    if (
      !savedItemIds.length ||
      savedItemIds.length !== rawIds.length ||
      savedItemIds.some((id) => !ObjectId.isValid(id)) ||
      new Set(savedItemIds).size !== savedItemIds.length
    ) {
      return NextResponse.json(
        { message: "Select at least one saved item to order." },
        { status: 400 },
      );
    }

    const validObjectIds = savedItemIds.map((id) => new ObjectId(id));
    const rawAddress = body?.shippingAddress;
    const fullName =
      typeof rawAddress?.fullName === "string" ? rawAddress.fullName.trim() : "";
    const phone =
      typeof rawAddress?.phone === "string" ? rawAddress.phone.trim() : "";
    const address =
      typeof rawAddress?.address === "string" ? rawAddress.address.trim() : "";
    const city =
      typeof rawAddress?.city === "string" ? rawAddress.city.trim() : "";
    const postalCode =
      typeof rawAddress?.postalCode === "string"
        ? rawAddress.postalCode.trim()
        : "";
    const note =
      typeof rawAddress?.note === "string" ? rawAddress.note.trim() : "";

    if (!fullName || !phone || !address || !city) {
      return NextResponse.json(
        {
          message:
            "Full name, phone number, street address, and city are required.",
        },
        { status: 400 },
      );
    }

    const allowedPayments = new Set(["cod", "bkash", "nagad", "card"]);
    const paymentMethod =
      typeof body?.paymentMethod === "string" &&
      allowedPayments.has(body.paymentMethod.trim())
        ? body.paymentMethod.trim()
        : "";

    if (!paymentMethod) {
      return NextResponse.json(
        { message: "Please select a valid payment method." },
        { status: 400 },
      );
    }

    const client = await getMongoClient();
    const db = client.db("frostfit");
    const savedCollection = db.collection("customerSavedItems");
    const ordersCollection = db.collection("customerOrders");

    const selectedItems = await savedCollection
      .find({
        _id: { $in: validObjectIds },
        userId: user.id,
      })
      .toArray();

    if (selectedItems.length !== validObjectIds.length) {
      return NextResponse.json(
        { message: "No matching saved items found for your account." },
        { status: 404 },
      );
    }

    const orderItems = selectedItems.map((item) => ({
      productId: String(item.productId ?? ""),
      name: String(item.name ?? ""),
      brand: String(item.brand ?? ""),
      sku: String(item.sku ?? ""),
      thumbnail: String(item.thumbnail ?? ""),
      unitPrice: Number(item.unitPrice ?? 0),
      size: String(item.size ?? ""),
      color: String(item.color ?? ""),
      quantity: Number(item.quantity ?? 1),
    }));
    if (
      orderItems.some(
        (item) =>
          !Number.isFinite(item.unitPrice) ||
          item.unitPrice < 0 ||
          !Number.isInteger(item.quantity) ||
          item.quantity < 1,
      )
    ) {
      return NextResponse.json(
        { message: "One or more selected items have invalid order details." },
        { status: 400 },
      );
    }

    const totalAmount = orderItems.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0,
    );

    const now = new Date();
    const newOrder = {
      customerId: user.id,
      customerName: user.name,
      customerEmail: user.email,
      items: orderItems,
      shippingAddress: {
        fullName,
        phone,
        address,
        city,
        postalCode,
        note,
      },
      paymentMethod,
      totalAmount,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    };

    const insertResult = await ordersCollection.insertOne(newOrder);

    await savedCollection.deleteMany({
      _id: { $in: selectedItems.map((item) => item._id) },
      userId: user.id,
    });

    return NextResponse.json(
      {
        message: "Order placed successfully.",
        order: { ...newOrder, _id: String(insertResult.insertedId) },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Failed to place order:", error);
    return NextResponse.json(
      { message: "Failed to place order." },
      { status: 500 },
    );
  }
}
