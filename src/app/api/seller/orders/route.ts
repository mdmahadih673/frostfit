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
