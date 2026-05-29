import { deriveInsights } from "./analyticsUtils";

const TONES = {
  green: { bg: "bg-green-50", icon: "text-green-500" },
  red: { bg: "bg-red-50", icon: "text-red-500" },
  blue: { bg: "bg-blue-50", icon: "text-blue-500" },
  yellow: { bg: "bg-amber-50", icon: "text-amber-500" },
  purple: { bg: "bg-purple-50", icon: "text-purple-500" },
};

export default function InsightsTrends({ data, className = "" }) {
  const insights = deriveInsights(data);

  return (
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-fadeInUp ${className}`}>
      <h2 className="font-bold text-gray-900 mb-4">Insights &amp; Trends</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {insights.map((ins, i) => {
          const tone = TONES[ins.tone] || TONES.purple;
          return (
            <div key={i} className="flex items-start gap-3 rounded-xl border border-gray-100 p-4">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${tone.bg}`}>
                <span className={`material-icons ${tone.icon}`} style={{ fontSize: "20px" }}>
                  {ins.icon}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-800">{ins.title}</p>
                <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{ins.text}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
