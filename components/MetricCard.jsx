'use client';

export default function MetricCard({ title, value, target, icon, color = 'blue' }) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    orange: 'from-orange-500 to-orange-600',
    red: 'from-red-500 to-red-600',
  };

  const percentage = typeof value === 'number' && typeof target === 'number'
    ? Math.min(100, (value / target) * 100)
    : 0;

  const isOnTrack = percentage >= 100;

  return (
    <div className="bg-gradient-dark border border-gray-800 rounded-xl p-6 space-y-4 hover:border-gray-700 transition">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-300">{title}</h3>
        <span className="text-2xl">{icon}</span>
      </div>

      {/* Value */}
      <div className="space-y-2">
        <p className="text-3xl font-bold font-display">{value}</p>
        <p className="text-xs text-gray-500">Target: {target}</p>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-800 rounded-full h-2 overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${colorClasses[color]} rounded-full transition-all`}
          style={{ width: `${Math.min(100, percentage)}%` }}
        ></div>
      </div>

      {/* Status */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-500">{percentage.toFixed(0)}% of target</span>
        <span className={isOnTrack ? 'text-green-400' : 'text-orange-400'}>
          {isOnTrack ? '✅ On Track' : '⚠️ Behind'}
        </span>
      </div>
    </div>
  );
}
