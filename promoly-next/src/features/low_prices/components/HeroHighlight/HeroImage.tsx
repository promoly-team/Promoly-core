import Image from "next/image";

type Props = {
  product: any;
};

export default function HeroImage({ product }: Props) {
  return (
    <div className="w-full flex justify-center">
      <Image
        src={product.imagem_url ?? "/placeholder.png"}
        alt={product.titulo}
        width={600}
        height={600}
        priority
        className="w-full max-w-[260px] sm:max-w-[340px] md:max-w-[420px] h-auto object-contain rounded-xl"
        sizes="
          (max-width: 640px) 260px,
          (max-width: 1024px) 340px,
          420px
        "
      />
    </div>
  );
}
