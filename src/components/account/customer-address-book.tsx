"use client";

import { useEffect, useState, type FormEvent } from "react";
import { AlertCircle, Check, MapPin, Pencil, Plus, Trash2, X } from "lucide-react";

import {
  getCustomerAddresses,
  removeCustomerAddress,
  saveCustomerAddress,
  updateCustomerAddress,
  type CustomerAddress,
  type CustomerAddressPayload,
} from "@/lib/api/customer/addresses";

const emptyAddress: CustomerAddressPayload = {
  fullName: "",
  phone: "",
  address: "",
  city: "",
  postalCode: "",
  note: "",
  isDefault: false,
};

const inputClass = "mt-1.5 h-11 w-full rounded-xl border border-[#d8ddd8] bg-white px-3 text-sm text-[#1d2c27] outline-none placeholder:text-[#9aa39c] focus:border-[#536057] focus:ring-2 focus:ring-[#e3e8e3]";

export function CustomerAddressBook({ customerId }: { customerId: string }) {
  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [form, setForm] = useState<CustomerAddressPayload>(emptyAddress);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    getCustomerAddresses(customerId)
      .then((items) => { if (active) setAddresses(items); })
      .catch((requestError) => {
        if (active) setError(requestError instanceof Error ? requestError.message : "Unable to load addresses.");
      })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, [customerId]);

  const resetForm = () => {
    setForm(emptyAddress);
    setEditingId(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSaving) return;
    setIsSaving(true);
    setError(null);
    setNotice(null);
    try {
      const saved = editingId
        ? await updateCustomerAddress(customerId, editingId, form)
        : await saveCustomerAddress(customerId, form);
      setAddresses((current) => {
        const updated = editingId
          ? current.map((address) => address._id === saved._id ? saved : address)
          : [...current, saved];
        const normalized = saved.isDefault
          ? updated.map((address) => address._id === saved._id ? saved : { ...address, isDefault: false })
          : updated;
        return normalized.sort((left, right) => Number(right.isDefault) - Number(left.isDefault));
      });
      setNotice(editingId ? "Address updated." : "Address saved.");
      resetForm();
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to save address.");
    } finally {
      setIsSaving(false);
    }
  };

  const startEditing = (address: CustomerAddress) => {
    setEditingId(address._id);
    setForm({
      fullName: address.fullName,
      phone: address.phone,
      address: address.address,
      city: address.city,
      postalCode: address.postalCode,
      note: address.note,
      isDefault: address.isDefault,
    });
    setNotice(null);
    setError(null);
  };

  const handleMakeDefault = async (address: CustomerAddress) => {
    setError(null);
    setNotice(null);
    try {
      const updated = await updateCustomerAddress(customerId, address._id, {
        fullName: address.fullName,
        phone: address.phone,
        address: address.address,
        city: address.city,
        postalCode: address.postalCode,
        note: address.note,
        isDefault: true,
      });
      setAddresses((current) => current
        .map((item) => item._id === updated._id ? updated : { ...item, isDefault: false })
        .sort((left, right) => Number(right.isDefault) - Number(left.isDefault)));
      setNotice("Default address updated.");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to update default address.");
    }
  };

  const handleRemove = async (address: CustomerAddress) => {
    setRemovingId(address._id);
    setError(null);
    setNotice(null);
    try {
      await removeCustomerAddress(customerId, address._id);
      setAddresses(await getCustomerAddresses(customerId));
      if (editingId === address._id) resetForm();
      setNotice("Address removed.");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to remove address.");
    } finally {
      setRemovingId(null);
    }
  };

  const updateField = (field: keyof CustomerAddressPayload, value: string | boolean) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  return (
    <section className="rounded-3xl border border-[#e1e4df] bg-[#f9faf8] p-6 sm:p-8">
      <p className="caption-3 uppercase tracking-[0.14em] text-[#788079]">Shipping</p>
      <h1 className="mt-2 text-3xl font-semibold tracking-[-0.045em] text-[#1d2c27]">Delivery addresses</h1>
      <p className="body-6 mt-2 text-[#69736c]">Save and manage the delivery addresses associated with your account.</p>

      {error ? <p role="alert" className="mt-5 flex items-start gap-2 rounded-xl border border-[#ead8d5] bg-[#fff8f6] px-4 py-3 text-sm text-[#98483e]"><AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />{error}</p> : null}
      {notice ? <p role="status" className="mt-5 flex items-start gap-2 rounded-xl border border-[#dce9df] bg-[#f3f8f4] px-4 py-3 text-sm text-[#1d462b]"><Check aria-hidden="true" className="mt-0.5 size-4 shrink-0" />{notice}</p> : null}

      <form onSubmit={handleSubmit} className="mt-6 rounded-2xl border border-[#e1e4df] bg-white p-5 sm:p-6">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold text-[#1d2c27]">{editingId ? "Edit address" : "Add an address"}</h2>
          {editingId ? <button type="button" onClick={resetForm} className="inline-flex items-center gap-1 text-sm text-[#69736c] hover:text-[#1d2c27]"><X aria-hidden="true" className="size-4" />Cancel edit</button> : null}
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <label className="text-xs font-medium text-[#536057]">Recipient name *<input required maxLength={120} autoComplete="name" value={form.fullName} onChange={(event) => updateField("fullName", event.target.value)} placeholder="Full name" className={inputClass} /></label>
          <label className="text-xs font-medium text-[#536057]">Phone number *<input required maxLength={40} autoComplete="tel" value={form.phone} onChange={(event) => updateField("phone", event.target.value)} placeholder="01XXXXXXXXX" className={inputClass} /></label>
          <label className="text-xs font-medium text-[#536057] sm:col-span-2">Street address *<input required maxLength={300} autoComplete="street-address" value={form.address} onChange={(event) => updateField("address", event.target.value)} placeholder="House, road, apartment, area" className={inputClass} /></label>
          <label className="text-xs font-medium text-[#536057]">City *<input required maxLength={100} autoComplete="address-level2" value={form.city} onChange={(event) => updateField("city", event.target.value)} placeholder="Dhaka" className={inputClass} /></label>
          <label className="text-xs font-medium text-[#536057]">Postal code<input maxLength={24} autoComplete="postal-code" value={form.postalCode} onChange={(event) => updateField("postalCode", event.target.value)} placeholder="1207" className={inputClass} /></label>
          <label className="text-xs font-medium text-[#536057] sm:col-span-2">Delivery note<textarea maxLength={500} value={form.note} onChange={(event) => updateField("note", event.target.value)} placeholder="Landmark or delivery instructions" rows={3} className="mt-1.5 w-full rounded-xl border border-[#d8ddd8] bg-white px-3 py-2.5 text-sm text-[#1d2c27] outline-none placeholder:text-[#9aa39c] focus:border-[#536057] focus:ring-2 focus:ring-[#e3e8e3]" /></label>
        </div>
        <label className="mt-4 inline-flex items-center gap-2 text-sm text-[#536057]"><input type="checkbox" checked={form.isDefault} onChange={(event) => updateField("isDefault", event.target.checked)} className="size-4 accent-[#1d2c27]" />Set as default address</label>
        <button type="submit" disabled={isSaving} className="button-sm mt-5 inline-flex items-center gap-2 rounded-full bg-[#1d2c27] px-4 py-2.5 text-white hover:bg-[#344a42] disabled:cursor-wait disabled:opacity-60">{editingId ? <Pencil aria-hidden="true" className="size-4" /> : <Plus aria-hidden="true" className="size-4" />}{isSaving ? "Saving…" : editingId ? "Update address" : "Save address"}</button>
      </form>

      <div className="mt-6 space-y-3">
        {isLoading ? <p className="rounded-2xl border border-[#e1e4df] bg-white px-5 py-8 text-center text-sm text-[#788079]">Loading addresses…</p> : addresses.length ? addresses.map((address) => (
          <article key={address._id} className="flex flex-col gap-4 rounded-2xl border border-[#e1e4df] bg-white p-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex min-w-0 gap-3"><span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-[#edf0ec] text-[#536057]"><MapPin aria-hidden="true" className="size-5" /></span><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h3 className="font-semibold text-[#1d2c27]">{address.fullName}</h3>{address.isDefault ? <span className="rounded-full bg-[#e7eee8] px-2.5 py-1 text-[11px] font-medium text-[#1d462b]">Default</span> : null}</div><p className="mt-1 text-sm text-[#536057]">{address.phone}</p><p className="mt-2 text-sm text-[#536057]">{address.address}, {address.city}{address.postalCode ? ` ${address.postalCode}` : ""}</p>{address.note ? <p className="mt-1 text-xs text-[#788079]">{address.note}</p> : null}</div></div>
            <div className="flex shrink-0 flex-wrap gap-2 sm:justify-end"><button type="button" onClick={() => startEditing(address)} className="inline-flex items-center gap-1.5 rounded-full border border-[#d8ddd8] px-3 py-1.5 text-xs font-medium text-[#536057] hover:bg-[#f5f7f4]"><Pencil aria-hidden="true" className="size-3.5" />Edit</button>{!address.isDefault ? <button type="button" onClick={() => void handleMakeDefault(address)} className="rounded-full border border-[#d8ddd8] px-3 py-1.5 text-xs font-medium text-[#536057] hover:bg-[#f5f7f4]">Make default</button> : null}<button type="button" disabled={removingId === address._id} onClick={() => void handleRemove(address)} className="inline-flex items-center gap-1.5 rounded-full border border-[#ead8d5] bg-[#fff8f6] px-3 py-1.5 text-xs font-medium text-[#98483e] hover:bg-[#f8eeec] disabled:opacity-60"><Trash2 aria-hidden="true" className="size-3.5" />{removingId === address._id ? "Removing…" : "Remove"}</button></div>
          </article>
        )) : <div className="rounded-2xl border border-dashed border-[#cbd2cc] bg-white px-5 py-10 text-center"><MapPin aria-hidden="true" className="mx-auto size-8 text-[#9aa39c]" /><p className="mt-3 text-sm font-medium text-[#1d2c27]">No saved addresses</p><p className="mt-1 text-sm text-[#788079]">Your saved delivery addresses will appear here.</p></div>}
      </div>
    </section>
  );
}
