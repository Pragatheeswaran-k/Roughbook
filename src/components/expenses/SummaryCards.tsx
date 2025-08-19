const SummaryCard = ({
    title,
    value,
    subtitle,
    color,
  }: {
    title: string;
    value: string;
    subtitle: string;
    color: "yellow" | "blue" | "green" | "indigo";
  }) => {
    const base = {
      yellow: "bg-yellow-50 border-yellow-300 text-yellow-700",
      blue: "bg-blue-50 border-blue-300 text-blue-700",
      green: "bg-green-50 border-green-300 text-green-700",
      indigo: "bg-indigo-50 border-indigo-300 text-indigo-700"
    };
    return (
      <div className={`p-5 rounded-2xl border ${base[color]} shadow-sm`}>
        <div className="text-sm font-semibold">{title}</div>
        <div className="text-xl font-bold mt-1">{value}</div>
        {subtitle && <div className="text-sm text-gray-600">{subtitle}</div>}
      </div>
    );
  };

export default SummaryCard;