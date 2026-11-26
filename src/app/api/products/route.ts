import { MongoClient } from "mongodb";
import { NextResponse, type NextRequest } from "next/server";

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

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function nonEmptyStrings(values: unknown[]) {
  return values
    .filter((value): value is string => typeof value === "string" && Boolean(value.trim()))
    .map((value) => value.trim());
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const q = searchParams.get("q")?.trim() ?? "";
    const season = searchParams.get("season")?.trim() ?? "";
    const gender = searchParams.get("gender")?.trim() ?? "";
    const size = searchParams.get("size")?.trim() ?? "";
    const inStock = searchParams.get("inStock") === "true";
    const sort = searchParams.get("sort")?.trim() ?? "newest";

    const client = await getMongoClient();
    const collection = client.db("frostfit").collection("sellerProducts");

    const baseFilter: Record<string, unknown> = {};
    if (season && season.toLowerCase() !== "all") {
      baseFilter["details.season"] = {
        $regex: new RegExp(`^${escapeRegex(season)}$`, "i"),
      };
    }

    const queryFilter: Record<string, unknown> = { ...baseFilter };

    if (q) {
      const pattern = new RegExp(escapeRegex(q), "i");
      queryFilter.$or = [
        { name: pattern },
        { brand: pattern },
        { sku: pattern },
        { description: pattern },
        { "details.material": pattern },
      ];
    }

    if (gender && gender.toLowerCase() !== "all") {
      queryFilter["details.gender"] = {
        $regex: new RegExp(`^${escapeRegex(gender)}$`, "i"),
      };
    }

    if (size && size.toLowerCase() !== "all") {
      queryFilter.variants = {
        $elemMatch: {
          size: { $regex: new RegExp(`^${escapeRegex(size)}$`, "i") },
          ...(inStock ? { stock: { $gt: 0 } } : {}),
        },
      };
    } else if (inStock) {
      queryFilter["variants.stock"] = { $gt: 0 };
    }

    const sortStage: Record<string, 1 | -1> =
      sort === "price-asc"
        ? { _effectivePrice: 1, createdAt: -1 }
        : sort === "price-desc"
          ? { _effectivePrice: -1, createdAt: -1 }
          : { createdAt: -1 };

    const [rawProducts, totalCount, rawSeasons, rawGenders, rawSizes] =
      await Promise.all([
        collection
          .aggregate([
            { $match: queryFilter },
            {
              $addFields: {
                _effectivePrice: {
                  $cond: [
                    {
                      $and: [
                        { $gt: ["$pricing.discountPrice", 0] },
                        { $lt: ["$pricing.discountPrice", "$pricing.price"] },
                      ],
                    },
                    "$pricing.discountPrice",
                    { $ifNull: ["$pricing.price", 0] },
                  ],
                },
              },
            },
            { $sort: sortStage },
            { $project: { _effectivePrice: 0 } },
          ])
          .toArray(),
        collection.countDocuments(baseFilter),
        collection.distinct("details.season", baseFilter),
        collection.distinct("details.gender", baseFilter),
        collection.distinct("variants.size", baseFilter),
      ]);

    const products = rawProducts.map((product) => ({
      ...product,
      _id: String(product._id),
    }));

    return NextResponse.json({
      products,
      totalCount,
      facets: {
        seasons: Array.from(new Set(nonEmptyStrings(rawSeasons))).sort((a, b) =>
          a.localeCompare(b),
        ),
        genders: Array.from(new Set(nonEmptyStrings(rawGenders))).sort((a, b) =>
          a.localeCompare(b),
        ),
        sizes: Array.from(new Set(nonEmptyStrings(rawSizes))),
      },
    });
  } catch (error) {
    console.error("Failed to query products:", error);
    return NextResponse.json(
      { message: "Failed to load products from API." },
      { status: 500 },
    );
  }
}
