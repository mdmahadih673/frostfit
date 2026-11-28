"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Banknote,
  CreditCard,
  Lock,
  MapPin,
  PackageOpen,
  RefreshCw,
  ShieldCheck,
  Smartphone,
} from "lucide-react";

import {
  placeCustomerOrder,
  type PaymentMethod,
} from "@/lib/api/customer/orders";
import {
  getSavedItems,
  type SavedOrderItem,
} from "@/lib/api/customer/saved-items";
import { getCustomerAddresses } from "@/lib/api/customer/addresses";

type CustomerCheckoutProps = {
  customerId: string;
  defaultName: string;
  defaultEmail: string;
};

const paymentOptions: Array<{
  id: PaymentMethod;
  title: string;
  description: string;
  icon: typeof Banknote;
}> = [
  {
    id: "cod",
    title: "Cash on Delivery",
    description: "Pay in cash when your FrostFit parcel arrives.",
    icon: Banknote,
  },
  {
    id: "bkash",
    title: "bKash",
    description: "Fast mobile wallet payment via bKash.",
    icon: Smartphone,
  },
  {
    id: "nagad",
    title: "Nagad",
    description: "Instant mobile payment with your Nagad account.",
    icon: Smartphone,
  },
  {
    id: "card",
    title: "Credit / Debit Card",
    description: "Pay securely using Visa, Mastercard, or Amex.",
    icon: CreditCard,
  },
];

