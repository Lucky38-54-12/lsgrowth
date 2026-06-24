'use client';

export default function AlertCard({ title, count, icon, type = 'info', action }) {
  const typeClasses = {
    info: 'bg-blue-900/20 border-blue-500/20',
    warning: 'bg-yellow-900/20 border-yellow-500/20',
    success: 'bg-green-900/20 border-green-500/20',
    error: 'bg-red-900/20 border-red-500/20',
  };

  const typeColors = {
    info: 'text-blue-400',
    warning: 'text-yellow-400',
    success: 'text-green-400',
    error: 'text-red-400',
  };

  return (
    <div className={`border rounded-xl p-6 space-y-4 ${typeClasses[type]}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-300">{title}</h3>
        <span className="text-2xl">{icon}</span>
      </div>

      <div>
        <p className={`text-3xl font-bold font-display ${typeColors[type]}`}>{count}</p>
      </div>

      <button className={`text-xs font-medium ${typeColors[type]} hover:opacity-80 transition`}>
        {action} →
      </button>
    </div>
  );
}
