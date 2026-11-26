import Link from "next/link";
import { ArrowLeft, BarChart3, Boxes, CircleAlert, PackagePlus, ShoppingBag, WalletCards } from "lucide-react";

import { SellerAddProductForm } from "./seller-add-product-form";
import { SellerSettingsForm } from "./seller-settings-form";

function PageHeading({ eyebrow, title, description, action }: { eyebrow: string; title: string; description: string; action?: React.ReactNode }) {
  return (
    <header className="flex flex-wrap items-end justify-between gap-5">
      <div>
        <p className="caption-3 uppercase tracking-[0.14em] text-[#788079]">{eyebrow}</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.055em] text-[#1d2c27] sm:text-4xl">{title}</h1>
        <p className="body-6 mt-3 max-w-2xl text-pretty text-[#69736c]">{description}</p>
      </div>
      {action}
    </header>
  );
}

function PreviewNotice({ children = "This is a UI preview. Changes are not saved yet." }: { children?: string }) {
  return (
    <div className="flex items-start gap-2 rounded-xl bg-[#f4f1e8] px-4 py-3 text-sm text-[#766641]">
      <CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      <p>{children}</p>
    </div>
  );
}

function EmptyState({ icon: Icon, title, description, action }: { icon: typeof Boxes; title: string; description: string; action?: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-[#cbd2cc] bg-white px-5 py-12 text-center">
      <Icon aria-hidden="true" className="mx-auto size-8 text-[#9aa39c]" />
      <h2 className="mt-3 text-base font-semibold text-[#1d2c27]">{title}</h2>
      <p className="mx-auto mt-1 max-w-md text-sm text-[#788079]">{description}</p>
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function SellerAddProductPage({ sellerId }: { sellerId: string }) {
  return (
    <div className="space-y-7">
      <PageHeading
        eyebrow="Catalog"
        title="Add product"
        description="Create a product listing for your FrostFit store."
        action={
          <Link href="/dashboard/products" className="inline-flex items-center gap-2 text-sm font-medium text-[#526158] hover:text-[#1d2c27]">
            <ArrowLeft aria-hidden="true" className="size-4" />
            My products
          </Link>
        }
      />
      <SellerAddProductForm sellerId={sellerId} />
    </div>
  );
}

export function SellerProductsPage() {
  return (
    <div className="space-y-7">
      <PageHeading
        eyebrow="Catalog"
        title="My products"
        description="Review and manage the products listed in your store."
        action={
          <Link href="/dashboard/products/new" className="inline-flex h-10 items-center gap-2 rounded-full bg-[#1d2c27] px-4 text-sm font-medium text-white transition-colors hover:bg-[#344a42]">
            <PackagePlus aria-hidden="true" className="size-4" /> Add product
          </Link>
        }
      />
      <section className="rounded-3xl border border-[#e1e4df] bg-[#f9faf8] p-5 sm:p-7">
        <PreviewNotice />
        <div className="mt-5 grid gap-3 sm:grid-cols-[minmax(0,1fr)_180px]">
          <input disabled placeholder="Search products" className="h-11 rounded-xl border border-[#e1e4df] bg-white px-3 text-sm placeholder:text-[#9aa39c] disabled:cursor-not-allowed" />
          <button type="button" disabled className="h-11 rounded-xl border border-[#e1e4df] bg-white px-3 text-left text-sm text-[#9aa39c] disabled:cursor-not-allowed">All statuses</button>
        </div>
        <div className="mt-5 grid grid-cols-[minmax(0,2fr)_1fr_1fr_1fr] gap-3 rounded-xl bg-[#edf0ec] px-4 py-3 text-xs font-medium uppercase tracking-wide text-[#788079]">
          <span>Product</span><span>Price</span><span>Stock</span><span>Status</span>
        </div>
        <div className="mt-3">
          <EmptyState
            icon={Boxes}
            title="No products found"
            description="Your product catalog is empty. Add a product to get started."
            action={<Link href="/dashboard/products/new" className="text-sm font-medium text-[#1d2c27] underline underline-offset-4">Add your first product</Link>}
          />
        </div>
      </section>
    </div>
  );
}

export function SellerOrdersPage() {
  return (
    <div className="space-y-7">
      <PageHeading eyebrow="Fulfillment" title="My orders" description="Review incoming orders and keep each order moving to delivery." />
      <div className="grid gap-3 sm:grid-cols-3">
        {["New", "Processing", "Completed"].map((status) => (
          <article key={status} className="rounded-2xl border border-[#e1e4df] bg-[#f9faf8] p-5">
            <p className="text-sm text-[#788079]">{status} orders</p>
            <p className="mt-3 text-2xl font-semibold text-[#1d2c27]">—</p>
          </article>
        ))}
      </div>
      <section className="rounded-3xl border border-[#e1e4df] bg-[#f9faf8] p-5 sm:p-7">
        <PreviewNotice>Order management is a UI preview. Orders will appear here after checkout and order storage are connected.</PreviewNotice>
        <div className="mt-5 grid grid-cols-[1fr_1.5fr_1fr_1fr] gap-3 rounded-xl bg-[#edf0ec] px-4 py-3 text-xs font-medium uppercase tracking-wide text-[#788079]">
          <span>Order</span><span>Customer</span><span>Date</span><span>Status</span>
        </div>
        <div className="mt-3">
          <EmptyState icon={ShoppingBag} title="No orders yet" description="New customer orders will be listed here." />
        </div>
      </section>
    </div>
  );
}

export function SellerAnalyticsPage() {
  return (
    <div className="space-y-7">
      <PageHeading eyebrow="Performance" title="Analytics" description="Understand how your products and store are performing." />
      <PreviewNotice>Analytics will show real numbers after product, order, and traffic tracking are connected.</PreviewNotice>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {["Gross sales", "Orders", "Conversion rate", "Store visits"].map((metric) => (
          <article key={metric} className="rounded-2xl border border-[#e1e4df] bg-[#f9faf8] p-5">
            <p className="text-sm text-[#788079]">{metric}</p>
            <p className="mt-4 text-3xl font-semibold text-[#1d2c27]">—</p>
            <p className="mt-1 text-xs text-[#89918b]">No data available</p>
          </article>
        ))}
      </div>
      <section className="rounded-3xl border border-[#e1e4df] bg-[#f9faf8] p-5 sm:p-7">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="caption-3 uppercase tracking-[0.14em] text-[#788079]">Store performance</p>
            <h2 className="mt-2 text-xl font-semibold text-[#1d2c27]">Sales over time</h2>
          </div>
          <button type="button" disabled className="h-9 rounded-full border border-[#d6dbd6] px-3 text-sm text-[#9aa39c] disabled:cursor-not-allowed">Last 30 days</button>
        </div>
        <div className="mt-5 flex min-h-56 flex-col items-center justify-center rounded-2xl border border-dashed border-[#cbd2cc] bg-white px-5 text-center">
          <BarChart3 aria-hidden="true" className="size-8 text-[#9aa39c]" />
          <p className="mt-3 text-sm font-medium text-[#1d2c27]">No performance data yet</p>
          <p className="mt-1 text-sm text-[#788079]">Your sales chart will appear after your store starts receiving orders.</p>
        </div>
      </section>
    </div>
  );
}

export function SellerPayoutsPage() {
  return (
    <div className="space-y-7">
      <PageHeading eyebrow="Finance" title="Payouts" description="Review your seller balance and manage how you receive payments." />
      <PreviewNotice>Payout setup is not connected. No payment or bank details are being collected.</PreviewNotice>
      <section className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
        <article className="rounded-3xl bg-[#1d2c27] p-6 text-white sm:p-8">
          <div className="flex items-center gap-3">
            <WalletCards aria-hidden="true" className="size-5 text-[#c8d2ca]" />
            <p className="text-sm text-[#c8d2ca]">Available for payout</p>
          </div>
          <p className="mt-6 text-4xl font-semibold tracking-[-0.05em]">—</p>
          <p className="mt-2 text-sm text-[#c8d2ca]">Balance will appear when order payments are connected.</p>
        </article>
        <article className="rounded-3xl border border-[#e1e4df] bg-[#f9faf8] p-6 sm:p-8">
          <p className="text-sm font-semibold text-[#1d2c27]">Payout method</p>
          <div className="mt-4 flex items-center justify-between gap-4 rounded-2xl border border-dashed border-[#cbd2cc] bg-white p-5">
            <div>
              <p className="text-sm font-medium text-[#536057]">No payout method added</p>
              <p className="mt-1 text-xs text-[#89918b]">Payment provider setup is coming later.</p>
            </div>
            <button type="button" disabled className="shrink-0 rounded-full bg-[#1d2c27] px-4 py-2 text-xs font-medium text-white opacity-50 disabled:cursor-not-allowed">Connect</button>
          </div>
        </article>
      </section>
    </div>
  );
}

export function SellerSettingsPage() {
  return (
    <div className="space-y-7">
      <PageHeading eyebrow="Store" title="Store settings" description="Manage the public details customers will see for your store." />
      <PreviewNotice>Store settings are a UI preview. Your changes will not be saved yet.</PreviewNotice>
      <section className="rounded-3xl border border-[#e1e4df] bg-[#f9faf8] p-5 sm:p-7">
        <h2 className="text-lg font-semibold text-[#1d2c27]">Store profile</h2>
        <p className="mt-1 text-sm text-[#788079]">Basic information for your seller profile.</p>
        <div className="mt-5">
          <SellerSettingsForm />
        </div>
      </section>
    </div>
  );
}
