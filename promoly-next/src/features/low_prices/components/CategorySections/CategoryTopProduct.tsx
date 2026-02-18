import Image from "next/image";
import CategoryProductMetrics from "./CategoryProductMetrics";
import CategoryProductChart from "./CategoryProductChart";
import CategoryProductActions from "./CategoryProductActions";

type Props = {
  product: any;
};

export default function CategoryTopProduct({ product }: Props) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow border mb-10">
      <div className="grid md:grid-cols-2 gap-10">
        <div>
          <Image
            src={product.imagem_url ?? "/placeholder.png"}
            alt={product.titulo}
            width={500}
            height={500}
            className="w-full rounded-xl object-contain"
          />
        </div>

        <div>
          <CategoryProductMetrics product={product} />
          <CategoryProductChart product={product} />
          <CategoryProductActions product={product} />
        </div>
      </div>
    </div>
  );
}
