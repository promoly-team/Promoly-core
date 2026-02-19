type Props = {
  icon: string;
  iconBg: string;
  title: string;
  content: React.ReactNode;
};

export default function FAQCard({ icon, iconBg, title, content }: Props) {
  return (
    <div className="bg-white rounded-2xl p-8 md:p-10 shadow-soft border border-gray-100 hover:shadow-medium hover:-translate-y-1 transition-all duration-300 group">
      <div className="flex items-start gap-4 mb-5">
        <div className={`${iconBg} rounded-xl p-3 flex-shrink-0 group-hover:scale-110 transition-transform`}>
          <span className="text-2xl">{icon}</span>
        </div>
        <h3 className="text-lg md:text-xl font-bold text-gray-900 leading-tight">{title}</h3>
      </div>
      <p className="text-gray-600 leading-relaxed text-base">{content}</p>
    </div>
  );
}
