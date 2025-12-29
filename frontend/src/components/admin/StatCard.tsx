import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  format?: 'currency' | 'number' | 'percent';
  delay?: number;
}

export function StatCard({
  title,
  value,
  change,
  icon: Icon,
  iconColor = 'text-white',
  iconBg = 'bg-white/10',
  format = 'number',
  delay = 0,
}: StatCardProps) {
  const formatValue = (val: string | number): string => {
    if (typeof val === 'string') return val;
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('es-CO', {
          style: 'currency',
          currency: 'COP',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(val);
      case 'percent':
        return `${val.toFixed(1)}%`;
      default:
        return val.toLocaleString('es-CO');
    }
  };

  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all duration-300 group"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl ${iconBg} group-hover:scale-110 transition-transform duration-300`}>
          <Icon className={`w-6 h-6 ${iconColor}`} />
        </div>
        {change !== undefined && (
          <div
            className={`flex items-center gap-1 text-sm font-medium px-2.5 py-1 rounded-full ${
              isPositive
                ? 'bg-emerald-500/20 text-emerald-400'
                : isNegative
                ? 'bg-red-500/20 text-red-400'
                : 'bg-white/10 text-gray-400'
            }`}
          >
            {isPositive && (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            )}
            {isNegative && (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            )}
            {Math.abs(change).toFixed(1)}%
          </div>
        )}
      </div>
      <div>
        <p className="text-sm text-gray-400 font-medium">{title}</p>
        <p className="text-3xl font-bold text-white mt-1">{formatValue(value)}</p>
      </div>
    </motion.div>
  );
}

interface MiniStatProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: 'blue' | 'green' | 'orange' | 'purple' | 'pink' | 'white';
}

const colorClasses = {
  blue: { bg: 'bg-blue-500/10', icon: 'text-blue-400', dot: 'bg-blue-500' },
  green: { bg: 'bg-emerald-500/10', icon: 'text-emerald-400', dot: 'bg-emerald-500' },
  orange: { bg: 'bg-orange-500/10', icon: 'text-orange-400', dot: 'bg-orange-500' },
  purple: { bg: 'bg-purple-500/10', icon: 'text-purple-400', dot: 'bg-purple-500' },
  pink: { bg: 'bg-pink-500/10', icon: 'text-pink-400', dot: 'bg-pink-500' },
  white: { bg: 'bg-white/10', icon: 'text-white', dot: 'bg-white' },
};

export function MiniStat({ title, value, icon: Icon, color }: MiniStatProps) {
  const colors = colorClasses[color];

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`flex items-center gap-4 p-4 rounded-xl ${colors.bg} cursor-pointer transition-all duration-200 border border-white/5`}
    >
      <div className={`p-2.5 rounded-lg bg-white/5`}>
        <Icon className={`w-5 h-5 ${colors.icon}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-400 truncate">{title}</p>
        <p className="text-xl font-bold text-white">{value}</p>
      </div>
      <div className={`w-2 h-2 rounded-full ${colors.dot}`} />
    </motion.div>
  );
}
