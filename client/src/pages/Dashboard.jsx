import { useState, useEffect, useContext, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import { Briefcase, CheckSquare, Clock, Users, Loader2, Info, X, ChevronRight, AlertTriangle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import api from '../services/api';
import { formatDistanceToNow, format, subDays, isSameDay } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    teamMembers: 0
  });
  const [activities, setActivities] = useState([]);
  const [allTasks, setAllTasks] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const tasksUrl = user?.role === 'admin' ? '/tasks' : `/tasks?assignedTo=${user._id}`;
        
        const [projectsRes, tasksRes, usersRes, activitiesRes] = await Promise.all([
          api.get('/projects'),
          api.get(tasksUrl),
          api.get('/users'),
          api.get('/activities')
        ]);

        const calculateTrend = (items, dateField = 'createdAt') => {
          const now = new Date();
          const last7Days = subDays(now, 7);
          const beforeLast7Days = subDays(now, 14);

          const currentCount = items.filter(item => new Date(item[dateField]) > last7Days).length;
          const previousCount = items.filter(item => {
            const d = new Date(item[dateField]);
            return d <= last7Days && d > beforeLast7Days;
          }).length;

          if (previousCount === 0) return currentCount > 0 ? 100 : 0;
          return Math.round(((currentCount - previousCount) / previousCount) * 100);
        };

        const tasksTrend = calculateTrend(tasksRes.data);
        const projectsTrend = calculateTrend(projectsRes.data);
        const membersTrend = calculateTrend(usersRes.data);
        const completedTrend = calculateTrend(tasksRes.data.filter(t => t.status === 'Completed'), 'updatedAt');
        
        const overdueCount = tasksRes.data.filter(t => 
          new Date(t.dueDate) < new Date() && t.status !== 'Completed'
        ).length;

        setStats({
          totalProjects: projectsRes.data.length,
          totalTasks: tasksRes.data.length,
          completedTasks: tasksRes.data.filter(t => t.status === 'Completed').length,
          teamMembers: usersRes.data.length,
          overdueTasks: overdueCount,
          projectsTrend,
          tasksTrend,
          completedTrend,
          membersTrend
        });
        setAllTasks(tasksRes.data);
        setActivities(activitiesRes.data);
      } catch (error) {
        console.error("Error fetching dashboard data", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const chartData = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => subDays(new Date(), 6 - i));
    return days.map(day => {
      const completedOnDay = allTasks.filter(task => 
        task.status === 'Completed' && 
        task.updatedAt && 
        isSameDay(new Date(task.updatedAt), day)
      ).length;
      return {
        name: format(day, 'EEE'),
        tasks: completedOnDay
      };
    });
  }, [allTasks]);

  const progressPercentage = stats.totalTasks > 0 
    ? Math.round((stats.completedTasks / stats.totalTasks) * 100) 
    : 0;

  const handleActivityClick = (activity) => {
    if (activity.targetType === 'Project') {
      navigate(`/app/tasks?project=${activity.targetId}`);
    } else {
      navigate('/app/tasks');
    }
  };

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome back, {user?.name.split(' ')[0]}! 👋</h1>
          <p className="text-textMuted">Here's what's happening with your projects today.</p>
        </div>
        <button 
          onClick={() => setIsInfoModalOpen(true)}
          className="flex items-center gap-2 text-xs bg-surface/50 p-2 rounded-lg border border-white/5 text-textMuted hover:bg-surface/80 hover:text-white transition-all cursor-pointer group"
        >
          <Info size={14} className="group-hover:text-primary transition-colors" />
          <span>Status Info: Not Started ➔ In Progress ➔ Completed</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Projects" 
          value={stats.totalProjects} 
          icon={<Briefcase size={24} />} 
          trend={stats.projectsTrend}
          colorClass="bg-blue-500" 
          onClick={() => navigate('/app/projects')}
        />
        <StatCard 
          title="Total Tasks" 
          value={stats.totalTasks} 
          icon={<CheckSquare size={24} />} 
          trend={stats.tasksTrend}
          colorClass="bg-purple-500" 
          onClick={() => navigate('/app/tasks')}
        />
        <StatCard 
          title="Completed Tasks" 
          value={stats.completedTasks} 
          icon={<Clock size={24} />} 
          trend={stats.completedTrend}
          colorClass="bg-emerald-500" 
          onClick={() => navigate('/app/tasks?status=Completed')}
        />
        <StatCard 
          title="Overdue Tasks" 
          value={stats.overdueTasks} 
          icon={<AlertTriangle size={24} />} 
          trend={stats.overdueTasks > 0 ? 100 : 0}
          colorClass="bg-red-500" 
          onClick={() => navigate('/app/tasks')}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {user?.role === 'admin' ? (
          <div className="glass-card p-6 lg:col-span-2">
            <h3 className="text-lg font-bold text-white mb-6">Productivity Overview (Tasks Completed)</h3>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorTasks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" tick={{fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                <YAxis stroke="#94a3b8" tick={{fill: '#94a3b8'}} axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1e293b', borderColor: '#334155', color: '#fff', borderRadius: '8px' }}
                  itemStyle={{ color: '#3b82f6' }}
                />
                <Area type="monotone" dataKey="tasks" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorTasks)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        ) : (
          <div className="glass-card p-6 lg:col-span-2 flex flex-col items-center justify-center text-center">
            <div className="relative w-48 h-48 mb-8">
              <svg className="w-full h-full" viewBox="0 0 100 100">
                <circle className="text-slate-700 stroke-current" strokeWidth="8" fill="transparent" r="40" cx="50" cy="50" />
                <circle className="text-primary stroke-current" strokeWidth="8" strokeLinecap="round" fill="transparent" r="40" cx="50" cy="50" 
                  style={{ strokeDasharray: 251.2, strokeDashoffset: 251.2 - (251.2 * progressPercentage) / 100, transition: 'stroke-dashoffset 1s ease-in-out' }} 
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-white">{progressPercentage}%</span>
                <span className="text-xs text-textMuted">Complete</span>
              </div>
            </div>
            <h3 className="text-xl font-bold text-white mb-2">My Progress</h3>
            <p className="text-textMuted max-w-sm">
              You have completed {stats.completedTasks} out of {stats.totalTasks} tasks assigned to you.
            </p>
            <button onClick={() => navigate('/app/tasks')} className="btn-primary mt-6 px-8">Update Status on Board</button>
          </div>
        )}

        <div className="glass-card p-6">
          <h3 className="text-lg font-bold text-white mb-6">Recent Activity</h3>
          <div className="space-y-6">
            {activities.length > 0 ? activities.map((activity, i) => (
              <div 
                key={activity._id} 
                onClick={() => handleActivityClick(activity)}
                className="flex gap-4 relative cursor-pointer group hover:translate-x-1 transition-transform"
              >
                {i !== activities.length - 1 && <div className="absolute left-4 top-10 bottom-[-24px] w-0.5 bg-slate-700"></div>}
                <img 
                  src={activity.user?.avatar || `https://ui-avatars.com/api/?name=${activity.user?.name}`} 
                  alt="user" 
                  className="w-8 h-8 rounded-full border border-surface z-10" 
                />
                <div className="flex-1">
                  <p className="text-sm text-white">
                    <span className="font-bold">{activity.user?.name}</span> {activity.action}
                  </p>
                  <p className="text-[11px] text-primary font-medium mt-0.5 flex items-center gap-1">
                    {activity.targetName}
                    <ChevronRight size={10} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                  </p>
                  <p className="text-xs text-textMuted mt-1">{formatDistanceToNow(new Date(activity.createdAt))} ago</p>
                </div>
              </div>
            )) : (
              <div className="text-center py-8">
                <p className="text-textMuted text-sm">No recent activity found.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Info Modal */}
      <AnimatePresence>
        {isInfoModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="glass-card w-full max-w-md p-6 relative"
            >
              <button onClick={() => setIsInfoModalOpen(false)} className="absolute top-4 right-4 text-textMuted hover:text-white">
                <X size={24} />
              </button>
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <Info className="text-primary" />
                Project Guidelines
              </h2>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-white font-bold mb-2 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-slate-500"></div>
                    Not Started
                  </h4>
                  <p className="text-sm text-textMuted leading-relaxed pl-4 border-l border-white/5">
                    Project is in the planning phase. Tasks are being created, but official work hasn't begun. Progress is 0%.
                  </p>
                </div>

                <div>
                  <h4 className="text-primary font-bold mb-2 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                    In Progress
                  </h4>
                  <p className="text-sm text-textMuted leading-relaxed pl-4 border-l border-white/5">
                    Active execution phase. The progress bar automatically tracks completion based on tasks moved to "Completed" on the Kanban board.
                  </p>
                </div>

                <div>
                  <h4 className="text-emerald-400 font-bold mb-2 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-400"></div>
                    Completed
                  </h4>
                  <p className="text-sm text-textMuted leading-relaxed pl-4 border-l border-white/5">
                    Goal reached! The project is officially finished. Marking a project as Completed forces the progress bar to 100%.
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setIsInfoModalOpen(false)}
                className="btn-primary w-full mt-8"
              >
                Got it!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Dashboard;
