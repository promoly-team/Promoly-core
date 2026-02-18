import FAQCard from "./FAQCard";

const faqItems = [
  {
    icon: "🔍",
    iconBg: "bg-primary/10",
    title: "Como saber se é uma queda real?",
    content: (
      <>
        O produto só aparece aqui quando o preço atual está{" "}
        <strong>significativamente abaixo da média histórica</strong> que
        monitoramos. Não é promoção artificial — são dados reais de mercado.
      </>
    ),
  },
  {
    icon: "⏰",
    iconBg: "bg-success/10",
    title: "Com que frequência os preços são atualizados?",
    content: (
      <>
        Os preços são monitorados <strong>várias vezes ao dia</strong>,
        garantindo que você veja as oportunidades em tempo real. Os dados estão
        sempre frescos.
      </>
    ),
  },
  {
    icon: "📊",
    iconBg: "bg-accent/10",
    title: "Como funciona a média histórica?",
    content: (
      <>
        Calculamos a média com base em{" "}
        <strong>todos os registros anteriores</strong> do produto. Quanto mais
        dados, mais precisa é a comparação. Mínimo 2 registros para aparecer
        aqui.
      </>
    ),
  },
  {
    icon: "🎯",
    iconBg: "bg-danger/10",
    title: "Por que alguns produtos não aparecem?",
    content: (
      <>
        Filtramos apenas produtos com{" "}
        <strong>queda real de pelo menos 2%</strong> em relação à média
        histórica. Isso garante que você vê apenas oportunidades genuínas.
      </>
    ),
  },
];

export default function FAQGrid() {
  return (
    <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-6">
      {faqItems.map((item, index) => (
        <FAQCard key={index} {...item} />
      ))}
    </div>
  );
}