function formatPrice(value: number) {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function CustomerCheckout({
  customerId,
  defaultName,
  defaultEmail,
}: CustomerCheckoutProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const itemsParam = searchParams.get("items") ?? "";

  const requestedIds = useMemo(
    () =>
      itemsParam
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean),
    [itemsParam],
  );

  const [savedItems, setSavedItems] = useState<SavedOrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [fullName, setFullName] = useState(defaultName);
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [note, setNote] = useState("");
  const addressWasEdited = useRef(false);
  const [hasPrefilledAddress, setHasPrefilledAddress] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const fetchItems = async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      setSavedItems(await getSavedItems(customerId));
    } catch (requestError) {
      setLoadError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to load selected items.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let isCurrent = true;

    getSavedItems(customerId)
      .then((items) => {
        if (isCurrent) setSavedItems(items);
      })
      .catch((requestError) => {
        if (isCurrent) {
          setLoadError(
            requestError instanceof Error
              ? requestError.message
              : "Unable to load selected items.",
          );
        }
      })
      .finally(() => {
        if (isCurrent) setIsLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [customerId]);

  useEffect(() => {
    let isCurrent = true;
    getCustomerAddresses(customerId)
      .then((addresses) => {
        if (!isCurrent || addressWasEdited.current) return;
        const savedAddress = addresses.find((item) => item.isDefault) ?? addresses[0];
        if (!savedAddress) return;
        setFullName(savedAddress.fullName);
        setPhone(savedAddress.phone);
        setAddress(savedAddress.address);
        setCity(savedAddress.city);
        setPostalCode(savedAddress.postalCode);
        setNote(savedAddress.note);
        setHasPrefilledAddress(true);
      })
      .catch(() => {
        // Checkout can still proceed with the customer-entered address.
      });
    return () => { isCurrent = false; };
  }, [customerId]);

  const checkoutItems = useMemo(() => {
    if (!requestedIds.length) return savedItems;
    const requestedSet = new Set(requestedIds);
    return savedItems.filter((item) => requestedSet.has(item._id));
  }, [savedItems, requestedIds]);

  const subtotal = useMemo(
    () =>
      checkoutItems.reduce(
        (sum, item) => sum + item.unitPrice * item.quantity,
        0,
      ),
    [checkoutItems],
  );

  const totalUnits = useMemo(
    () => checkoutItems.reduce((sum, item) => sum + item.quantity, 0),
    [checkoutItems],
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!checkoutItems.length || isSubmitting) return;

    setSubmitError(null);

    if (!fullName.trim() || !phone.trim() || !address.trim() || !city.trim()) {
      setSubmitError(
        "Please fill in your full name, phone number, street address, and city.",
      );
      return;
    }

    setIsSubmitting(true);

    try {
      await placeCustomerOrder(customerId, {
        savedItemIds: checkoutItems.map((item) => item._id),
        shippingAddress: {
          fullName: fullName.trim(),
          email: defaultEmail,
          phone: phone.trim(),
          address: address.trim(),
          city: city.trim(),
          postalCode: postalCode.trim(),
          note: note.trim(),
        },
        paymentMethod,
      });

      router.push("/dashboard?tab=orders&ordered=1");
    } catch (requestError) {
      setSubmitError(
        requestError instanceof Error
          ? requestError.message
          : "Could not place order. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <p className="body-6 py-16 text-center text-[#6f746e]">
        Loading checkout details…
      </p>
    );
  }

  if (loadError) {
    return (
      <div className="my-10 rounded-3xl border border-[#e6d7d4] bg-[#fffaf9] px-5 py-12 text-center">
        <AlertCircle aria-hidden="true" className="mx-auto size-7 text-[#a94e42]" />
        <p className="mt-3 text-sm font-medium text-[#5f2e28]">
          Could not load checkout items
        </p>
        <p className="mt-1 text-sm text-[#8b5a52]">{loadError}</p>
        <button
          type="button"
          onClick={fetchItems}
          className="button-sm mt-5 inline-flex items-center gap-2 rounded-full bg-[#1d2c27] px-4 py-2 text-white transition hover:bg-[#344a42]"
        >
          <RefreshCw aria-hidden="true" className="size-4" />
          Try again
        </button>
      </div>
    );
  }

  if (!checkoutItems.length) {
    return (
      <div className="my-10 rounded-3xl border border-dashed border-[#cbd2cc] bg-white px-5 py-16 text-center">
        <PackageOpen aria-hidden="true" className="mx-auto size-9 text-[#9aa39c]" />
        <h1 className="title-3 mt-4 text-[#1d2c27]">No items selected</h1>
        <p className="body-6 mt-2 text-[#69736c]">
          Select one or more items from your Saved items table to proceed to
          checkout.
        </p>
        <Link
          href="/dashboard?tab=saved"
          className="button-sm mt-6 inline-flex items-center gap-2 rounded-full bg-[#1d2c27] px-5 py-2.5 text-white transition hover:bg-[#344a42]"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          Back to Saved items
        </Link>
      </div>
    );
  }

  return (
    <div className="py-6 sm:py-10">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <Link
            href="/dashboard?tab=saved"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-[#1d2c27] hover:underline"
          >
            <ArrowLeft aria-hidden="true" className="size-3.5" />
            Back to Saved items
          </Link>
          <h1 className="mt-3 text-3xl font-semibold tracking-[-0.05em] text-[#151515] sm:text-4xl">
            Checkout &amp; Order
          </h1>
          <p className="body-6 mt-1.5 text-[#626761]">
            Complete your delivery address and choose a payment option for{" "}
            {totalUnits} item{totalUnits > 1 ? "s" : ""}.
          </p>
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full border border-[#d6dbd5] bg-white px-3.5 py-1.5 text-xs font-medium text-[#536057]">
          <Lock aria-hidden="true" className="size-3.5 text-[#1d2c27]" />
          {defaultEmail}
        </span>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid gap-8 lg:grid-cols-12 lg:items-start"
      >
        {/* Left: Shipping Address + Payment Method */}
        <div className="space-y-6 lg:col-span-7">
          <section className="rounded-3xl border border-[#e1e4df] bg-white p-6 sm:p-8">
            <div className="flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-xl bg-[#edf0ec] text-[#1d2c27]">
                <MapPin aria-hidden="true" className="size-4" />
              </span>
              <div>
                <h2 className="text-lg font-semibold tracking-[-0.03em] text-[#1d2c27]">
                  Delivery address
                </h2>
                <p className="text-xs text-[#6f746e]">
                  Where should we deliver your order?
                </p>
                {hasPrefilledAddress ? <p className="mt-1 text-xs text-[#1d462b]">Default saved address loaded. You can edit any field before ordering.</p> : null}
              </div>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="checkout-full-name"
                  className="caption-3 block text-[#3f413e]"
                >
                  Full name *
                </label>
                <input
                  id="checkout-full-name"
                  type="text"
                  required
                  value={fullName}
                  onChange={(event) => { addressWasEdited.current = true; setFullName(event.target.value); }}
                  placeholder="Enter recipient name"
                  className="mt-1.5 h-11 w-full rounded-xl border border-[#d6dbd5] bg-[#f9f9f7] px-3.5 text-sm text-[#151515] focus:border-[#1d2c27] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="checkout-phone"
                  className="caption-3 block text-[#3f413e]"
                >
                  Phone number *
                </label>
                <input
                  id="checkout-phone"
                  type="tel"
                  required
                  value={phone}
                  onChange={(event) => { addressWasEdited.current = true; setPhone(event.target.value); }}
                  placeholder="e.g. 017XXXXXXXX"
                  className="mt-1.5 h-11 w-full rounded-xl border border-[#d6dbd5] bg-[#f9f9f7] px-3.5 text-sm text-[#151515] focus:border-[#1d2c27] focus:bg-white focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="checkout-address"
                  className="caption-3 block text-[#3f413e]"
                >
                  Street address *
                </label>
                <input
                  id="checkout-address"
                  type="text"
                  required
                  value={address}
                  onChange={(event) => { addressWasEdited.current = true; setAddress(event.target.value); }}
                  placeholder="House, road, apartment, area"
                  className="mt-1.5 h-11 w-full rounded-xl border border-[#d6dbd5] bg-[#f9f9f7] px-3.5 text-sm text-[#151515] focus:border-[#1d2c27] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="checkout-city"
                  className="caption-3 block text-[#3f413e]"
                >
                  City / District *
                </label>
                <input
                  id="checkout-city"
                  type="text"
                  required
                  value={city}
                  onChange={(event) => { addressWasEdited.current = true; setCity(event.target.value); }}
                  placeholder="e.g. Dhaka"
                  className="mt-1.5 h-11 w-full rounded-xl border border-[#d6dbd5] bg-[#f9f9f7] px-3.5 text-sm text-[#151515] focus:border-[#1d2c27] focus:bg-white focus:outline-none"
                />
              </div>

              <div>
                <label
                  htmlFor="checkout-postal"
                  className="caption-3 block text-[#3f413e]"
                >
                  Postal code
                </label>
                <input
                  id="checkout-postal"
                  type="text"
                  value={postalCode}
                  onChange={(event) => { addressWasEdited.current = true; setPostalCode(event.target.value); }}
                  placeholder="e.g. 1212"
                  className="mt-1.5 h-11 w-full rounded-xl border border-[#d6dbd5] bg-[#f9f9f7] px-3.5 text-sm text-[#151515] focus:border-[#1d2c27] focus:bg-white focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="checkout-note"
                  className="caption-3 block text-[#3f413e]"
                >
                  Delivery note (optional)
                </label>
                <textarea
                  id="checkout-note"
                  rows={2}
                  value={note}
                  onChange={(event) => { addressWasEdited.current = true; setNote(event.target.value); }}
                  placeholder="Any special delivery instructions..."
                  className="mt-1.5 w-full rounded-xl border border-[#d6dbd5] bg-[#f9f9f7] p-3.5 text-sm text-[#151515] focus:border-[#1d2c27] focus:bg-white focus:outline-none"
                />
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-[#e1e4df] bg-white p-6 sm:p-8">
            <div className="flex items-center gap-2.5">
              <span className="flex size-9 items-center justify-center rounded-xl bg-[#edf0ec] text-[#1d2c27]">
                <CreditCard aria-hidden="true" className="size-4" />
              </span>
              <div>
                <h2 className="text-lg font-semibold tracking-[-0.03em] text-[#1d2c27]">
                  Payment option
                </h2>
                <p className="text-xs text-[#6f746e]">
                  Choose how you would like to pay.
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {paymentOptions.map(({ id, title, description, icon: Icon }) => {
                const isSelected = paymentMethod === id;
                return (
                  <label
                    key={id}
                    className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 transition ${
                      isSelected
                        ? "border-[#1d2c27] bg-[#f4f7f5] ring-1 ring-[#1d2c27]"
                        : "border-[#e1e4df] bg-[#f9f9f7] hover:border-[#b7bfb9]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={id}
                      checked={isSelected}
                      onChange={() => setPaymentMethod(id)}
                      className="mt-1 size-4 accent-[#1d2c27]"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <Icon
                          aria-hidden="true"
                          className="size-4 shrink-0 text-[#1d2c27]"
                        />
                        <span className="text-sm font-semibold text-[#1d2c27]">
                          {title}
                        </span>
                      </div>
                      <p className="mt-1 text-xs leading-relaxed text-[#6f746e]">
                        {description}
                      </p>
                    </div>
                  </label>
                );
              })}
            </div>
          </section>
        </div>

        {/* Right: Order Summary */}
        <aside className="rounded-3xl border border-[#e1e4df] bg-white p-6 sm:p-8 lg:sticky lg:top-28 lg:col-span-5">
          <h2 className="text-lg font-semibold tracking-[-0.03em] text-[#1d2c27]">
            Order summary
          </h2>
          <p className="mt-1 text-xs text-[#6f746e]">
            {checkoutItems.length} product{checkoutItems.length > 1 ? "s" : ""}{" "}
            ({totalUnits} unit{totalUnits > 1 ? "s" : ""})
          </p>

          <div className="mt-5 max-h-80 space-y-3 overflow-y-auto pr-1">
            {checkoutItems.map((item) => (
              <div
                key={item._id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-[#eef0ec] bg-[#f9faf8] p-3"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="size-12 shrink-0 overflow-hidden rounded-lg bg-[#edf0ec]">
                    {item.thumbnail ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={item.thumbnail}
                        alt={item.name}
                        className="h-full w-full object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[#1d2c27]">
                      {item.name}
                    </p>
                    <p className="text-xs text-[#6f746e]">
                      {item.size || "—"} / {item.color || "—"} × {item.quantity}
                    </p>
                  </div>
                </div>
                <span className="shrink-0 text-sm font-semibold text-[#1d2c27]">
                  {formatPrice(item.unitPrice * item.quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-6 space-y-2.5 border-t border-[#eef0ec] pt-4 text-sm">
            <div className="flex items-center justify-between text-[#536057]">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between text-[#536057]">
              <span>Payment method</span>
              <span className="font-medium uppercase text-[#1d2c27]">
                {paymentMethod}
              </span>
            </div>
            <div className="flex items-center justify-between border-t border-[#eef0ec] pt-3 text-base font-semibold text-[#1d2c27]">
              <span>Total</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
          </div>

          {submitError && (
            <div className="mt-4 rounded-xl border border-[#e6d7d4] bg-[#fffaf9] px-3.5 py-2.5 text-xs text-[#8b3d33]">
              {submitError}
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="button-sm mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[#1d2c27] px-6 text-white transition duration-300 hover:bg-[#344a42] active:scale-[0.99] disabled:cursor-not-allowed disabled:bg-[#9aa39c]"
          >
            <ShieldCheck aria-hidden="true" className="size-4" />
            {isSubmitting ? "Placing order…" : "Confirm & Place Order"}
          </button>
        </aside>
      </form>
    </div>
  );
}
