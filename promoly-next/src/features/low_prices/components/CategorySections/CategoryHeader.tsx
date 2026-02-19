type Props = {
  categoria: string;
};

export default function CategoryHeader({ categoria }: Props) {
  return <h2 className="text-primary text-4xl font-bold mb-10">{categoria}</h2>;
}
