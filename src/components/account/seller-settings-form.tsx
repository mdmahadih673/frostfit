"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

const inputClassName =
  "mt-2 h-11 w-full rounded-xl border border-[#d9ded8] bg-white px-3 text-sm text-[#1d2c27] outline-none transition focus:border-[#536b5e] focus:ring-2 focus:ring-[#536b5e]/15 placeholder:text-[#9aa39c]";

export function SellerSettingsForm() {
  const [storeName, setStoreName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [description, setDescription] = useState("");
  const [preview, setPreview] = useState<string | null>(null);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const settings = { storeName, contactEmail, description };
    console.log("Seller store settings preview:", settings);
    setPreview(JSON.stringify(settings, null, 2));
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="text-sm font-medium text-[#3f4942]">Store name</span>
          <input
            required
            value={storeName}
            onChange={(event) => setStoreName(event.target.value)}
            placeholder="Your store name"
            className={inputClassName}
          />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-[#3f4942]">Contact email</span>
          <input
            required
            type="email"
            value={contactEmail}
            onChange={(event) => setContactEmail(event.target.value)}
            placeholder="Your business email"
            className={inputClassName}
          />
        </label>
        <label className="block sm:col-span-2">
          <span className="text-sm font-medium text-[#3f4942]">Store description</span>
          <textarea
            rows={4}
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            placeholder="Tell customers about your store…"
            className="mt-2 w-full resize-none rounded-xl border border-[#d9ded8] bg-white px-3 py-3 text-sm text-[#1d2c27] outline-none transition focus:border-[#536b5e] focus:ring-2 focus:ring-[#536b5e]/15 placeholder:text-[#9aa39c]"
          />
        </label>
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t border-[#e6e8e4] pt-5">
        <Link href="/profile" className="inline-flex items-center gap-1 text-sm font-medium text-[#1d2c27] hover:underline">
          Manage account profile <ArrowUpRight aria-hidden="true" className="size-4" />
        </Link>
        <button
          type="submit"
          className="h-10 rounded-full bg-[#1d2c27] px-5 text-sm font-medium text-white transition-colors hover:bg-[#344a42] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#536b5e]"
        >
          Preview settings
        </button>
      </div>

      {preview ? (
        <pre
          aria-live="polite"
          className="mt-5 overflow-x-auto rounded-xl bg-[#edf0ec] p-4 text-xs leading-5 text-[#3f4942]"
        >
          {preview}
        </pre>
      ) : null}
    </form>
  );
}
