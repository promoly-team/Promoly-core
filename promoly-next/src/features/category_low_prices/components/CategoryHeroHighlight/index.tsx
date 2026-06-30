import HeroHighlight from "@/features/low_prices/components/HeroHighlight";
import type { EnrichedProduct } from "@/types";

type Props = {
  product: EnrichedProduct;
};

export default function CategoryHeroHighlight({ product }: Props) {
  return <HeroHighlight product={product} />;
}
