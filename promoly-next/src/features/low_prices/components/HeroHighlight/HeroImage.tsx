import Image from "next/image";

type Props = {
  product: any;
};

export default function HeroImage({ product }: Props) {
  return (
    <div>
      <Image
        src={product.imagem_url ?? "/placeholder.png"}
        alt={product.titulo}
        width={600}
        height={600}
        className="w-full rounded-xl object-contain"
        priority
      />
    </div>
  );
}
