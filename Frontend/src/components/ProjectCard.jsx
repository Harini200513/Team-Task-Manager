import { motion } from 'framer-motion';
import { Calendar, Users, Edit3, Trash2 } from 'lucide-react';

const ProjectCard = ({ project, onClick, onDelete, onEdit }) => {
  const getStatusColor = (status) => {
    switch(status) {
      case 'Completed': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/20';
      case 'In Progress': return 'bg-blue-500/20 text-blue-400 border-blue-500/20';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/20';
    }
  };

  const progress = project.progress || 0;

  const isOverdue = new Date(project.deadline) < new Date() && project.status !== 'Completed';

  return (
    <motion.div
      whileHover={{ y: -5 }}
      onClick={onClick}
      className="glass-card p-6 cursor-pointer group"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(project.status)}`}>
            {project.status}
          </span>
          {isOverdue && (
            <span className="px-3 py-1 rounded-full text-xs font-medium border bg-red-500/20 text-red-400 border-red-500/20">
              Overdue
            </span>
          )}
        </div>
        <div className="flex gap-2">
          {onEdit && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="text-textMuted hover:text-white transition-colors opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-white/10"
            >
              <Edit3 size={18} />
            </button>
          )}
          {onDelete && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="text-textMuted hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-red-500/10"
            >
              <Trash2 size={18} />
            </button>
          )}
        </div>
      </div>
      
      <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">{project.title}</h3>
      <p className="text-sm text-textMuted mb-6 line-clamp-2">{project.description}</p>
      
      <div className="mb-4">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-textMuted">Progress</span>
          <span className="text-white font-medium">{progress}%</span>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-1.5">
          <div className="bg-primary h-1.5 rounded-full" style={{ width: `${progress}%` }}></div>
        </div>
      </div>
      
      <div className="flex items-center justify-between border-t border-white/5 pt-4">
        <div className="flex -space-x-2">
          {project.members?.slice(0,3).map((member, i) => (
            <img key={i} src={member.avatar || `https://ui-avatars.com/api/?name=${member.name}`} alt="avatar" className="w-8 h-8 rounded-full border-2 border-surface object-cover" />
          ))}
          {project.members?.length > 3 && (
            <div className="w-8 h-8 rounded-full border-2 border-surface bg-slate-800 flex items-center justify-center text-xs font-medium text-white">
              +{project.members.length - 3}
            </div>
          )}
        </div>
        <div className={`flex items-center text-[10px] font-medium ${isOverdue ? 'text-red-400' : 'text-textMuted'}`}>
          <Calendar size={12} className="mr-1" />
          {new Date(project.deadline).toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </motion.div>
  );
};

export default ProjectCard;
