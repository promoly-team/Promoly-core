import HeroHighlight from "@/features/low_prices/components/HeroHighlight";

type Props = {
  product: any;
};

export default function CategoryHeroHighlight({ product }: Props) {
  return <HeroHighlight product={product} />;
}
