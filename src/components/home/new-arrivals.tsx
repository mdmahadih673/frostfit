import { HomeProductShowcase } from "./home-product-showcase";

export function NewArrivals() {
  return (
    <HomeProductShowcase
      id="new-arrivals"
      eyebrow="Latest drops"
      title="New arrivals"
      mode="new-arrivals"
      variant="light"
      emptyMessage="No new arrivals available right now."
    />
  );
}
