"use client";

import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";
import { AlertCircle, Pencil, RefreshCw, Search, ShieldCheck, Trash2, UserRound, X } from "lucide-react";

import { getAdminUsers, removeAdminUser, updateAdminUser, type AdminUser, type AdminUserUpdate } from "@/lib/api/admin/users";

function formatCreatedAt(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function roleStyle(role: string) {
  if (role === "admin") return "bg-[#e9edf4] text-[#405a7b]";
  if (role === "seller") return "bg-[#f4efe3] text-[#806a37]";
  return "bg-[#edf0ec] text-[#536057]";
}

export function AdminUsersManagement({ adminId }: { adminId: string }) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [draft, setDraft] = useState<AdminUserUpdate>({ name: "", email: "", phone: "", image: "", role: "customer" });
  const [savingUserId, setSavingUserId] = useState<string | null>(null);
  const [removingUserId, setRemovingUserId] = useState<string | null>(null);
  const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);

  const fetchUsers = useCallback(() => getAdminUsers(adminId), [adminId]);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      setUsers(await fetchUsers());
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not load users.");
    } finally {
      setIsLoading(false);
    }
  }, [fetchUsers]);

  useEffect(() => {
    let active = true;
    fetchUsers()
      .then((result) => { if (active) setUsers(result); })
      .catch((requestError) => { if (active) setError(requestError instanceof Error ? requestError.message : "Could not load users."); })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, [fetchUsers]);

  const visibleUsers = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return users;
    return users.filter((user) => [user.name, user.email, user.phone, user.role].some((value) => value.toLowerCase().includes(normalized)));
  }, [query, users]);

  const startEdit = (user: AdminUser) => {
    setEditingUserId(user.id);
    setDraft({ name: user.name, email: user.email, phone: user.phone, image: user.image, role: user.role });
    setConfirmRemoveId(null);
    setError(null);
  };

  const saveUser = async (event: FormEvent<HTMLFormElement>, userId: string) => {
    event.preventDefault();
    setSavingUserId(userId);
    setError(null);
    try {
      const updated = await updateAdminUser(adminId, userId, draft);
      setUsers((current) => current.map((user) => user.id === userId ? updated : user));
      setEditingUserId(null);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not update user.");
    } finally {
      setSavingUserId(null);
    }
  };

  const confirmRemove = async (user: AdminUser) => {
    setRemovingUserId(user.id);
    setError(null);
    try {
      await removeAdminUser(adminId, user.id);
      setUsers((current) => current.filter((item) => item.id !== user.id));
      setConfirmRemoveId(null);
      if (editingUserId === user.id) setEditingUserId(null);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not remove user.");
    } finally {
      setRemovingUserId(null);
    }
  };

  return (
    <section id="users" aria-labelledby="admin-users-heading" className="scroll-mt-28 rounded-3xl border border-[#e1e4df] bg-[#f9faf8] p-5 sm:p-7">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div><p className="caption-3 uppercase tracking-[0.14em] text-[#788079]">Access management</p><h2 id="admin-users-heading" className="mt-2 text-xl font-semibold text-[#1d2c27]">Users</h2><p className="mt-1 text-sm text-[#788079]">Edit account details and roles, or remove an account.</p></div>
        <label className="relative w-full sm:max-w-xs"><span className="sr-only">Search users</span><Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#89918b]" /><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search name, email, role" className="h-10 w-full rounded-full border border-[#d8ddd8] bg-white pl-9 pr-4 text-sm outline-none focus:border-[#1d2c27]" /></label>
      </div>

      {error && <div role="alert" className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#e6d7d4] bg-[#fffaf9] px-4 py-3 text-sm text-[#8b3a2f]"><span className="flex items-center gap-2"><AlertCircle aria-hidden="true" className="size-4 shrink-0" />{error}</span>{!users.length && <button type="button" onClick={() => void loadUsers()} className="inline-flex items-center gap-1 font-medium underline underline-offset-2"><RefreshCw aria-hidden="true" className="size-3.5" />Retry</button>}</div>}

      {isLoading ? <div className="py-14 text-center text-sm text-[#788079]">Loading users…</div> : visibleUsers.length ? <div className="mt-5 space-y-3">
        {visibleUsers.map((user) => <article key={user.id} className="overflow-hidden rounded-2xl border border-[#e1e4df] bg-white">
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 sm:p-5">
            <div className="flex min-w-0 items-center gap-3">
              <span aria-hidden="true" className="flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#edf0ec] text-[#536057]">{user.image ? <span className="size-full bg-cover bg-center" style={{ backgroundImage: `url("${user.image}")` }} /> : <UserRound className="size-5" />}</span>
              <div className="min-w-0"><p className="truncate text-sm font-semibold text-[#1d2c27]">{user.name || "Unnamed user"}</p><p className="truncate text-xs text-[#788079]">{user.email}</p><p className="mt-1 text-xs text-[#788079]">{user.phone || "No phone number"} · Joined {formatCreatedAt(user.createdAt)}</p></div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className={`rounded-full px-2.5 py-1 text-xs font-medium capitalize ${roleStyle(user.role)}`}>{user.role}</span>
              {user.id === adminId ? <span className="inline-flex items-center gap-1 rounded-full bg-[#edf0ec] px-2.5 py-1 text-xs text-[#536057]"><ShieldCheck aria-hidden="true" className="size-3.5" />You</span> : null}
              <button type="button" onClick={() => editingUserId === user.id ? setEditingUserId(null) : startEdit(user)} className="inline-flex items-center gap-1.5 rounded-full border border-[#d8ddd8] px-3 py-2 text-xs font-medium text-[#1d2c27] transition hover:bg-[#edf0ec]"><Pencil aria-hidden="true" className="size-3.5" />Edit</button>
              {user.id !== adminId && <button type="button" onClick={() => { setConfirmRemoveId(confirmRemoveId === user.id ? null : user.id); setEditingUserId(null); setError(null); }} className="inline-flex items-center gap-1.5 rounded-full border border-[#ead8d5] px-3 py-2 text-xs font-medium text-[#9e3f33] transition hover:bg-[#fff5f3]"><Trash2 aria-hidden="true" className="size-3.5" />Remove</button>}
            </div>
          </div>

          {editingUserId === user.id && <form onSubmit={(event) => void saveUser(event, user.id)} className="border-t border-[#e9ece8] bg-[#fafbf9] p-4 sm:p-5">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <label className="text-xs font-medium text-[#536057]">Full name<input required minLength={2} maxLength={100} value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} className="mt-1.5 h-10 w-full rounded-lg border border-[#d8ddd8] bg-white px-3 text-sm text-[#1d2c27] outline-none focus:border-[#1d2c27]" /></label>
              <label className="text-xs font-medium text-[#536057]">Email<input required type="email" maxLength={254} value={draft.email} onChange={(event) => setDraft((current) => ({ ...current, email: event.target.value }))} className="mt-1.5 h-10 w-full rounded-lg border border-[#d8ddd8] bg-white px-3 text-sm text-[#1d2c27] outline-none focus:border-[#1d2c27]" /></label>
              <label className="text-xs font-medium text-[#536057]">Phone<input type="tel" maxLength={40} value={draft.phone} onChange={(event) => setDraft((current) => ({ ...current, phone: event.target.value }))} className="mt-1.5 h-10 w-full rounded-lg border border-[#d8ddd8] bg-white px-3 text-sm text-[#1d2c27] outline-none focus:border-[#1d2c27]" /></label>
              <label className="text-xs font-medium text-[#536057]">Profile image URL<input type="url" maxLength={2000} value={draft.image} onChange={(event) => setDraft((current) => ({ ...current, image: event.target.value }))} placeholder="https://…" className="mt-1.5 h-10 w-full rounded-lg border border-[#d8ddd8] bg-white px-3 text-sm text-[#1d2c27] outline-none focus:border-[#1d2c27]" /></label>
              <label className="text-xs font-medium text-[#536057]">Role<select value={draft.role} onChange={(event) => setDraft((current) => ({ ...current, role: event.target.value as AdminUserUpdate["role"] }))} className="mt-1.5 h-10 w-full rounded-lg border border-[#d8ddd8] bg-white px-3 text-sm capitalize text-[#1d2c27] outline-none focus:border-[#1d2c27]"><option value="customer">Customer</option><option value="seller">Seller</option><option value="admin">Admin</option></select></label>
            </div>
            {draft.email.trim().toLowerCase() !== user.email.toLowerCase() && <p className="mt-3 text-xs text-[#806a37]">Changing the email will mark it unverified until the user verifies the new address.</p>}
            <div className="mt-4 flex justify-end gap-2"><button type="button" onClick={() => setEditingUserId(null)} className="inline-flex items-center gap-1 rounded-full border border-[#d8ddd8] px-3 py-2 text-xs font-medium text-[#536057]"><X aria-hidden="true" className="size-3.5" />Cancel</button><button type="submit" disabled={savingUserId === user.id} className="rounded-full bg-[#1d2c27] px-4 py-2 text-xs font-medium text-white disabled:opacity-50">{savingUserId === user.id ? "Saving…" : "Save user"}</button></div>
          </form>}

          {confirmRemoveId === user.id && <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#ead8d5] bg-[#fff8f6] p-4"><p className="text-sm text-[#775f59]">Remove <span className="font-semibold">{user.name || user.email}</span>? Their sign-in access and saved profile data will be removed. Order history will be kept.</p><div className="flex gap-2"><button type="button" onClick={() => setConfirmRemoveId(null)} className="rounded-full border border-[#d8ddd8] bg-white px-3 py-2 text-xs font-medium text-[#536057]">Cancel</button><button type="button" disabled={removingUserId === user.id} onClick={() => void confirmRemove(user)} className="rounded-full bg-[#a94e42] px-3 py-2 text-xs font-medium text-white disabled:opacity-50">{removingUserId === user.id ? "Removing…" : "Confirm remove"}</button></div></div>}
        </article>)}
      </div> : <div className="mt-5 rounded-2xl border border-dashed border-[#cbd2cc] bg-white px-5 py-10 text-center"><UserRound aria-hidden="true" className="mx-auto size-7 text-[#9aa39c]" /><p className="mt-3 text-sm font-medium text-[#1d2c27]">{users.length ? "No users match this search" : "No user accounts found"}</p><p className="mt-1 text-sm text-[#788079]">{users.length ? "Try another name, email, phone, or role." : "Accounts will appear here after they are created."}</p></div>}
    </section>
  );
}
