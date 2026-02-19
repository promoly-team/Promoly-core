import HeroImage from "./HeroImage";
import HeroMetrics from "./HeroMetrics";
import HeroChart from "./HeroChart";
import HeroActions from "./HeroActions";

type Props = {
  product: any;
};

export default function HeroHighlight({ product }: Props) {
  return (
    <section className="bg-white rounded-2xl p-10 shadow border mb-20">
      <h2 className="text-2xl font-bold mb-8 flex items-center gap-2">
        🏆 Maior Queda do Dia
      </h2>

      <div className="grid md:grid-cols-2 gap-12">
        <HeroImage product={product} />

        <div>
          <HeroMetrics product={product} />
          <HeroChart product={product} />
          <HeroActions product={product} />
        </div>
      </div>
    </section>
  );
}
