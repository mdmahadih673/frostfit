import { HomeProductShowcase } from "./home-product-showcase";

export function TrendingNow() {
  return (
    <HomeProductShowcase
      eyebrow="Winter edit"
      title="Trending now"
      mode="winter"
      variant="dark"
      emptyMessage="No winter products available right now."
    />
  );
}
