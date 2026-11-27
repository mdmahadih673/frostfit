"use client";

import { useRef, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { CircleAlert, ImagePlus, Plus, Trash2 } from "lucide-react";

import { createSellerProduct, type SellerProductPayload } from "@/lib/api/product/create-seller-product";

type ProductVariantDraft = {
  id: number;
  size: string;
  color: string;
  stock: string;
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium text-[#3f4942]">{label}</span>
      {children}
    </label>
  );
}

const fieldClassName =
  "mt-2 h-11 w-full rounded-xl border border-[#d8ddd8] bg-white px-3 text-sm text-[#26332c] outline-none transition-colors placeholder:text-[#9aa39c] focus:border-[#1d2c27] focus:ring-2 focus:ring-[#1d2c27]/10";

export function SellerAddProductForm({ sellerId }: { sellerId: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [brand, setBrand] = useState("");
  const [sku, setSku] = useState("");
  const [thumbnail, setThumbnail] = useState("");
  const [galleryText, setGalleryText] = useState("");
  const [price, setPrice] = useState("");
  const [discountPrice, setDiscountPrice] = useState("");
  const [variants, setVariants] = useState<ProductVariantDraft[]>([{ id: 0, size: "", color: "", stock: "0" }]);
  const [material, setMaterial] = useState("");
  const [gender, setGender] = useState("Unisex");
  const [season, setSeason] = useState("Winter");
  const [weight, setWeight] = useState("");
  const [freeShipping, setFreeShipping] = useState(false);
  const [deliveryCharge, setDeliveryCharge] = useState("80");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const nextVariantId = useRef(1);

  function updateVariant(id: number, field: "size" | "color" | "stock", value: string) {
    setVariants((current) => current.map((variant) => (variant.id === id ? { ...variant, [field]: value } : variant)));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const combinationKeys = variants.map(
      ({ size, color }) => `${size.trim().toLowerCase()}::${color.trim().toLowerCase()}`,
    );
    if (new Set(combinationKeys).size !== combinationKeys.length) {
      setSubmitError("Each size and color combination must be unique. You can repeat a size or color with a different pair.");
      return;
    }

    const now = new Date().toISOString();
    const productPayload: SellerProductPayload = {
      sellerId,
      name: name.trim(),
      slug: slugify(slug),
      description: description.trim(),
      categoryId: categoryId.trim(),
      brand: brand.trim(),
      sku: sku.trim(),
      images: {
        thumbnail: thumbnail.trim(),
        gallery: galleryText.split(/\r?\n/).map((image) => image.trim()).filter(Boolean),
      },
      pricing: {
        price: Number(price),
        discountPrice: Number(discountPrice || 0),
      },
      variants: variants.map(({ size, color, stock }) => ({
        size: size.trim(),
        color: color.trim(),
        stock: Number(stock),
      })),
      details: {
        material: material.trim(),
        gender,
        season,
        weight: Number(weight),
      },
      shipping: {
        freeShipping,
        deliveryCharge: freeShipping ? 0 : Number(deliveryCharge),
      },
      status: "pending",
      createdAt: now,
      updatedAt: now,
    };

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      await createSellerProduct(productPayload);
      router.push("/dashboard/products?created=1");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to create product.";
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-start gap-2 rounded-xl bg-[#f4f1e8] px-4 py-3 text-sm text-[#766641]">
        <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
        <p>Products are submitted for review and saved with pending status.</p>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.4fr)_minmax(260px,0.6fr)]">
        <div className="space-y-5">
          <section className="rounded-3xl border border-[#e1e4df] bg-[#f9faf8] p-5 sm:p-7">
            <h2 className="text-lg font-semibold text-[#1d2c27]">Product information</h2>
            <p className="mt-1 text-sm text-[#788079]">Add the details customers need to make a decision.</p>
            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <Field label="Product name">
                  <input
                    required
                    value={name}
                    onChange={(event) => {
                      setName(event.target.value);
                      setSlug(slugify(event.target.value));
                    }}
                    placeholder="e.g. Premium Winter Hoodie"
                    className={fieldClassName}
                  />
                </Field>
              </div>
              <Field label="Slug">
                <input required value={slug} onChange={(event) => setSlug(event.target.value)} placeholder="premium-winter-hoodie" className={fieldClassName} />
              </Field>
              <Field label="Category ID">
                <input required value={categoryId} onChange={(event) => setCategoryId(event.target.value)} placeholder="CATEGORY_ID" className={fieldClassName} />
              </Field>
              <Field label="Brand">
                <input required value={brand} onChange={(event) => setBrand(event.target.value)} placeholder="FrostFit" className={fieldClassName} />
              </Field>
              <Field label="SKU">
                <input value={sku} onChange={(event) => setSku(event.target.value)} placeholder="FF-HOOD-001" className={fieldClassName} />
              </Field>
              <Field label="Price">
                <input required min="0" step="0.01" type="number" value={price} onChange={(event) => setPrice(event.target.value)} placeholder="2500" className={fieldClassName} />
              </Field>
              <Field label="Discount price">
                <input min="0" step="0.01" type="number" value={discountPrice} onChange={(event) => setDiscountPrice(event.target.value)} placeholder="1999" className={fieldClassName} />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Description">
                  <textarea
                    required
                    rows={4}
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="Describe the materials, fit, and features…"
                    className="mt-2 w-full resize-y rounded-xl border border-[#d8ddd8] bg-white px-3 py-3 text-sm text-[#26332c] outline-none transition-colors placeholder:text-[#9aa39c] focus:border-[#1d2c27] focus:ring-2 focus:ring-[#1d2c27]/10"
                  />
                </Field>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-[#e1e4df] bg-[#f9faf8] p-5 sm:p-7">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-[#1d2c27]">Variants and stock</h2>
                <p className="mt-1 max-w-2xl text-sm text-[#788079]">Add each size and color combination with its own stock. You can repeat a size in different colors, or a color in different sizes.</p>
              </div>
              <button
                type="button"
                onClick={() => setVariants((current) => [...current, { id: nextVariantId.current++, size: "", color: "", stock: "0" }])}
                className="inline-flex h-9 items-center gap-1.5 rounded-full border border-[#cbd2cc] px-3 text-sm font-medium text-[#1d2c27] transition-colors hover:bg-[#edf0ec]"
              >
                <Plus aria-hidden="true" className="size-4" /> Add size and color
              </button>
            </div>
            <div className="mt-5 space-y-3">
              {variants.map((variant, index) => (
                <div key={variant.id} className="grid gap-3 rounded-2xl border border-[#e6e8e4] bg-white p-4 sm:grid-cols-[1fr_1fr_120px_auto]">
                  <Field label={`Size ${index + 1}`}>
                    <input required value={variant.size} onChange={(event) => updateVariant(variant.id, "size", event.target.value)} placeholder="M, L, XL" className={fieldClassName} />
                  </Field>
                  <Field label="Color">
                    <input required value={variant.color} onChange={(event) => updateVariant(variant.id, "color", event.target.value)} placeholder="Black, Navy" className={fieldClassName} />
                  </Field>
                  <Field label="Stock">
                    <input required min="0" step="1" type="number" value={variant.stock} onChange={(event) => updateVariant(variant.id, "stock", event.target.value)} className={fieldClassName} />
                  </Field>
                  <button
                    type="button"
                    disabled={variants.length === 1}
                    onClick={() => setVariants((current) => current.filter((entry) => entry.id !== variant.id))}
                    aria-label={`Remove size and color combination ${index + 1}`}
                    className="mt-auto flex size-11 items-center justify-center rounded-xl text-[#8b554e] transition-colors hover:bg-[#f8eeec] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Trash2 aria-hidden="true" className="size-4" />
                  </button>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-3xl border border-[#e1e4df] bg-[#f9faf8] p-5 sm:p-7">
            <h2 className="text-lg font-semibold text-[#1d2c27]">Product details</h2>
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <Field label="Material">
                <input required value={material} onChange={(event) => setMaterial(event.target.value)} placeholder="Fleece" className={fieldClassName} />
              </Field>
              <Field label="Gender">
                <select value={gender} onChange={(event) => setGender(event.target.value)} className={fieldClassName}>
                  <option>Unisex</option><option>Men</option><option>Women</option><option>Kids</option>
                </select>
              </Field>
              <Field label="Season">
                <select value={season} onChange={(event) => setSeason(event.target.value)} className={fieldClassName}>
                  <option>Winter</option><option>Autumn</option><option>Spring</option><option>Summer</option><option>All season</option>
                </select>
              </Field>
              <Field label="Weight (kg)">
                <input required min="0" step="0.01" type="number" value={weight} onChange={(event) => setWeight(event.target.value)} placeholder="0.5" className={fieldClassName} />
              </Field>
            </div>
          </section>
        </div>

        <aside className="space-y-5">
          <section className="rounded-3xl border border-[#e1e4df] bg-[#f9faf8] p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-[#1d2c27]">Product images</h2>
            <div className="mt-5 space-y-4">
              <Field label="Thumbnail image URL">
                <input required type="url" value={thumbnail} onChange={(event) => setThumbnail(event.target.value)} placeholder="https://example.com/image.jpg" className={fieldClassName} />
              </Field>
              <Field label="Gallery image URLs">
                <textarea
                  rows={4}
                  value={galleryText}
                  onChange={(event) => setGalleryText(event.target.value)}
                  placeholder={"One image URL per line"}
                  className="mt-2 w-full resize-y rounded-xl border border-[#d8ddd8] bg-white px-3 py-3 text-sm text-[#26332c] outline-none transition-colors placeholder:text-[#9aa39c] focus:border-[#1d2c27] focus:ring-2 focus:ring-[#1d2c27]/10"
                />
              </Field>
            </div>
            <div className="mt-4 flex items-start gap-2 rounded-xl bg-[#edf0ec] px-3 py-2.5 text-xs leading-5 text-[#69736c]">
              <ImagePlus aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
              Use public image URLs; file uploads are not connected yet.
            </div>
          </section>

          <section className="rounded-3xl border border-[#e1e4df] bg-[#f9faf8] p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-[#1d2c27]">Shipping</h2>
            <label className="mt-4 flex items-center gap-3 rounded-xl border border-[#e1e4df] bg-white p-3 text-sm text-[#3f4942]">
              <input type="checkbox" checked={freeShipping} onChange={(event) => setFreeShipping(event.target.checked)} className="size-4 accent-[#1d2c27]" />
              Offer free shipping
            </label>
            <Field label="Delivery charge">
              <input
                required={!freeShipping}
                min="0"
                step="0.01"
                type="number"
                value={freeShipping ? "0" : deliveryCharge}
                onChange={(event) => setDeliveryCharge(event.target.value)}
                disabled={freeShipping}
                className={`${fieldClassName} disabled:bg-[#edf0ec] disabled:text-[#89918b]`}
              />
            </Field>
          </section>

          <section className="rounded-3xl border border-[#e1e4df] bg-[#f9faf8] p-5 sm:p-6">
            <h2 className="text-sm font-semibold text-[#1d2c27]">Submission status</h2>
            <p className="mt-2 text-sm text-[#69736c]">New product payloads use the <span className="font-medium">pending</span> status.</p>
            <p className="mt-3 text-xs text-[#89918b]">Seller ID is taken from your signed-in account.</p>
          </section>
        </aside>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#e1e4df] bg-[#f9faf8] p-4 sm:px-6">
        <p className="text-sm text-[#788079]">Your seller ID and pending status are set securely by the server.</p>
        <button type="submit" disabled={isSubmitting} className="h-11 rounded-full bg-[#1d2c27] px-6 text-sm font-medium text-white transition-colors hover:bg-[#344a42] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#1d2c27] disabled:cursor-wait disabled:opacity-60">
          {isSubmitting ? "Creating product…" : "Create product"}
        </button>
      </div>

      {submitError ? (
        <p role="alert" className="rounded-xl border border-[#e4c3bf] bg-[#fbf2f1] px-4 py-3 text-sm text-[#8b3e36]">
          {submitError}
        </p>
      ) : null}

    </form>
  );
}
