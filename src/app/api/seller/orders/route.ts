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
        trackingUrl: typeof order.trackingUrl === "string" ? order.trackingUrl : "",
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
    if (typeof body !== "object" || body === null || !("orderId" in body)) {
      return NextResponse.json({ message: "orderId is required." }, { status: 400 });
    }

    const { orderId, status, trackingUrl } = body as { orderId: unknown; status?: unknown; trackingUrl?: unknown };
    if (typeof orderId !== "string" || !ObjectId.isValid(orderId)) {
      return NextResponse.json({ message: "A valid orderId is required." }, { status: 400 });
    }

    if (status !== undefined && status !== "confirmed" && status !== "rejected") {
      return NextResponse.json({ message: "Status must be confirmed or rejected." }, { status: 400 });
    }

    if (status === undefined && trackingUrl === undefined) {
      return NextResponse.json({ message: "Provide a status or tracking link to update." }, { status: 400 });
    }

    let normalizedTrackingUrl: string | null | undefined;
    if (trackingUrl !== undefined) {
      if (typeof trackingUrl !== "string") {
        return NextResponse.json({ message: "Tracking link must be a URL." }, { status: 400 });
      }
      const value = trackingUrl.trim();
      if (value) {
        try {
          const parsedUrl = new URL(value);
          if (!["http:", "https:"].includes(parsedUrl.protocol)) throw new Error("Unsupported protocol");
          normalizedTrackingUrl = parsedUrl.toString();
        } catch {
          return NextResponse.json({ message: "Enter a valid tracking URL starting with http:// or https://." }, { status: 400 });
        }
      } else {
        normalizedTrackingUrl = null;
      }
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
      status: status === undefined ? { $ne: "rejected" } : { $in: ["pending", "new"] },
      "items.productId": { $in: productIds },
    };
    const setFields: Record<string, unknown> = { updatedAt: new Date() };
    if (status !== undefined) setFields.status = status;
    if (typeof normalizedTrackingUrl === "string") setFields.trackingUrl = normalizedTrackingUrl;
    const update: { $set: Record<string, unknown>; $unset?: Record<string, ""> } = { $set: setFields };
    if (normalizedTrackingUrl === null) update.$unset = { trackingUrl: "" };
    const result = await orders.updateOne(filter, update);

    if (!result.matchedCount) {
      const exists = await orders.findOne({ _id: new ObjectId(orderId), "items.productId": { $in: productIds } }, { projection: { _id: 1 } });
      return NextResponse.json(
        { message: exists ? "This order has already been processed." : "Order not found for your products." },
        { status: exists ? 409 : 404 },
      );
    }

    return NextResponse.json({ message: status === undefined ? "Tracking link saved." : "Order updated.", status, trackingUrl: normalizedTrackingUrl ?? null });
  } catch (error) {
    console.error("Failed to update seller order:", error);
    return NextResponse.json({ message: "Failed to update order status." }, { status: 500 });
  }
}
