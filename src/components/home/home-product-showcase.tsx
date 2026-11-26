"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AlertCircle, PackageOpen, RefreshCw } from "lucide-react";

import {
  getAllProducts,
  type SellerProduct,
} from "@/lib/api/product/get-seller-products";

type ShowcaseMode = "new-arrivals" | "winter";
type ShowcaseVariant = "light" | "dark";

type HomeProductShowcaseProps = {
  id?: string;
  eyebrow: string;
  title: string;
  mode: ShowcaseMode;
  variant: ShowcaseVariant;
  emptyMessage: string;
};

function getProductTimestamp(product: SellerProduct) {
  const raw = product.createdAt || product.updatedAt;
  if (!raw) return 0;
  const time = new Date(raw).getTime();
  return Number.isNaN(time) ? 0 : time;
}

function formatPrice(product: SellerProduct) {
  const price = product.pricing?.discountPrice || product.pricing?.price || 0;
  return price.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function HomeProductShowcase({
  id,
  eyebrow,
  title,
  mode,
  variant,
  emptyMessage,
}: HomeProductShowcaseProps) {
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadProducts = async () => {
    setIsLoading(true);
    setError(null);

    try {
      setProducts(await getAllProducts());
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load products.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isCurrentRequest = true;

    getAllProducts()
      .then((allProducts) => {
        if (isCurrentRequest) setProducts(allProducts);
      })
      .catch((requestError) => {
        if (isCurrentRequest) {
          setError(
            requestError instanceof Error
              ? requestError.message
              : "Unable to load products.",
          );
        }
      })
      .finally(() => {
        if (isCurrentRequest) setIsLoading(false);
      });

    return () => {
      isCurrentRequest = false;
    };
  }, []);

  const visibleProducts = useMemo(() => {
    if (mode === "new-arrivals") {
      return [...products]
        .sort((a, b) => getProductTimestamp(b) - getProductTimestamp(a))
        .slice(0, 6);
    }

    return products
      .filter(
        (product) =>
          product.details?.season?.trim().toLowerCase() === "winter",
      )
      .slice(0, 6);
  }, [products, mode]);

  const isDark = variant === "dark";

  return (
    <section
      id={id}
      className={`mx-auto mt-6 max-w-[1440px] px-5 py-12 shadow-[0_24px_70px_rgba(34,34,31,0.08)] sm:mt-12 sm:px-10 sm:py-16 lg:px-14 lg:py-20 ${
        isDark ? "bg-[#1d2c27] text-white" : "bg-[#f9f9f7] text-[#151515]"
      }`}
    >
      <div className="flex items-end justify-between gap-6">
        <div>
          <p
            className={`caption-3 uppercase tracking-[0.18em] ${
              isDark ? "text-[#b9c3bc]" : "text-[#6f746e]"
            }`}
          >
            {eyebrow}
          </p>
          <h2 className="heading-4 mt-3 tracking-[-0.055em]">{title}</h2>
        </div>
        <Link
          href="/all-products"
          className={`button-sm shrink-0 rounded-full border px-3 py-2 transition duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 ${
            isDark
              ? "border-white text-white hover:bg-white hover:text-[#1d2c27] focus-visible:outline-white"
              : "border-[#1d2c27] text-[#1d2c27] hover:bg-[#1d2c27] hover:text-white focus-visible:outline-[#1d2c27]"
          }`}
        >
          See all
        </Link>
      </div>

      {isLoading ? (
        <div className="mt-8 grid grid-cols-2 gap-3 sm:mt-10 sm:gap-4 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="space-y-3">
              <div
                className={`aspect-[4/5] animate-pulse ${
                  isDark ? "bg-white/10" : "bg-[#e7eae6]"
                }`}
              />
              <div
                className={`h-4 w-2/3 animate-pulse rounded ${
                  isDark ? "bg-white/10" : "bg-[#e7eae6]"
                }`}
              />
            </div>
          ))}
        </div>
      ) : error ? (
        <div
          className={`mt-8 rounded-2xl border px-5 py-10 text-center sm:mt-10 ${
            isDark
              ? "border-white/15 bg-white/5 text-white"
              : "border-[#e6d7d4] bg-[#fffaf9] text-[#5f2e28]"
          }`}
        >
          <AlertCircle
            aria-hidden="true"
            className={`mx-auto size-7 ${
              isDark ? "text-[#f2b8b0]" : "text-[#a94e42]"
            }`}
          />
          <p className="mt-3 text-sm font-medium">Could not load products</p>
          <p
            className={`mt-1 text-sm ${
              isDark ? "text-white/75" : "text-[#8b5a52]"
            }`}
          >
            {error}
          </p>
          <button
            type="button"
            onClick={loadProducts}
            className={`button-sm mt-5 inline-flex items-center gap-2 rounded-full px-4 py-2 transition duration-300 active:scale-[0.98] ${
              isDark
                ? "bg-white text-[#1d2c27] hover:bg-[#e7ece9]"
                : "bg-[#1d2c27] text-white hover:bg-[#344a42]"
            }`}
          >
            <RefreshCw aria-hidden="true" className="size-4" />
            Try again
          </button>
        </div>
      ) : !visibleProducts.length ? (
        <div
          className={`mt-8 rounded-2xl border border-dashed px-5 py-14 text-center sm:mt-10 ${
            isDark
              ? "border-white/20 bg-white/5 text-white"
              : "border-[#cbd2cc] bg-white text-[#1d2c27]"
          }`}
        >
          <PackageOpen
            aria-hidden="true"
            className={`mx-auto size-9 ${
              isDark ? "text-white/60" : "text-[#9aa39c]"
            }`}
          />
          <p className="body-6 mt-3 opacity-80">{emptyMessage}</p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-3 sm:mt-10 sm:gap-4 lg:grid-cols-3">
          {visibleProducts.map((product) => (
            <article key={product._id} className="group min-w-0">
              <Link
                href={`/all-products/${encodeURIComponent(product._id)}`}
                className={`block focus-visible:outline-2 focus-visible:outline-offset-4 ${
                  isDark
                    ? "focus-visible:outline-white"
                    : "focus-visible:outline-[#1d2c27]"
                }`}
              >
                <div
                  className={`relative aspect-[4/5] overflow-hidden ${
                    isDark ? "bg-[#2a3b35]" : "bg-[#edf0ec]"
                  }`}
                >
                  {product.images?.thumbnail ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.images.thumbnail}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                    />
                  ) : (
                    <div
                      className={`flex h-full items-center justify-center px-4 text-center text-sm ${
                        isDark ? "text-white/65" : "text-[#788079]"
                      }`}
                    >
                      Image unavailable
                    </div>
                  )}
                </div>
                <div className="mt-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3
                      className={`title-4 truncate ${
                        isDark ? "text-white" : "text-[#1d2c27]"
                      }`}
                    >
                      {product.name}
                    </h3>
                    <p
                      className={`caption-4 mt-1 truncate ${
                        isDark ? "text-[#b9c3bc]" : "text-[#6f746e]"
                      }`}
                    >
                      {product.brand}
                    </p>
                  </div>
                  <span
                    className={`caption-4 shrink-0 ${
                      isDark ? "text-[#d9e0db]" : "text-[#536057]"
                    }`}
                  >
                    {formatPrice(product)}
                  </span>
                </div>
              </Link>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
