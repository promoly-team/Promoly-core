import HeroHighlight from "@/features/low_prices/components/HeroHighlight";
import type { CategoryProduct } from "../../types";

type Props = {
  product: CategoryProduct;
};

export default function CategoryHeroHighlight({ product }: Props) {
  return <HeroHighlight product={product} />;
}
