import Image from "next/image";

type Props = {
  product: any;
};

export default function HeroImage({ product }: Props) {
  return (
    <div className="w-full flex justify-center">
      <div
        className="
  bg-[#0a154a]
  border border-[#45C4B0]
  rounded-2xl
  p-6 sm:p-8
  shadow-lg
  flex
  justify-center
  items-center
"
      >
        <Image
          src={product.imagem_url ?? "/placeholder.png"}
          alt={product.titulo}
          width={600}
          height={600}
          priority
          className="
      w-full
      max-w-[390px]      /* 30% maior no mobile */
      sm:max-w-[380px]
      md:max-w-[480px]
      h-auto
      object-contain
      rounded-xl
      transition-transform
      duration-300
      hover:scale-105
    "
          sizes="
      (max-width: 640px) 390px,
      (max-width: 1024px) 380px,
      480px
    "
        />
      </div>
    </div>
  );
}
