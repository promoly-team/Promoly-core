import CategoryHeader from "./CategoryHeader";
import CategoryTopProduct from "./CategoryTopProduct";
import CategoryProductGrid from "./CategoryProductGrid";
import CategoryMoreLink from "./CategoryMoreLink";

type Props = {
  categoria: string;
  group: {
    slug: string;
    items: any[];
  };
};

export default function CategorySection({ categoria, group }: Props) {
  const { slug, items } = group;

  const sorted = [...items].sort(
    (a, b) => a.priceDiffPercent - b.priceDiffPercent,
  );

  const topProduct = sorted[0];
  const others = sorted.slice(1, 6);

  return (
    <section className="mb-24">
      <CategoryHeader categoria={categoria} />

      <CategoryTopProduct product={topProduct} />

      <CategoryProductGrid products={others} />

      <CategoryMoreLink slug={slug} categoria={categoria} />
    </section>
  );
}
