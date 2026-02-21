type Props = {
  slug: string;
  categoria: string;
};

export default function CategoryMoreLink({ slug, categoria }: Props) {
  return (
    <div className="mt-10">
      <a
        href={`/categoria/${slug}/menor-preco`}
        className="
          inline-block
          text-[#DAFDBA]
          font-semibold
          text-lg
          transition
          hover:text-[#F5F138]
        "
      >
        Ver mais em {categoria} →
      </a>
    </div>
  );
}
