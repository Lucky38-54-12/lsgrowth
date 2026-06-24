'use client';

export default function ChartCard({ title, children, height = 300 }) {
  return (
    <div className="bg-gradient-dark border border-gray-800 rounded-xl p-6 space-y-4 hover:border-gray-700 transition" style={{ minHeight: height }}>
      <h2 className="text-lg font-bold font-display">{title}</h2>
      <div className="w-full">
        {children}
      </div>
    </div>
  );
}
