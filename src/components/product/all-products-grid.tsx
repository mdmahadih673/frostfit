"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AlertCircle, PackageOpen, RefreshCw } from "lucide-react";

import {
  getAllProducts,
  type SellerProduct,
} from "@/lib/api/product/get-seller-products";

function productPrice(product: SellerProduct) {
  const price = product.pricing.discountPrice || product.pricing.price;
  return price.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function AllProductsGrid() {
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadProducts = async () => {
    setIsLoading(true);
    setError(null);

    try {
      setProducts(await getAllProducts());
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to load products.");
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
          setError(requestError instanceof Error ? requestError.message : "Unable to load products.");
        }
      })
      .finally(() => {
        if (isCurrentRequest) setIsLoading(false);
      });

    return () => {
      isCurrentRequest = false;
    };
  }, []);

  if (isLoading) {
    return <p className="body-6 py-16 text-center text-[#6f746e]">Loading products…</p>;
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-[#e6d7d4] bg-[#fffaf9] px-5 py-10 text-center">
        <AlertCircle aria-hidden="true" className="mx-auto size-7 text-[#a94e42]" />
        <p className="mt-3 text-sm font-medium text-[#5f2e28]">Could not load products</p>
        <p className="mt-1 text-sm text-[#8b5a52]">{error}</p>
        <button type="button" onClick={loadProducts} className="button-sm mt-5 inline-flex items-center gap-2 rounded-full bg-[#1d2c27] px-3 py-2 text-white transition duration-300 hover:bg-[#344a42] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1d2c27]"><RefreshCw aria-hidden="true" className="size-4" />Try again</button>
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="rounded-2xl border border-dashed border-[#cbd2cc] bg-white px-5 py-16 text-center">
        <PackageOpen aria-hidden="true" className="mx-auto size-9 text-[#9aa39c]" />
        <h2 className="title-3 mt-4 text-[#1d2c27]">No products available</h2>
        <p className="body-6 mt-2 text-[#69736c]">Check back soon for the latest FrostFit arrivals.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3">
      {products.map((product) => (
        <article key={product._id} className="group min-w-0">
          <Link href={`/all-products/${encodeURIComponent(product._id)}`} className="block focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1d2c27]">
            <div className="relative aspect-[4/5] overflow-hidden bg-[#edf0ec]">
              {product.images.thumbnail ? (
                // Standard img supports seller-supplied external URLs without Next image host configuration.
                // eslint-disable-next-line @next/next/no-img-element
                <img src={product.images.thumbnail} alt={product.name} className="h-full w-full object-cover transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105" />
              ) : (
                <div className="flex h-full items-center justify-center px-4 text-center text-sm text-[#788079]">Image unavailable</div>
              )}
            </div>
            <div className="mt-3 flex items-start justify-between gap-3">
              <div className="min-w-0"><h2 className="title-4 truncate text-[#1d2c27]">{product.name}</h2><p className="caption-4 mt-1 truncate text-[#6f746e]">{product.brand}</p></div>
              <p className="caption-4 shrink-0 text-[#536057]">{productPrice(product)}</p>
            </div>
          </Link>
        </article>
      ))}
    </div>
  );
}
