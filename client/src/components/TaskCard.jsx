import { motion } from 'framer-motion';
import { Clock, AlertCircle, Lock } from 'lucide-react';

const TaskCard = ({ task, onClick, isDraggable }) => {
  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'High': return 'text-red-400 bg-red-400/10 border-red-400/20';
      case 'Medium': return 'text-orange-400 bg-orange-400/10 border-orange-400/20';
      default: return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
    }
  };

  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'Completed';

  return (
    <motion.div
      layout
      whileHover={{ y: -2 }}
      onClick={onClick}
      draggable={isDraggable}
      className={`glass-card p-4 cursor-pointer border ${isOverdue ? 'border-red-500/50 shadow-red-500/10' : 'border-white/5'}`}
    >
      <div className="flex justify-between items-start mb-3">
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${getPriorityColor(task.priority)}`}>
          {task.priority}
        </span>
        <div className="flex items-center gap-2">
          {isOverdue && <AlertCircle size={14} className="text-red-500" />}
          {!isDraggable && <Lock size={12} className="text-textMuted" title="You cannot edit this task" />}
        </div>
      </div>
      
      <h4 className="text-white font-medium mb-1 line-clamp-1">{task.title}</h4>
      <p className="text-xs text-textMuted mb-4 line-clamp-2">{task.description}</p>
      
      <div className="flex items-center justify-between mt-auto pt-4 border-t border-white/5">
        <div className="flex items-center gap-2">
          {task.assignedTo && (
            <div className="relative group">
              <img 
                src={task.assignedTo.avatar || `https://ui-avatars.com/api/?name=${task.assignedTo.name}`} 
                alt="Assignee" 
                className="w-7 h-7 rounded-full border-2 border-surface shadow-sm"
              />
              <div className="absolute -top-8 left-0 bg-background text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/10 z-50">
                Assigned to: {task.assignedTo.name}
              </div>
            </div>
          )}
          {task.createdBy && (
            <div className="flex flex-col">
              <span className="text-[10px] text-textMuted leading-none">By</span>
              <span className="text-[11px] text-primary font-bold leading-tight truncate max-w-[80px]">
                {task.createdBy.name.split(' ')[0]}
              </span>
            </div>
          )}
        </div>
        <div className={`flex items-center text-[10px] font-medium ${isOverdue ? 'text-red-400' : 'text-textMuted'}`}>
          <Clock size={12} className="mr-1" />
          {new Date(task.dueDate).toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </motion.div>
  );
};

export default TaskCard;
