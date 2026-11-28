"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { AlertCircle, Boxes, CheckCircle2, Eye, Pencil, RefreshCw, Trash2, X } from "lucide-react";

import {
  deleteSellerProduct,
  getSellerProducts,
  type SellerProduct,
  updateSellerProduct,
} from "@/lib/api/product/get-seller-products";

function getStock(product: SellerProduct) {
  return product.variants.reduce((total, variant) => total + variant.stock, 0);
}

function formatPrice(product: SellerProduct) {
  const price = product.pricing.discountPrice || product.pricing.price;
  return price.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function SellerProductsTable({ sellerId }: { sellerId: string }) {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<SellerProduct[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [previewProduct, setPreviewProduct] = useState<SellerProduct | null>(null);
  const [editingProduct, setEditingProduct] = useState<SellerProduct | null>(null);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editDiscountPrice, setEditDiscountPrice] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const showCreatedToast = searchParams.get("created") === "1";

  const loadProducts = async () => {
    setIsLoading(true);
    setError(null);

    try {
      setProducts(await getSellerProducts(sellerId));
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load your products.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isCurrentRequest = true;

    getSellerProducts(sellerId)
      .then((sellerProducts) => {
        if (isCurrentRequest) setProducts(sellerProducts);
      })
      .catch((requestError) => {
        if (!isCurrentRequest) return;
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Unable to load your products.",
        );
      })
      .finally(() => {
        if (isCurrentRequest) setIsLoading(false);
      });

    return () => {
      isCurrentRequest = false;
    };
  }, [sellerId]);

  const startEdit = (product: SellerProduct) => {
    setEditingProduct(product);
    setEditName(product.name);
    setEditDescription(product.description);
    setEditPrice(String(product.pricing.price));
    setEditDiscountPrice(String(product.pricing.discountPrice));
  };

  const saveEdit = async () => {
    if (!editingProduct) return;

    setIsSaving(true);
    setError(null);

    try {
      const updatedProduct = await updateSellerProduct(editingProduct._id, sellerId, {
        name: editName.trim(),
        description: editDescription.trim(),
        pricing: {
          price: Number(editPrice),
          discountPrice: Number(editDiscountPrice || 0),
        },
      });
      setProducts((current) => current.map((product) => product._id === updatedProduct._id ? updatedProduct : product));
      setEditingProduct(null);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to update product.");
    } finally {
      setIsSaving(false);
    }
  };

  const deleteProduct = async (productId: string) => {
    setDeletingId(productId);
    setError(null);

    try {
      await deleteSellerProduct(productId, sellerId);
      setProducts((current) => current.filter((product) => product._id !== productId));
      setPendingDeleteId(null);
      if (previewProduct?._id === productId) setPreviewProduct(null);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to delete product.");
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-[#e1e4df] bg-white px-5 py-12 text-center">
        <p className="text-sm text-[#788079]">Loading your products…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-[#e6d7d4] bg-[#fffaf9] px-5 py-8 text-center">
        <AlertCircle aria-hidden="true" className="mx-auto size-7 text-[#a94e42]" />
        <p className="mt-3 text-sm font-medium text-[#5f2e28]">Could not load products</p>
        <p className="mt-1 text-sm text-[#8b5a52]">{error}</p>
        <button type="button" onClick={loadProducts} className="button-sm mt-5 inline-flex items-center gap-2 rounded-full bg-[#1d2c27] px-3 py-2 text-white transition duration-300 hover:bg-[#344a42] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1d2c27]">
          <RefreshCw aria-hidden="true" className="size-4" /> Try again
        </button>
      </div>
    );
  }

  if (!products.length) {
    return (
      <div className="rounded-2xl border border-dashed border-[#cbd2cc] bg-white px-5 py-12 text-center">
        <Boxes aria-hidden="true" className="mx-auto size-8 text-[#9aa39c]" />
        <h2 className="mt-3 text-base font-semibold text-[#1d2c27]">No products found</h2>
        <p className="mx-auto mt-1 max-w-md text-sm text-[#788079]">Your product catalog is empty. Add a product to get started.</p>
        <Link href="/dashboard/products/new" className="button-sm mt-5 inline-flex rounded-full bg-[#1d2c27] px-3 py-2 text-white transition duration-300 hover:bg-[#344a42] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1d2c27]">Add your first product</Link>
      </div>
    );
  }

  return (
    <div className="relative overflow-x-auto rounded-2xl border border-[#e1e4df] bg-white">
      {showCreatedToast ? <div role="status" aria-live="polite" className="fixed right-4 top-20 z-50 flex items-start gap-3 rounded-2xl border border-[#cbd8ce] bg-white p-4 text-sm text-[#1d2c27] shadow-[0_16px_44px_rgba(29,44,39,0.16)]"><CheckCircle2 aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-[#3f7651]" /><div><p className="font-semibold">Product added</p><p className="mt-0.5 text-[#69736c]">Your product is now in My products.</p></div></div> : null}
      <table className="w-full min-w-[800px] text-left">
        <thead className="bg-[#edf0ec] text-xs font-medium uppercase tracking-wide text-[#788079]">
          <tr>
            <th className="px-4 py-3">Product</th>
            <th className="px-4 py-3">Price</th>
            <th className="px-4 py-3">Stock</th>
            <th className="px-4 py-3">Status</th>
            <th className="px-4 py-3 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#e9ece8]">
          {products.map((product) => (
            <tr key={product._id} className="transition-colors duration-300 hover:bg-[#fafbf9]">
              <td className="px-4 py-4">
                <p className="text-sm font-medium text-[#1d2c27]">{product.name}</p>
                <p className="mt-1 text-xs text-[#788079]">{product.sku}</p>
              </td>
              <td className="px-4 py-4 text-sm text-[#536057]">{formatPrice(product)}</td>
              <td className="px-4 py-4 text-sm text-[#536057]">{getStock(product)}</td>
              <td className="px-4 py-4">
                <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium capitalize ${product.status === "active" ? "bg-[#e3f0e7] text-[#1d462b]" : product.status === "rejected" ? "bg-[#f5e4e2] text-[#8b3a2f]" : "bg-[#f1eee7] text-[#766641]"}`}>{product.status}</span>
                {product.status === "pending" && <p className="mt-1 max-w-56 text-xs text-[#788079]">Awaiting admin review</p>}
                {product.status === "rejected" && product.reviewReason && <p className="mt-1 max-w-64 text-xs leading-5 text-[#8b3a2f]">Reason: {product.reviewReason}</p>}
              </td>
              <td className="px-4 py-4">
                <div className="flex justify-end gap-2">
                  <button type="button" onClick={() => setPreviewProduct(product)} className="inline-flex size-8 items-center justify-center rounded-lg border border-[#d8ddd8] text-[#536057] transition-colors duration-300 hover:bg-[#edf0ec] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1d2c27]" aria-label={`View ${product.name}`} title="View product"><Eye aria-hidden="true" className="size-4" /></button>
                  <button type="button" onClick={() => startEdit(product)} className="inline-flex size-8 items-center justify-center rounded-lg border border-[#d8ddd8] text-[#536057] transition-colors duration-300 hover:bg-[#edf0ec] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#1d2c27]" aria-label={`Edit ${product.name}`} title="Edit product"><Pencil aria-hidden="true" className="size-4" /></button>
                  {pendingDeleteId === product._id ? (
                    <>
                      <button type="button" onClick={() => setPendingDeleteId(null)} className="button-sm rounded-lg border border-[#d8ddd8] px-2 py-1 text-[#536057]">Cancel</button>
                      <button type="button" disabled={deletingId === product._id} onClick={() => void deleteProduct(product._id)} className="button-sm rounded-lg bg-[#a94e42] px-2 py-1 text-white disabled:opacity-60">{deletingId === product._id ? "Deleting" : "Confirm"}</button>
                    </>
                  ) : (
                    <button type="button" onClick={() => setPendingDeleteId(product._id)} className="inline-flex size-8 items-center justify-center rounded-lg border border-[#ead8d5] text-[#a94e42] transition-colors duration-300 hover:bg-[#f8eeec] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#a94e42]" aria-label={`Delete ${product.name}`} title="Delete product"><Trash2 aria-hidden="true" className="size-4" /></button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {previewProduct ? (
        <section className="border-t border-[#e9ece8] bg-[#fafbf9] p-5" aria-live="polite">
          <div className="flex items-start justify-between gap-4">
            <div><p className="caption-3 uppercase tracking-[0.14em] text-[#788079]">Product details</p><h2 className="mt-1 text-lg font-semibold text-[#1d2c27]">{previewProduct.name}</h2></div>
            <button type="button" onClick={() => setPreviewProduct(null)} className="inline-flex size-8 items-center justify-center rounded-lg text-[#536057] hover:bg-[#edf0ec]" aria-label="Close product details"><X aria-hidden="true" className="size-4" /></button>
          </div>
          <p className="mt-3 max-w-2xl text-sm text-[#69736c]">{previewProduct.description}</p>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3"><div><dt className="text-[#788079]">Brand</dt><dd className="mt-1 font-medium text-[#1d2c27]">{previewProduct.brand}</dd></div><div><dt className="text-[#788079]">Category</dt><dd className="mt-1 font-medium text-[#1d2c27]">{previewProduct.categoryId}</dd></div><div><dt className="text-[#788079]">Season</dt><dd className="mt-1 font-medium text-[#1d2c27]">{previewProduct.details.season}</dd></div></dl>
        </section>
      ) : null}
      {editingProduct ? (
        <section className="border-t border-[#e9ece8] bg-[#fafbf9] p-5">
          <div className="flex items-start justify-between gap-4"><div><p className="caption-3 uppercase tracking-[0.14em] text-[#788079]">Edit product</p><h2 className="mt-1 text-lg font-semibold text-[#1d2c27]">{editingProduct.name}</h2></div><button type="button" onClick={() => setEditingProduct(null)} className="inline-flex size-8 items-center justify-center rounded-lg text-[#536057] hover:bg-[#edf0ec]" aria-label="Close product editor"><X aria-hidden="true" className="size-4" /></button></div>
          {editingProduct.status === "rejected" && <p className="mt-3 rounded-xl border border-[#ead8d5] bg-[#fff8f6] px-4 py-3 text-sm text-[#8b3a2f]">Admin feedback: {editingProduct.reviewReason || "Please review your product details before resubmitting."} Save your changes to send it for review again.</p>}
          <div className="mt-5 grid gap-4 sm:grid-cols-2"><label className="text-sm font-medium text-[#3f4942]">Product name<input value={editName} onChange={(event) => setEditName(event.target.value)} className="mt-2 h-10 w-full rounded-lg border border-[#d8ddd8] bg-white px-3 text-sm outline-none focus:border-[#1d2c27]" /></label><label className="text-sm font-medium text-[#3f4942]">Price<input min="0" step="0.01" type="number" value={editPrice} onChange={(event) => setEditPrice(event.target.value)} className="mt-2 h-10 w-full rounded-lg border border-[#d8ddd8] bg-white px-3 text-sm outline-none focus:border-[#1d2c27]" /></label><label className="text-sm font-medium text-[#3f4942]">Discount price<input min="0" step="0.01" type="number" value={editDiscountPrice} onChange={(event) => setEditDiscountPrice(event.target.value)} className="mt-2 h-10 w-full rounded-lg border border-[#d8ddd8] bg-white px-3 text-sm outline-none focus:border-[#1d2c27]" /></label><label className="text-sm font-medium text-[#3f4942] sm:col-span-2">Description<textarea value={editDescription} onChange={(event) => setEditDescription(event.target.value)} rows={3} className="mt-2 w-full rounded-lg border border-[#d8ddd8] bg-white px-3 py-2 text-sm outline-none focus:border-[#1d2c27]" /></label></div>
          <div className="mt-5 flex justify-end gap-3"><button type="button" onClick={() => setEditingProduct(null)} className="button-sm rounded-full border border-[#d8ddd8] px-3 py-2 text-[#536057]">Cancel</button><button type="button" disabled={isSaving || !editName.trim()} onClick={() => void saveEdit()} className="button-sm rounded-full bg-[#1d2c27] px-3 py-2 text-white disabled:opacity-60">{isSaving ? "Saving" : "Save changes"}</button></div>
        </section>
      ) : null}
    </div>
  );
}
