type Props = {
  slug: string;
  categoria: string;
};

export default function CategoryMoreLink({ slug, categoria }: Props) {
  return (
    <div className="mt-8 text-left">
      <a
        href={`/categoria/${slug}/menor-preco`}
        className="
          inline-block
          text-primary
          font-semibold
          hover:underline
          transition
        "
      >
        Ver mais em {categoria} →
      </a>
    </div>
  );
}
