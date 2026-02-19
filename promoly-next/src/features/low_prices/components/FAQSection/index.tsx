import FAQHeader from "./FAQHeader";
import FAQGrid from "./FAQGrid";

export default function FAQSection() {
  return (
    <section className="max-w-4xl mx-auto px-6 py-24">
      <FAQHeader />
      <FAQGrid />
    </section>
  );
}
