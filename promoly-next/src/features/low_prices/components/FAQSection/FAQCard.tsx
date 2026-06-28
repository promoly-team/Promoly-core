type Props = {
  icon: string;
  iconBg: string;
  title: string;
  content: React.ReactNode;
};

export default function FAQCard({ icon, iconBg, title, content }: Props) {
  return (
    <div className="bg-panel rounded-2xl p-6 md:p-8 shadow-elevated border border-line hover:border-primary/40 hover:-translate-y-1 transition-all duration-300 group">
      <div className="flex items-start gap-4 mb-5">
        <div className={`${iconBg} rounded-xl p-3 flex-shrink-0 group-hover:scale-110 transition-transform`}>
          <span className="text-2xl">{icon}</span>
        </div>
        <h3 className="text-lg md:text-xl font-bold text-ink leading-tight">{title}</h3>
      </div>
      <p className="text-ink-muted leading-relaxed text-base [&_strong]:text-ink">{content}</p>
    </div>
  );
}
