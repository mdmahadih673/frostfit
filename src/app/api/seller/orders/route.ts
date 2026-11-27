import { MongoClient, ObjectId } from "mongodb";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";
import { USER_ROLES } from "@/lib/user-roles";

const MONGODB_URL = process.env.MONGODB_URL;

declare global {
  var __frostfitSellerOrdersMongoClientPromise: Promise<MongoClient> | undefined;
}

function getMongoClient() {
  if (!MONGODB_URL) throw new Error("MONGODB_URL is not configured.");

  if (!globalThis.__frostfitSellerOrdersMongoClientPromise) {
    const client = new MongoClient(MONGODB_URL);
    globalThis.__frostfitSellerOrdersMongoClientPromise = client.connect();
  }

  return globalThis.__frostfitSellerOrdersMongoClientPromise;
}

export async function GET() {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      return NextResponse.json({ message: "Please sign in to view seller orders." }, { status: 401 });
    }

    if (session.user.role !== USER_ROLES.seller) {
      return NextResponse.json({ message: "Seller access is required." }, { status: 403 });
    }

    const client = await getMongoClient();
    const db = client.db("frostfit");
    const sellerProducts = await db
      .collection("sellerProducts")
      .find({ sellerId: session.user.id }, { projection: { _id: 1 } })
      .toArray();
    const productIds = sellerProducts.flatMap(({ _id }) => {
      const ids = [String(_id)];
      if (_id instanceof ObjectId) ids.push(_id.toHexString());
      return ids;
    });

    if (!productIds.length) return NextResponse.json({ orders: [] });

    const rawOrders = await db
      .collection("customerOrders")
      .find({ "items.productId": { $in: productIds } })
      .sort({ createdAt: -1 })
      .toArray();

    const orders = rawOrders.flatMap((order) => {
      const items = Array.isArray(order.items)
        ? order.items.filter((item) => productIds.includes(String(item.productId)))
        : [];

      if (!items.length) return [];

      return [{
        _id: String(order._id),
        customerName: String(order.customerName ?? order.shippingAddress?.fullName ?? "Customer"),
        customerEmail: String(order.customerEmail ?? ""),
        items,
        totalAmount: items.reduce(
          (total, item) => total + Number(item.unitPrice ?? 0) * Number(item.quantity ?? 1),
          0,
        ),
        status: String(order.status ?? "pending"),
        createdAt: order.createdAt,
        paymentMethod: String(order.paymentMethod ?? ""),
        shippingAddress: order.shippingAddress ?? null,
      }];
    });

    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Failed to fetch seller orders:", error);
    return NextResponse.json({ message: "Failed to load seller orders." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });

    if (!session) {
      return NextResponse.json({ message: "Please sign in to update orders." }, { status: 401 });
    }

    if (session.user.role !== USER_ROLES.seller) {
      return NextResponse.json({ message: "Seller access is required." }, { status: 403 });
    }

    const body: unknown = await request.json().catch(() => null);
    if (typeof body !== "object" || body === null || !("orderId" in body) || !("status" in body)) {
      return NextResponse.json({ message: "orderId and status are required." }, { status: 400 });
    }

    const { orderId, status } = body as { orderId: unknown; status: unknown };
    if (typeof orderId !== "string" || !ObjectId.isValid(orderId)) {
      return NextResponse.json({ message: "A valid orderId is required." }, { status: 400 });
    }

    if (status !== "confirmed" && status !== "rejected") {
      return NextResponse.json({ message: "Status must be confirmed or rejected." }, { status: 400 });
    }

    const client = await getMongoClient();
    const db = client.db("frostfit");
    const productIds = (await db.collection("sellerProducts")
      .find({ sellerId: session.user.id }, { projection: { _id: 1 } })
      .toArray())
      .flatMap(({ _id }) => _id instanceof ObjectId ? [String(_id), _id.toHexString()] : [String(_id)]);

    if (!productIds.length) {
      return NextResponse.json({ message: "No products found for this seller." }, { status: 404 });
    }

    const orders = db.collection("customerOrders");
    const filter = {
      _id: new ObjectId(orderId),
      status: { $in: ["pending", "new"] },
      "items.productId": { $in: productIds },
    };
    const result = await orders.updateOne(filter, { $set: { status, updatedAt: new Date() } });

    if (!result.matchedCount) {
      const exists = await orders.findOne({ _id: new ObjectId(orderId), "items.productId": { $in: productIds } }, { projection: { _id: 1 } });
      return NextResponse.json(
        { message: exists ? "This order has already been processed." : "Order not found for your products." },
        { status: exists ? 409 : 404 },
      );
    }

    return NextResponse.json({ message: "Order status updated.", status });
  } catch (error) {
    console.error("Failed to update seller order:", error);
    return NextResponse.json({ message: "Failed to update order status." }, { status: 500 });
  }
}
