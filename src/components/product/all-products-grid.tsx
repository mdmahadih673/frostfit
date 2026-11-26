"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  PackageOpen,
  RefreshCw,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";

import {
  searchProducts,
  type ProductSearchResponse,
  type ProductSortOption,
  type SellerProduct,
} from "@/lib/api/product/get-seller-products";

type AllProductsGridProps = {
  season?: "Winter" | "Summer";
};

function productPrice(product: SellerProduct) {
  const discount = product.pricing?.discountPrice ?? 0;
  const base = product.pricing?.price ?? 0;
  const effective = discount > 0 && discount < base ? discount : base;
  return effective.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function AllProductsGrid({ season }: AllProductsGridProps = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const urlQuery = searchParams.get("q") ?? "";
  const urlGender = searchParams.get("gender") ?? "all";
  const urlSize = searchParams.get("size") ?? "all";
  const urlSeason = searchParams.get("season") ?? "all";
  const urlInStock = searchParams.get("inStock") === "true";
  const rawUrlSort = searchParams.get("sort");
  const urlSort: ProductSortOption =
    rawUrlSort === "price-asc" || rawUrlSort === "price-desc"
      ? rawUrlSort
      : "newest";

  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [facets, setFacets] = useState<ProductSearchResponse["facets"]>({
    seasons: [],
    genders: [],
    sizes: [],
  });
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [searchInput, setSearchInput] = useState(urlQuery);
  const [reloadToken, setReloadToken] = useState(0);

  const updateUrlParams = useCallback(
    (updates: Record<string, string | null>) => {
      const nextParams = new URLSearchParams(searchParams.toString());

      for (const [key, value] of Object.entries(updates)) {
        if (!value || value === "all" || (key === "sort" && value === "newest")) {
          nextParams.delete(key);
        } else {
          nextParams.set(key, value);
        }
      }

      const queryString = nextParams.toString();
      const targetUrl = queryString ? `${pathname}?${queryString}` : pathname;
      router.replace(targetUrl, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  useEffect(() => {
    const trimmedInput = searchInput.trim();
    if (trimmedInput === urlQuery) return;

    const timer = window.setTimeout(() => {
      setIsLoading(true);
      updateUrlParams({ q: trimmedInput || null });
    }, 250);

    return () => window.clearTimeout(timer);
  }, [searchInput, urlQuery, updateUrlParams]);

  const effectiveSeason = season ?? urlSeason;

  useEffect(() => {
    const controller = new AbortController();

    searchProducts(
      {
        q: urlQuery,
        season: effectiveSeason,
        gender: urlGender,
        size: urlSize,
        inStock: urlInStock,
        sort: urlSort,
      },
      controller.signal,
    )
      .then((data) => {
        setProducts(data.products);
        setTotalCount(data.totalCount);
        setFacets(data.facets);
        setError(null);
      })
      .catch((requestError) => {
        if (controller.signal.aborted) return;
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to load products.",
        );
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => {
      controller.abort();
    };
  }, [
    urlQuery,
    effectiveSeason,
    urlGender,
    urlSize,
    urlInStock,
    urlSort,
    reloadToken,
  ]);

  const handleRetry = useCallback(() => {
    setIsLoading(true);
    setError(null);
    setReloadToken((token) => token + 1);
  }, []);

  const hasActiveFilters =
    Boolean(searchInput.trim() || urlQuery) ||
    urlGender !== "all" ||
    urlSize !== "all" ||
    (!season && urlSeason !== "all") ||
    urlInStock ||
    urlSort !== "newest";

  const resetFilters = () => {
    setIsLoading(true);
    setSearchInput("");
    router.replace(pathname, { scroll: false });
  };

  if (error && !products.length) {
    return (
      <div className="rounded-2xl border border-[#e6d7d4] bg-[#fffaf9] px-5 py-10 text-center">
        <AlertCircle aria-hidden="true" className="mx-auto size-7 text-[#a94e42]" />
        <p className="mt-3 text-sm font-medium text-[#5f2e28]">
          Could not load products
        </p>
        <p className="mt-1 text-sm text-[#8b5a52]">{error}</p>
        <button
          type="button"
          onClick={handleRetry}
          className="button-sm mt-5 inline-flex items-center gap-2 rounded-full bg-[#1d2c27] px-3 py-2 text-white transition duration-300 hover:bg-[#344a42] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1d2c27]"
        >
          <RefreshCw aria-hidden="true" className="size-4" />
          Try again
        </button>
      </div>
    );
  }

  if (!isLoading && totalCount === 0 && !hasActiveFilters) {
    return (
      <div className="rounded-2xl border border-dashed border-[#cbd2cc] bg-white px-5 py-16 text-center">
        <PackageOpen aria-hidden="true" className="mx-auto size-9 text-[#9aa39c]" />
        <h2 className="title-3 mt-4 text-[#1d2c27]">
          {season
            ? `No ${season.toLowerCase()} products available`
            : "No products available"}
        </h2>
        <p className="body-6 mt-2 text-[#69736c]">
          Check back soon for the latest FrostFit arrivals.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search & Filter Toolbar */}
      <div className="rounded-2xl border border-[#e3e6e1] bg-white p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search
              aria-hidden="true"
              className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-[#6f746e]"
            />
            <input
              type="search"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Search by name, brand, material, or SKU..."
              aria-label="Search products"
              className="h-10 w-full rounded-full border border-[#d6dbd5] bg-[#f9f9f7] pl-10 pr-9 text-sm text-[#151515] placeholder:text-[#7c827b] focus:border-[#1d2c27] focus:bg-white focus:outline-none"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => {
                  setIsLoading(true);
                  setSearchInput("");
                  updateUrlParams({ q: null });
                }}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-0.5 text-[#6f746e] transition hover:text-[#151515]"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#6f746e]">
              <SlidersHorizontal aria-hidden="true" className="size-3.5" />
              Filters
            </span>

            {!season && facets.seasons.length > 0 && (
              <select
                value={urlSeason}
                onChange={(event) => {
                  setIsLoading(true);
                  updateUrlParams({ season: event.target.value });
                }}
                aria-label="Filter by season"
                className="h-9 rounded-full border border-[#d6dbd5] bg-[#f9f9f7] px-3 text-xs font-medium text-[#151515] focus:border-[#1d2c27] focus:outline-none"
              >
                <option value="all">All seasons</option>
                {facets.seasons.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            )}

            {facets.genders.length > 0 && (
              <select
                value={urlGender}
                onChange={(event) => {
                  setIsLoading(true);
                  updateUrlParams({ gender: event.target.value });
                }}
                aria-label="Filter by gender"
                className="h-9 rounded-full border border-[#d6dbd5] bg-[#f9f9f7] px-3 text-xs font-medium text-[#151515] focus:border-[#1d2c27] focus:outline-none"
              >
                <option value="all">All genders</option>
                {facets.genders.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            )}

            {facets.sizes.length > 0 && (
              <select
                value={urlSize}
                onChange={(event) => {
                  setIsLoading(true);
                  updateUrlParams({ size: event.target.value });
                }}
                aria-label="Filter by size"
                className="h-9 rounded-full border border-[#d6dbd5] bg-[#f9f9f7] px-3 text-xs font-medium text-[#151515] focus:border-[#1d2c27] focus:outline-none"
              >
                <option value="all">All sizes</option>
                {facets.sizes.map((option) => (
                  <option key={option} value={option}>
                    Size {option}
                  </option>
                ))}
              </select>
            )}

            <select
              value={urlSort}
              onChange={(event) => {
                setIsLoading(true);
                updateUrlParams({ sort: event.target.value });
              }}
              aria-label="Sort products"
              className="h-9 rounded-full border border-[#d6dbd5] bg-[#f9f9f7] px-3 text-xs font-medium text-[#151515] focus:border-[#1d2c27] focus:outline-none"
            >
              <option value="newest">Newest first</option>
              <option value="price-asc">Price: Low to high</option>
              <option value="price-desc">Price: High to low</option>
            </select>

            <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded-full border border-[#d6dbd5] bg-[#f9f9f7] px-3 text-xs font-medium text-[#151515] transition hover:border-[#1d2c27]">
              <input
                type="checkbox"
                checked={urlInStock}
                onChange={(event) => {
                  setIsLoading(true);
                  updateUrlParams({
                    inStock: event.target.checked ? "true" : null,
                  });
                }}
                className="size-3.5 accent-[#1d2c27]"
              />
              In stock
            </label>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-[#eef0ec] pt-3 text-xs text-[#6f746e]">
          <span>
            {isLoading
              ? "Searching products…"
              : `Showing ${products.length} of ${totalCount} products`}
          </span>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={resetFilters}
              className="font-medium text-[#1d2c27] underline-offset-4 hover:underline"
            >
              Reset filters
            </button>
          )}
        </div>
      </div>

      {/* Product Grid or Empty Filter Result */}
      {isLoading ? (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, index) => (
            <div key={index} className="space-y-3">
              <div className="aspect-[4/5] animate-pulse bg-[#e7eae6]" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-[#e7eae6]" />
            </div>
          ))}
        </div>
      ) : !products.length ? (
        <div className="rounded-2xl border border-dashed border-[#cbd2cc] bg-white px-5 py-14 text-center">
          <PackageOpen
            aria-hidden="true"
            className="mx-auto size-9 text-[#9aa39c]"
          />
          <h2 className="title-3 mt-4 text-[#1d2c27]">No matching products</h2>
          <p className="body-6 mt-2 text-[#69736c]">
            Try adjusting your search query or clearing some filters.
          </p>
          <button
            type="button"
            onClick={resetFilters}
            className="button-sm mt-5 inline-flex items-center gap-2 rounded-full bg-[#1d2c27] px-4 py-2 text-white transition duration-300 hover:bg-[#344a42]"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
          {products.map((product) => (
            <article key={product._id} className="group min-w-0">
              <Link
                href={`/all-products/${encodeURIComponent(product._id)}`}
                className="block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1d2c27]"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-[#edf0ec]">
                  {product.images.thumbnail ? (
                    // Standard img supports seller-supplied external URLs without Next image host configuration.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={product.images.thumbnail}
                      alt={product.name}
                      className="h-full w-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center px-4 text-center text-sm text-[#788079]">
                      Image unavailable
                    </div>
                  )}
                </div>
                <div className="mt-3 flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="title-4 truncate text-[#1d2c27]">
                      {product.name}
                    </h2>
                    <p className="caption-4 mt-1 truncate text-[#6f746e]">
                      {product.brand}
                    </p>
                  </div>
                  <p className="caption-4 shrink-0 text-[#536057]">
                    {productPrice(product)}
                  </p>
                </div>
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
