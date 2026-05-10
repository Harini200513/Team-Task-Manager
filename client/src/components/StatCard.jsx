import { motion } from 'framer-motion';

const StatCard = ({ title, value, icon, trend, colorClass, onClick }) => {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      onClick={onClick}
      className={`glass-card p-6 relative overflow-hidden group ${onClick ? 'cursor-pointer' : ''}`}
    >
      {/* Decorative Corner Curve */}
      <div className={`absolute top-0 right-0 w-24 h-24 opacity-15 transition-all group-hover:opacity-25 rounded-bl-[100px] ${colorClass}`}></div>
      
      {/* Icon placed in the middle of the corner curve */}
      <div className="absolute top-5 right-5 z-20">
        <div className={`w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-white ${colorClass.replace('bg-', 'text-')} border border-white/5`}>
          {icon}
        </div>
      </div>

      <div className="relative z-10">
        <p className="text-textMuted text-xs font-bold uppercase tracking-wider mb-1">{title}</p>
        <h3 className="text-3xl font-black text-white">{value}</h3>
      </div>
      
      {trend !== undefined && (
        <div className="mt-6 flex items-center text-xs relative z-10">
          <span className={`font-bold px-2 py-0.5 rounded-full ${trend >= 0 ? "text-emerald-400 bg-emerald-400/10" : "text-red-400 bg-red-400/10"}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
          <span className="text-textMuted ml-2">growth</span>
        </div>
      )}
    </motion.div>
  );
};

export default StatCard;
