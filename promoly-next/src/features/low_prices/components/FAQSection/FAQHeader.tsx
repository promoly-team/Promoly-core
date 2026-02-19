export default function FAQHeader() {
  return (
    <div className="text-center mb-16 flex flex-col items-center">
      <div className="bg-primary/5 rounded-full p-4 mb-6">
        <span className="text-4xl">❓</span>
      </div>
      <h2 className="text-4xl md:text-5xl font-bold mb-4 max-w-2xl">
        Dúvidas sobre o Radar de Oportunidades?
      </h2>
      <p className="text-gray-600 text-lg max-w-2xl leading-relaxed">
        Aqui você encontra respostas sobre como funcionam nossas análises de preço e como identificamos as melhores oportunidades para você economizar.
      </p>
    </div>
  );
}
