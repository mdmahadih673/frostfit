"use client";

import { useEffect, useState, type FormEvent } from "react";
import { AlertCircle, Check, LoaderCircle, Save, UserRound } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getCustomerProfile, updateCustomerProfile } from "@/lib/api/customer/profile";

type CustomerProfileFormProps = {
  customerId: string;
  initialName: string;
  email: string;
  initialImage: string;
  role: string;
  emailVerified: boolean;
};

const inputClass = "mt-1.5 h-11 w-full rounded-xl border border-[#d8ddd8] bg-white px-3 text-sm text-[#1d2c27] outline-none placeholder:text-[#9aa39c] focus:border-[#536057] focus:ring-2 focus:ring-[#e3e8e3]";

function getInitials(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase() || "U";
}

export function CustomerProfileForm({ customerId, initialName, email, initialImage, role, emailVerified }: CustomerProfileFormProps) {
  const [name, setName] = useState(initialName);
  const [phone, setPhone] = useState("");
  const [image, setImage] = useState(initialImage);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    let isCurrent = true;
    getCustomerProfile(customerId)
      .then((profile) => {
        if (!isCurrent) return;
        setName(profile.name || initialName);
        setPhone(profile.phone);
        setImage(profile.image);
      })
      .catch((requestError) => {
        if (isCurrent) setError(requestError instanceof Error ? requestError.message : "Unable to load profile.");
      })
      .finally(() => { if (isCurrent) setIsLoading(false); });
    return () => { isCurrent = false; };
  }, [customerId, initialName]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isSaving) return;
    setIsSaving(true);
    setError(null);
    setNotice(null);
    try {
      await updateCustomerProfile(customerId, { name: name.trim(), phone: phone.trim(), image: image.trim() });
      setNotice("Profile updated successfully.");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Unable to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="mx-auto max-w-4xl px-5 py-12 sm:px-10 sm:py-16">
      <p className="caption-3 uppercase tracking-[0.18em] text-[#6f746e]">Your account</p>
      <h1 className="mt-3 text-4xl font-semibold tracking-[-0.055em] sm:text-5xl">Profile</h1>

      <div className="mt-9 flex items-center gap-4 rounded-3xl border border-[#e1e1dc] bg-[#f9f9f7] p-6 sm:p-8">
        <Avatar size="lg" className="border border-[#d8d8d2]">
          {image ? <AvatarImage src={image} alt={name || "Profile photo"} /> : null}
          <AvatarFallback className="bg-[#1d2c27] font-medium text-white">{getInitials(name)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <h2 className="truncate text-xl font-semibold tracking-[-0.03em] text-[#1d2c27]">{name || initialName}</h2>
          <p className="body-6 mt-1 truncate text-[#626761]">{email}</p>
        </div>
      </div>

      {error ? <p role="alert" className="mt-5 flex items-start gap-2 rounded-xl border border-[#ead8d5] bg-[#fff8f6] px-4 py-3 text-sm text-[#98483e]"><AlertCircle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />{error}</p> : null}
      {notice ? <p role="status" className="mt-5 flex items-start gap-2 rounded-xl border border-[#dce9df] bg-[#f3f8f4] px-4 py-3 text-sm text-[#1d462b]"><Check aria-hidden="true" className="mt-0.5 size-4 shrink-0" />{notice}</p> : null}

      <form onSubmit={handleSubmit} className="mt-5 rounded-3xl border border-[#e1e1dc] bg-[#f9f9f7] p-6 sm:p-8">
        <div className="flex items-center gap-2"><UserRound aria-hidden="true" className="size-4 text-[#536057]" /><h2 className="text-lg font-semibold text-[#1d2c27]">Personal information</h2></div>
        {isLoading ? <p className="mt-5 flex items-center gap-2 text-sm text-[#788079]"><LoaderCircle aria-hidden="true" className="size-4 animate-spin" />Loading your saved profile…</p> : (
          <>
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="text-xs font-medium text-[#536057]">Full name *<input required minLength={2} maxLength={100} autoComplete="name" value={name} onChange={(event) => setName(event.target.value)} placeholder="Your full name" className={inputClass} /></label>
              <label className="text-xs font-medium text-[#536057]">Phone number *<input required maxLength={40} type="tel" autoComplete="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="01XXXXXXXXX" className={inputClass} /></label>
              <label className="text-xs font-medium text-[#536057] sm:col-span-2">Profile picture URL<input type="url" maxLength={2048} value={image} onChange={(event) => setImage(event.target.value)} placeholder="https://example.com/profile-photo.jpg" className={inputClass} /><span className="mt-1.5 block font-normal text-[#788079]">Paste a direct image URL. Leave empty to use your initials.</span></label>
              <label className="text-xs font-medium text-[#536057] sm:col-span-2">Email address<input readOnly value={email} className={`${inputClass} cursor-not-allowed bg-[#f0f1ee] text-[#788079]`} /><span className="mt-1.5 block font-normal text-[#788079]">Email changes require a separate verification step.</span></label>
            </div>
            <button type="submit" disabled={isSaving} className="button-sm mt-6 inline-flex items-center gap-2 rounded-full bg-[#1d2c27] px-5 py-2.5 text-sm font-medium text-white hover:bg-[#344a42] disabled:cursor-wait disabled:opacity-60"><Save aria-hidden="true" className="size-4" />{isSaving ? "Saving…" : "Save profile"}</button>
          </>
        )}
      </form>

      <dl className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="rounded-3xl border border-[#e1e1dc] bg-[#f9f9f7] p-6"><dt className="caption-3 uppercase tracking-[0.12em] text-[#6f746e]">Account type</dt><dd className="body-6 mt-2 font-medium text-[#1d2c27]">{role}</dd></div>
        <div className="rounded-3xl border border-[#e1e1dc] bg-[#f9f9f7] p-6"><dt className="caption-3 uppercase tracking-[0.12em] text-[#6f746e]">Email status</dt><dd className="body-6 mt-2 font-medium text-[#1d2c27]">{emailVerified ? "Verified" : "Not verified"}</dd></div>
      </dl>
    </section>
  );
}
