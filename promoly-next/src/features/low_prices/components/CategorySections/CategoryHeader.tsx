type Props = {
  categoria: string;
};

export default function CategoryHeader({ categoria }: Props) {
  return (
    <h2 className="text-3xl sm:text-4xl font-extrabold mb-12">
      <span className="text-[#F5F138] mr-3">●</span>
      <span className="text-[#9AEBA3]">{categoria}</span>
    </h2>
  );
}
