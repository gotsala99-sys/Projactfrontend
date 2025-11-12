// components/CompositionBarChart.tsx
// components/CompositionBarChart.tsx
"use client";

interface CompositionBarChartProps {
  isDarkMode: boolean;
}

export default function CompositionBarChart({
  isDarkMode,
}: CompositionBarChartProps) {
  const compositions = [
    {
      name: "KOH",
      value: 25,
      gradient: {
        light: "from-emerald-400 to-emerald-600",
        dark: "from-emerald-500 to-emerald-700",
      },
      iconBg: isDarkMode ? "bg-emerald-500/20" : "bg-emerald-100",
      textColor: isDarkMode ? "text-emerald-300" : "text-emerald-700",
      percentage: 25,
    },
    {
      name: "Na₂SO₄",
      value: 15,
      gradient: {
        light: "from-amber-400 to-orange-600",
        dark: "from-amber-500 to-orange-700",
      },
      iconBg: isDarkMode ? "bg-orange-500/20" : "bg-orange-100",
      textColor: isDarkMode ? "text-amber-300" : "text-orange-700",
      percentage: 15,
    },
    {
      name: "H₂O",
      value: 65,
      gradient: {
        light: "from-blue-400 to-blue-600",
        dark: "from-blue-500 to-blue-700",
      },
      iconBg: isDarkMode ? "bg-blue-500/20" : "bg-blue-100",
      textColor: isDarkMode ? "text-blue-300" : "text-blue-700",
      percentage: 65,
    },
  ];

  return (
    <div
      className={`p-4 sm:p-5 md:p-6 lg:p-7 rounded-2xl shadow-lg transition-all h-full flex flex-col border ${
        isDarkMode
          ? "bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700/50"
          : "bg-white border-slate-200"
      }`}
    >
      {/* Title */}
      <h3
        className={`text-base sm:text-lg md:text-xl font-bold mb-5 sm:mb-6 md:mb-7 text-center bg-gradient-to-r ${
          isDarkMode
            ? "from-cyan-400 via-blue-400 to-teal-400"
            : "from-blue-600 via-cyan-600 to-teal-600"
        } bg-clip-text text-transparent`}
      >
        Composition Ratio (KOH / Na₂SO₄ / H₂O)
      </h3>

      {/* Bars */}
      <div className="space-y-5 sm:space-y-6 md:space-y-7 flex-1">
        {compositions.map((item, index) => (
          <div key={index} className="space-y-2.5">
            {/* Label with Icon */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                {/* Icon Badge */}
                <div
                  className={`w-8 h-8 rounded-lg ${item.iconBg} flex items-center justify-center shadow-md`}
                >
                  <span className={`text-sm font-bold ${item.textColor}`}>
                    {item.name.charAt(0)}
                  </span>
                </div>
                <span
                  className={`text-sm sm:text-base font-bold ${
                    isDarkMode ? "text-slate-200" : "text-slate-800"
                  }`}
                >
                  {item.name}
                </span>
              </div>
              <span
                className={`text-xs sm:text-sm font-bold px-3 py-1 rounded-lg ${
                  isDarkMode
                    ? "bg-slate-700 text-slate-300"
                    : "bg-slate-100 text-slate-700"
                }`}
              >
                {item.percentage}%
              </span>
            </div>

            {/* Bar with Gradient */}
            <div
              className={`relative h-10 sm:h-12 md:h-14 rounded-xl overflow-hidden shadow-inner ${
                isDarkMode ? "bg-slate-700/50" : "bg-slate-100"
              }`}
            >
              <div
                className={`h-full transition-all duration-1000 ease-out flex items-center justify-between px-4 relative overflow-hidden bg-gradient-to-r ${
                  isDarkMode ? item.gradient.dark : item.gradient.light
                }`}
                style={{ width: `${item.percentage}%` }}
              >
                {/* Animated shine effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>

                {/* Bar content */}
                <div className="relative z-10 flex items-center justify-between w-full">
                  <span className="text-white font-bold text-sm sm:text-base drop-shadow-md">
                    {item.name}
                  </span>
                  <span className="text-white font-bold text-base sm:text-lg drop-shadow-md">
                    {item.percentage}%
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Scale Labels */}
      <div
        className={`flex justify-between mt-5 pt-4 px-1 border-t ${
          isDarkMode ? "border-slate-700/50" : "border-slate-200"
        }`}
      >
        {["0%", "", "20%", "", "40%", "", "60%", "", "80%", "", "100%"].map(
          (label, i) => (
            <span
              key={i}
              className={`text-xs font-medium ${
                isDarkMode ? "text-slate-500" : "text-slate-400"
              }`}
            >
              {label}
            </span>
          )
        )}
      </div>

      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer {
          animation: shimmer 3s infinite;
        }
      `}</style>
    </div>
  );
}
