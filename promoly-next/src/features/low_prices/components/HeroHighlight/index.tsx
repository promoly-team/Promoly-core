import HeroImage from "./HeroImage";
import HeroMetrics from "./HeroMetrics";
import HeroChart from "./HeroChart";
import HeroActions from "./HeroActions";

type Props = {
  product: any;
};

export default function HeroHighlight({ product }: Props) {
  return (
    <section
      className="
        bg-[#0a154a]
        rounded-2xl
        p-4 sm:p-8 lg:p-12
        border border-[#45C4B0]
        shadow-lg
        mb-16 sm:mb-20
      "
    >
      <h2 className="text-xl sm:text-2xl lg:text-3xl font-bold text-[#9AEBA3] mb-6 sm:mb-10 flex items-center gap-3">
        <span className="text-[#F5F138] text-2xl sm:text-3xl">🏆</span>
        Maior Queda do Dia
      </h2>

      {/* BLOCO SUPERIOR */}
      <div
        className="
    flex flex-col
    gap-6
    lg:grid lg:grid-cols-2
    lg:gap-12
    items-center lg:items-start
    mb-8 sm:mb-12 lg:mb-16
  "
      >
        <HeroImage product={product} />
        <div className="flex flex-col gap-6">
          <HeroMetrics product={product} />
          <HeroActions product={product} />
        </div>
      </div>

      {/* GRÁFICO FULL WIDTH */}
      <div className="mt-6 sm:mt-8">
        <HeroChart product={product} />
      </div>
    </section>
  );
}
