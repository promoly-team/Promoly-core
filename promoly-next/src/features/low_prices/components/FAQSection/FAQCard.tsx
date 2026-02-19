type Props = {
  icon: string;
  iconBg: string;
  title: string;
  content: React.ReactNode;
};

export default function FAQCard({ icon, iconBg, title, content }: Props) {
  return (
    <div className="bg-white rounded-xl2 p-8 shadow-soft border border-gray-100 hover:shadow-medium transition">
      <div className="flex items-start gap-4 mb-4">
        <div className={`${iconBg} rounded-lg p-3 flex-shrink-0`}>
          <span className="text-xl">{icon}</span>
        </div>
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
      </div>
      <p className="text-gray-600 leading-relaxed">{content}</p>
    </div>
  );
}
