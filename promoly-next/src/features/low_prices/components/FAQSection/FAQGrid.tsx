import FAQCard from "./FAQCard";

const faqItems = [
  {
    icon: "🔍",
    iconBg: "bg-primary/10",
    title: "Como saber se é uma queda real?",
    content: (
      <>
        Não mostramos promoções artificiais. O produto só aparece aqui quando o preço atual está{" "}
        <strong>significativamente abaixo da média histórica</strong> que monitoramos continuamente. Isso significa que você vê apenas dados reais de mercado, com quedas de preço autênticas comparadas ao histórico do produto.
      </>
    ),
  },
  {
    icon: "⏰",
    iconBg: "bg-success/10",
    title: "Com que frequência os preços são atualizados?",
    content: (
      <>
        Para garantir que você não perca nenhuma oportunidade, monitoramos os preços <strong>várias vezes ao dia</strong>. Nossos dados estão sempre frescos e refletem as mudanças de preço em tempo real, permitindo que você identifique quedas assim que acontecem.
      </>
    ),
  },
  {
    icon: "📊",
    iconBg: "bg-accent/10",
    title: "Como funciona a média histórica?",
    content: (
      <>
        Calculamos a média analisando <strong>todos os registros anteriores</strong> de cada produto. Quanto mais dados históricos temos, mais precisa é a comparação. Isso garante que a &quot;média&quot; seja realmente representativa do preço normal do produto.
      </>
    ),
  },
  {
    icon: "🎯",
    iconBg: "bg-danger/10",
    title: "Por que alguns produtos não aparecem?",
    content: (
      <>
        Mantemos um padrão alto de qualidade. Filtramos apenas produtos com <strong>queda real de pelo menos 2%</strong> em relação à média histórica. Isso garante que você vê apenas oportunidades genuínas de economia, não oscilações mínimas.
      </>
    ),
  },
];

export default function FAQGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
      {faqItems.map((item, index) => (
        <FAQCard key={index} {...item} />
      ))}
    </div>
  );
}
