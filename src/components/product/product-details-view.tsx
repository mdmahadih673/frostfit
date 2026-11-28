"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  Minus,
  PackageOpen,
  Plus,
  RefreshCw,
  ShieldCheck,
  ShoppingBag,
  Truck,
} from "lucide-react";

import {
  getProductByIdOrSlug,
  type SellerProduct,
} from "@/lib/api/product/get-seller-products";
import { saveItemForOrder } from "@/lib/api/customer/saved-items";
import { authClient } from "@/lib/auth-client";
import { getProductReviews, saveProductReview, type ProductReviewSummary } from "@/lib/api/product/reviews";

function formatPrice(value: number) {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatDate(value?: string) {
  if (!value) return null;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return null;
  return parsed.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function ProductDetailsView({ productId }: { productId: string }) {
  const { data: session } = authClient.useSession();
  const [product, setProduct] = useState<SellerProduct | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedImageState, setSelectedImage] = useState<string>("");
  const [selectedSizeState, setSelectedSize] = useState<string>("");
  const [selectedColorState, setSelectedColor] = useState<string>("");
  const [quantity, setQuantity] = useState(1);
  const [addedToBag, setAddedToBag] = useState(false);
  const [isSavingItem, setIsSavingItem] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [needsSignIn, setNeedsSignIn] = useState(false);
  const [reviewSummary, setReviewSummary] = useState<ProductReviewSummary | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewMessage, setReviewMessage] = useState("");
  const [reviewBusy, setReviewBusy] = useState(false);

  useEffect(() => {
    if (!product?._id) return;
    let active = true;
    getProductReviews(product._id).then((summary) => { if (active) setReviewSummary(summary); }).catch(() => { if (active) setReviewSummary(null); });
    return () => { active = false; };
  }, [product?._id]);

  const handleReviewSubmit = async () => {
    const customerId = session?.user.id;
    if (!customerId) { setReviewMessage("Please sign in to leave a review."); return; }
    if (!product) return;
    setReviewBusy(true);
    setReviewMessage("");
    try {
      const saved = await saveProductReview(customerId, product._id, reviewRating, reviewComment);
      setReviewSummary((current) => {
        const currentReviews = current?.reviews ?? [];
        const reviews = [saved, ...currentReviews.filter((item) => item.customerId !== customerId)];
        return { reviews, reviewCount: reviews.length, averageRating: reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length };
      });
      setReviewComment("");
      setReviewMessage("Your review is saved.");
    } catch (error) {
      setReviewMessage(error instanceof Error ? error.message : "Could not save your review.");
    } finally {
      setReviewBusy(false);
    }
  };

  const loadProduct = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const found = await getProductByIdOrSlug(productId);
      setProduct(found);
      setSelectedImage("");
      setSelectedSize("");
      setSelectedColor("");
      setQuantity(1);
      setAddedToBag(false);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load product details.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isCurrentRequest = true;

    getProductByIdOrSlug(productId)
      .then((found) => {
        if (isCurrentRequest) setProduct(found);
      })
      .catch((requestError) => {
        if (isCurrentRequest) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Unable to load product details.",
          );
        }
      })
      .finally(() => {
        if (isCurrentRequest) setIsLoading(false);
      });

    return () => {
      isCurrentRequest = false;
    };
  }, [productId]);

  const galleryImages = useMemo(() => {
    if (!product) return [];
    const urls = [
      product.images?.thumbnail,
      ...(product.images?.gallery ?? []),
    ].filter((url): url is string => Boolean(url && url.trim()));
    return Array.from(new Set(urls));
  }, [product]);

  const variants = useMemo(() => product?.variants ?? [], [product]);

  const sizes = useMemo(
    () => Array.from(new Set(variants.map((variant) => variant.size).filter(Boolean))),
    [variants],
  );

  const colors = useMemo(
    () => Array.from(new Set(variants.map((variant) => variant.color).filter(Boolean))),
    [variants],
  );

  const firstInStockVariant = useMemo(
    () => variants.find((variant) => variant.stock > 0) ?? variants[0] ?? null,
    [variants],
  );

  const selectedImage = selectedImageState || galleryImages[0] || "";
  const selectedSize = selectedSizeState || firstInStockVariant?.size || "";
  const selectedColor = selectedColorState || firstInStockVariant?.color || "";

  const activeVariant = useMemo(() => {
    if (!variants.length) return null;
    return (
      variants.find(
        (variant) =>
          variant.size === selectedSize && variant.color === selectedColor,
      ) ?? null
    );
  }, [variants, selectedSize, selectedColor]);

  const totalStock = useMemo(
    () => variants.reduce((sum, variant) => sum + (variant.stock ?? 0), 0),
    [variants],
  );

  const availableStock = activeVariant ? activeVariant.stock : 0;

  const handleSelectSize = (size: string) => {
    setSelectedSize(size);
    setAddedToBag(false);
    const exactMatch = variants.find(
      (variant) => variant.size === size && variant.color === selectedColor,
    );
    if (!exactMatch) {
      const fallbackForSize =
        variants.find((variant) => variant.size === size && variant.stock > 0) ??
        variants.find((variant) => variant.size === size);
      if (fallbackForSize) setSelectedColor(fallbackForSize.color);
    }
    setQuantity(1);
  };

  const handleSelectColor = (color: string) => {
    setSelectedColor(color);
    setAddedToBag(false);
    const exactMatch = variants.find(
      (variant) => variant.size === selectedSize && variant.color === color,
    );
    if (!exactMatch) {
      const fallbackForColor =
        variants.find((variant) => variant.color === color && variant.stock > 0) ??
        variants.find((variant) => variant.color === color);
      if (fallbackForColor) setSelectedSize(fallbackForColor.size);
    }
    setQuantity(1);
  };

  const handleSelectForOrder = async () => {
    if (!product || availableStock <= 0 || isSavingItem) return;
    const customerId = session?.user.id;
    if (!customerId) {
      setNeedsSignIn(true);
      return;
    }

    setIsSavingItem(true);
    setSaveError(null);
    setNeedsSignIn(false);

    try {
      const base = product.pricing?.price ?? 0;
      const discount = product.pricing?.discountPrice ?? 0;
      const unitPrice = discount > 0 && discount < base ? discount : base;

      await saveItemForOrder(customerId, {
        productId: product._id,
        name: product.name,
        brand: product.brand || "FrostFit",
        sku: product.sku || "",
        thumbnail: product.images?.thumbnail || selectedImage || "",
        unitPrice,
        size: selectedSize,
        color: selectedColor,
        quantity,
      });

      setAddedToBag(true);
    } catch (requestError) {
      const status =
        typeof requestError === "object" &&
        requestError !== null &&
        "status" in requestError
          ? (requestError as { status?: number }).status
          : undefined;

      if (status === 401) {
        setNeedsSignIn(true);
      }

      setSaveError(
        requestError instanceof Error
          ? requestError.message
          : "Could not save item.",
      );
    } finally {
      setIsSavingItem(false);
    }
  };

  if (isLoading) {
    return (
      <div className="grid gap-10 py-10 lg:grid-cols-12 lg:gap-12">
        <div className="aspect-[4/5] animate-pulse bg-[#edf0ec] lg:col-span-6" />
        <div className="space-y-4 lg:col-span-6">
          <div className="h-4 w-32 animate-pulse rounded bg-[#e5e8e4]" />
          <div className="h-10 w-3/4 animate-pulse rounded bg-[#e5e8e4]" />
          <div className="h-6 w-40 animate-pulse rounded bg-[#e5e8e4]" />
          <div className="h-24 w-full animate-pulse rounded bg-[#e5e8e4]" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-10 rounded-2xl border border-[#e6d7d4] bg-[#fffaf9] px-5 py-12 text-center">
        <AlertCircle aria-hidden="true" className="mx-auto size-7 text-[#a94e42]" />
        <p className="mt-3 text-sm font-medium text-[#5f2e28]">
          Could not load product details
        </p>
        <p className="mt-1 text-sm text-[#8b5a52]">{error}</p>
        <button
          type="button"
          onClick={loadProduct}
          className="button-sm mt-5 inline-flex items-center gap-2 rounded-full bg-[#1d2c27] px-4 py-2 text-white transition duration-300 hover:bg-[#344a42] active:scale-[0.98]"
        >
          <RefreshCw aria-hidden="true" className="size-4" />
          Try again
        </button>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="my-10 rounded-2xl border border-dashed border-[#cbd2cc] bg-white px-5 py-16 text-center">
        <PackageOpen aria-hidden="true" className="mx-auto size-9 text-[#9aa39c]" />
        <h2 className="title-3 mt-4 text-[#1d2c27]">Product not found</h2>
        <p className="body-6 mt-2 text-[#69736c]">
          The product you are looking for may have been removed or is unavailable.
        </p>
        <Link
          href="/all-products"
          className="button-sm mt-6 inline-flex items-center gap-2 rounded-full bg-[#1d2c27] px-4 py-2 text-white transition duration-300 hover:bg-[#344a42]"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Back to all products
        </Link>
      </div>
    );
  }

  const basePrice = product.pricing?.price ?? 0;
  const discountPrice = product.pricing?.discountPrice ?? 0;
  const hasDiscount = discountPrice > 0 && discountPrice < basePrice;
  const effectivePrice = hasDiscount ? discountPrice : basePrice;
  const discountPercent = hasDiscount
    ? Math.round(((basePrice - discountPrice) / basePrice) * 100)
    : 0;

  const createdDate = formatDate(product.createdAt);
  const updatedDate = formatDate(product.updatedAt);

  return (
    <div className="py-8 sm:py-12">
      <nav
        aria-label="Breadcrumb"
        className="mb-8 flex flex-wrap items-center gap-2 text-xs text-[#6f746e]"
      >
        <Link
          href="/all-products"
          className="inline-flex items-center gap-1.5 font-medium text-[#1d2c27] transition hover:underline"
        >
          <ArrowLeft aria-hidden="true" className="size-3.5" />
          All products
        </Link>
        <span aria-hidden="true">/</span>
        <span>{product.details?.season || "Collection"}</span>
        <span aria-hidden="true">/</span>
        <span className="truncate text-[#151515]">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-12 lg:gap-14">
        {/* Left: Image Gallery */}
        <div className="lg:col-span-6">
          <div className="relative aspect-[4/5] overflow-hidden bg-[#edf0ec]">
            {selectedImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={selectedImage}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center px-6 text-sm text-[#788079]">
                Image unavailable
              </div>
            )}

            {hasDiscount && (
              <span className="caption-3 absolute left-4 top-4 rounded-full bg-[#1d2c27] px-3 py-1 text-white">
                -{discountPercent}%
              </span>
            )}
          </div>

          {galleryImages.length > 1 && (
            <div className="mt-3 grid grid-cols-4 gap-3 sm:grid-cols-5">
              {galleryImages.map((imageUrl, index) => {
                const isSelected = imageUrl === selectedImage;
                return (
                  <button
                    key={`${imageUrl}-${index}`}
                    type="button"
                    onClick={() => setSelectedImage(imageUrl)}
                    aria-label={`View product image ${index + 1}`}
                    aria-pressed={isSelected}
                    className={`relative aspect-[4/5] overflow-hidden bg-[#edf0ec] transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1d2c27] ${
                      isSelected
                        ? "ring-2 ring-[#1d2c27] ring-offset-2 ring-offset-[#f9f9f7]"
                        : "opacity-75 hover:opacity-100"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imageUrl}
                      alt={`${product.name} view ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Product Information */}
        <div className="flex flex-col lg:col-span-6">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="caption-3 uppercase tracking-[0.18em] text-[#6f746e]">
              {product.brand || "FrostFit"}
            </p>
            <div className="flex items-center gap-2">
              {product.sku && (
                <span className="caption-4 rounded-full border border-[#dce0db] bg-white px-2.5 py-1 text-[#536057]">
                  SKU: {product.sku}
                </span>
              )}
              {product.status && (
                <span
                  className={`caption-4 rounded-full px-2.5 py-1 capitalize ${
                    product.status === "active"
                      ? "bg-[#e3ede7] text-[#1d2c27]"
                      : "bg-[#f0ece1] text-[#6a5a32]"
                  }`}
                >
                  {product.status}
                </span>
              )}
            </div>
          </div>

          <h1 className="heading-4 mt-3 tracking-[-0.04em] text-[#151515] sm:text-4xl sm:leading-tight">
            {product.name}
          </h1>

          {/* Pricing */}
          <div className="mt-5 flex flex-wrap items-baseline gap-3">
            <span className="text-2xl font-semibold tracking-tight text-[#1d2c27]">
              {formatPrice(effectivePrice)}
            </span>
            {hasDiscount && (
              <span className="text-base text-[#7c827b] line-through">
                {formatPrice(basePrice)}
              </span>
            )}
            {hasDiscount && (
              <span className="caption-3 text-[#2f5d46]">
                Save {formatPrice(basePrice - discountPrice)}
              </span>
            )}
          </div>

          <p className="body-6 mt-5 text-pretty leading-relaxed text-[#4f554f]">
            {product.description || "No description provided for this product."}
          </p>

          <hr className="my-7 border-[#e4e7e2]" />

          {/* Variant Selectors: Size & Color */}
          {variants.length > 0 ? (
            <div className="space-y-6">
              {sizes.length > 0 && (
                <div>
                  <div className="flex items-center justify-between">
                    <span className="caption-3 uppercase tracking-[0.12em] text-[#536057]">
                      Size
                    </span>
                    <span className="caption-4 text-[#6f746e]">
                      Selected: {selectedSize || "—"}
                    </span>
                  </div>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {sizes.map((size) => {
                      const isSelected = selectedSize === size;
                      const hasStockInSize = variants.some(
                        (variant) => variant.size === size && variant.stock > 0,
                      );
                      return (
                        <button
                          key={size}
                          type="button"
                          onClick={() => handleSelectSize(size)}
                          aria-pressed={isSelected}
                          className={`min-w-12 rounded-full border px-4 py-2 text-xs font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1d2c27] ${
                            isSelected
                              ? "border-[#1d2c27] bg-[#1d2c27] text-white"
                              : hasStockInSize
                                ? "border-[#cfd5ce] bg-white text-[#151515] hover:border-[#1d2c27]"
                                : "border-[#e3e6e2] bg-[#f4f5f3] text-[#9aa099] line-through"
                          }`}
                        >
                          {size}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {colors.length > 0 && (
                <div>
                  <div className="flex items-center justify-between">
                    <span className="caption-3 uppercase tracking-[0.12em] text-[#536057]">
                      Color
                    </span>
                    <span className="caption-4 text-[#6f746e]">
                      {selectedColor || "—"}
                    </span>
                  </div>
                  <div className="mt-2.5 flex flex-wrap gap-2">
                    {colors.map((color) => {
                      const isSelected = selectedColor === color;
                      const variantForColor = variants.find(
                        (variant) =>
                          variant.size === selectedSize &&
                          variant.color === color,
                      );
                      const isAvailableForSize = Boolean(
                        variantForColor && variantForColor.stock > 0,
                      );

                      return (
                        <button
                          key={color}
                          type="button"
                          onClick={() => handleSelectColor(color)}
                          aria-pressed={isSelected}
                          className={`rounded-full border px-4 py-2 text-xs font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1d2c27] ${
                            isSelected
                              ? "border-[#1d2c27] bg-[#1d2c27] text-white"
                              : isAvailableForSize
                                ? "border-[#cfd5ce] bg-white text-[#151515] hover:border-[#1d2c27]"
                                : "border-[#e3e6e2] bg-[#f4f5f3] text-[#7c827b]"
                          }`}
                        >
                          {color}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Stock & Quantity */}
              <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-[#e3e6e1] bg-white px-4 py-3">
                <div>
                  <p className="caption-3 text-[#1d2c27]">
                    {activeVariant
                      ? availableStock > 0
                        ? `${availableStock} in stock`
                        : "Out of stock for this variant"
                      : "Variant unavailable"}
                  </p>
                  <p className="caption-4 mt-0.5 text-[#6f746e]">
                    Total inventory across all variants: {totalStock}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    disabled={quantity <= 1 || availableStock <= 0}
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="flex size-8 items-center justify-center rounded-full border border-[#d6dbd5] text-[#1d2c27] transition hover:border-[#1d2c27] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Minus className="size-3.5" />
                  </button>
                  <span className="w-8 text-center text-sm font-semibold text-[#151515]">
                    {availableStock > 0 ? quantity : 0}
                  </span>
                  <button
                    type="button"
                    aria-label="Increase quantity"
                    disabled={quantity >= availableStock || availableStock <= 0}
                    onClick={() =>
                      setQuantity((q) => Math.min(availableStock, q + 1))
                    }
                    className="flex size-8 items-center justify-center rounded-full border border-[#d6dbd5] text-[#1d2c27] transition hover:border-[#1d2c27] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Plus className="size-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <p className="body-6 text-[#6f746e]">No variants configured.</p>
          )}

          {/* Primary Action */}
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              disabled={availableStock <= 0 || isSavingItem}
              onClick={handleSelectForOrder}
              className="button-sm inline-flex flex-1 items-center justify-center gap-2 rounded-full bg-[#1d2c27] px-6 py-3.5 text-white transition duration-300 hover:bg-[#344a42] active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-[#9aa39c]"
            >
              {isSavingItem ? (
                "Saving to dashboard…"
              ) : addedToBag ? (
                <>
                  <Check aria-hidden="true" className="size-4" />
                  Saved ({selectedSize} / {selectedColor} × {quantity})
                </>
              ) : (
                <>
                  <ShoppingBag aria-hidden="true" className="size-4" />
                  {availableStock > 0 ? "Select for order" : "Out of stock"}
                </>
              )}
            </button>
            <Link
              href="/all-products"
              className="button-sm inline-flex items-center justify-center rounded-full border border-[#1d2c27] px-6 py-3.5 text-[#1d2c27] transition duration-300 hover:bg-[#1d2c27] hover:text-white"
            >
              Continue shopping
            </Link>
          </div>

          {addedToBag && (
            <p className="mt-3 text-xs text-[#2f5d46]">
              Added to your{" "}
              <Link
                href="/dashboard?tab=saved"
                className="font-semibold underline underline-offset-4"
              >
                Saved items
              </Link>{" "}
              in the dashboard.
            </p>
          )}

          {saveError && (
            <p className="mt-3 text-xs text-[#a94e42]">
              {saveError}{" "}
              {needsSignIn && (
                <Link
                  href="/sign-in"
                  className="font-semibold text-[#1d2c27] underline underline-offset-4"
                >
                  Sign in now
                </Link>
              )}
            </p>
          )}

          {/* Shipping & Guarantee */}
          <div className="mt-7 grid gap-3 sm:grid-cols-2">
            <div className="flex items-start gap-3 rounded-xl border border-[#e3e6e1] bg-white p-4">
              <Truck
                aria-hidden="true"
                className="mt-0.5 size-5 shrink-0 text-[#1d2c27]"
              />
              <div>
                <p className="title-4 text-[#151515]">
                  {product.shipping?.freeShipping
                    ? "Free shipping"
                    : "Standard delivery"}
                </p>
                <p className="caption-4 mt-0.5 text-[#6f746e]">
                  {product.shipping?.freeShipping
                    ? "Complimentary delivery included"
                    : `Delivery charge: ${formatPrice(product.shipping?.deliveryCharge ?? 0)}`}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 rounded-xl border border-[#e3e6e1] bg-white p-4">
              <ShieldCheck
                aria-hidden="true"
                className="mt-0.5 size-5 shrink-0 text-[#1d2c27]"
              />
              <div>
                <p className="title-4 text-[#151515]">Verified FrostFit item</p>
                <p className="caption-4 mt-0.5 text-[#6f746e]">
                  Category: {product.categoryId || "General"}
                </p>
              </div>
            </div>
          </div>

          {/* Specifications */}
          <div className="mt-7 rounded-2xl border border-[#e3e6e1] bg-white p-5">
            <h2 className="caption-3 uppercase tracking-[0.14em] text-[#536057]">
              Product specifications
            </h2>
            <dl className="mt-4 grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
              <div>
                <dt className="caption-4 text-[#6f746e]">Material</dt>
                <dd className="mt-0.5 font-medium text-[#151515]">
                  {product.details?.material || "—"}
                </dd>
              </div>
              <div>
                <dt className="caption-4 text-[#6f746e]">Gender</dt>
                <dd className="mt-0.5 font-medium text-[#151515]">
                  {product.details?.gender || "—"}
                </dd>
              </div>
              <div>
                <dt className="caption-4 text-[#6f746e]">Season</dt>
                <dd className="mt-0.5 font-medium text-[#151515]">
                  {product.details?.season || "—"}
                </dd>
              </div>
              <div>
                <dt className="caption-4 text-[#6f746e]">Weight</dt>
                <dd className="mt-0.5 font-medium text-[#151515]">
                  {product.details?.weight != null
                    ? `${product.details.weight} kg`
                    : "—"}
                </dd>
              </div>
              <div>
                <dt className="caption-4 text-[#6f746e]">Slug</dt>
                <dd className="mt-0.5 truncate font-mono text-xs text-[#4f554f]">
                  {product.slug || "—"}
                </dd>
              </div>
              <div>
                <dt className="caption-4 text-[#6f746e]">Seller ID</dt>
                <dd className="mt-0.5 truncate font-mono text-xs text-[#4f554f]">
                  {product.sellerId || "—"}
                </dd>
              </div>
            </dl>

            {(createdDate || updatedDate) && (
              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 border-t border-[#eef0ec] pt-3 text-xs text-[#788079]">
                {createdDate && <span>Listed: {createdDate}</span>}
                {updatedDate && <span>Updated: {updatedDate}</span>}
              </div>
            )}
          </div>
        </div>
      </div>

      <section className="mt-16 border-t border-[#e4e7e2] pt-10" aria-labelledby="reviews-heading">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="caption-3 uppercase tracking-[0.16em] text-[#6f746e]">Customer feedback</p>
            <h2 id="reviews-heading" className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-[#1d2c27]">Product reviews</h2>
          </div>
          <p className="text-sm text-[#536057]">{reviewSummary?.reviewCount ? `${reviewSummary.averageRating.toFixed(1)} / 5 · ${reviewSummary.reviewCount} review${reviewSummary.reviewCount === 1 ? "" : "s"}` : "No reviews yet"}</p>
        </div>
        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="space-y-3">
            {reviewSummary?.reviews.map((review) => <article key={review._id} className="rounded-2xl border border-[#e3e6e1] bg-white p-4">
              <div className="flex items-center justify-between gap-3"><p className="font-medium text-[#1d2c27]">{review.customerName}</p><p className="text-sm tracking-wider text-[#8a7448]" aria-label={`${review.rating} out of 5 stars`}>{"★".repeat(review.rating)}{"☆".repeat(5 - review.rating)}</p></div>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-[#536057]">{review.comment}</p>
              <p className="mt-3 text-xs text-[#788079]">{formatDate(review.updatedAt)}</p>
            </article>)}
            {!reviewSummary?.reviews.length && <p className="rounded-2xl border border-dashed border-[#cbd2cc] bg-white px-5 py-8 text-sm text-[#788079]">Be the first to share your experience after your order is delivered.</p>}
          </div>
          <div className="h-fit rounded-2xl border border-[#e3e6e1] bg-white p-5">
            <h3 className="font-semibold text-[#1d2c27]">Write a review</h3>
            <p className="mt-1 text-xs text-[#788079]">Reviews are available to customers with a delivered order.</p>
            <label htmlFor="review-rating" className="mt-4 block text-xs font-medium text-[#536057]">Rating</label>
            <select id="review-rating" value={reviewRating} onChange={(event) => setReviewRating(Number(event.target.value))} className="mt-1 w-full rounded-xl border border-[#d8ddd8] bg-white px-3 py-2 text-sm text-[#1d2c27]"><option value={5}>5 — Excellent</option><option value={4}>4 — Good</option><option value={3}>3 — Average</option><option value={2}>2 — Poor</option><option value={1}>1 — Very poor</option></select>
            <label htmlFor="review-comment" className="mt-3 block text-xs font-medium text-[#536057]">Your experience</label>
            <textarea id="review-comment" value={reviewComment} onChange={(event) => setReviewComment(event.target.value)} maxLength={1500} rows={4} placeholder="What did you think of this product?" className="mt-1 w-full resize-y rounded-xl border border-[#d8ddd8] px-3 py-2 text-sm outline-none focus:border-[#536057]" />
            {reviewMessage && <p className="mt-2 text-xs text-[#536057]">{reviewMessage}</p>}
            <button type="button" disabled={reviewBusy || reviewComment.trim().length < 3} onClick={() => void handleReviewSubmit()} className="mt-3 w-full rounded-full bg-[#1d2c27] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#344a42] disabled:cursor-not-allowed disabled:opacity-50">{reviewBusy ? "Saving…" : "Submit review"}</button>
          </div>
        </div>
      </section>
    </div>
  );
}
