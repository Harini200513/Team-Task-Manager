import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { User, Mail, Shield, Camera, Loader2, Save, CheckSquare, Clock, Briefcase, LayoutDashboard } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const Profile = () => {
  const { user, updateUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [personalStats, setPersonalStats] = useState({
    assignedTasks: 0,
    completedTasks: 0,
    createdTasks: 0,
    projectsCount: 0
  });
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || ''
  });

  useEffect(() => {
    const fetchPersonalStats = async () => {
      try {
        const [assignedRes, createdRes, projectsRes] = await Promise.all([
          api.get(`/tasks?assignedTo=${user._id}`),
          api.get(`/tasks?createdBy=${user._id}`),
          api.get('/projects')
        ]);
        
        setPersonalStats({
          assignedTasks: assignedRes.data.length,
          completedTasks: assignedRes.data.filter(t => t.status === 'Completed').length,
          createdTasks: createdRes.data.length,
          projectsCount: projectsRes.data.length
        });
      } catch (error) {
        console.error("Error fetching personal stats", error);
      }
    };
    if (user) fetchPersonalStats();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.put('/users/profile', formData);
      updateUser(data);
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const completionRate = personalStats.assignedTasks > 0 
    ? Math.round((personalStats.completedTasks / personalStats.assignedTasks) * 100) 
    : 0;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">My Profile</h1>
          <p className="text-textMuted">Manage your personal information and track your progress.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="glass-card p-8 text-center flex flex-col items-center">
            <div className="relative group mb-6">
              <img 
                src={user?.avatar || `https://ui-avatars.com/api/?name=${formData.name}&background=6366f1&color=fff&size=128`} 
                alt="Profile" 
                className="w-32 h-32 rounded-full border-4 border-primary/20 object-cover shadow-2xl"
              />
            </div>
            <h2 className="text-xl font-bold text-white mb-1">{user?.name}</h2>
            <p className="text-sm text-textMuted mb-4">{user?.email}</p>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${
              user?.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
            }`}>
              {user?.role}
            </span>

            <div className="w-full mt-8 pt-8 border-t border-white/5 space-y-4 text-left">
              <div className="flex items-center justify-between text-sm">
                <span className="text-textMuted">Account Status</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1 text-[10px]">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                  ACTIVE
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-textMuted">Member Since</span>
                <span className="text-white font-medium">{new Date(user?.createdAt || Date.now()).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {user?.role !== 'admin' && (
            <div className="glass-card p-6">
              <h3 className="text-sm font-bold text-white mb-4 uppercase tracking-widest text-primary">Efficiency</h3>
              <div className="relative w-32 h-32 mx-auto mb-4">
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle className="text-slate-700 stroke-current" strokeWidth="8" fill="transparent" r="40" cx="50" cy="50" />
                  <circle className="text-primary stroke-current" strokeWidth="8" strokeLinecap="round" fill="transparent" r="40" cx="50" cy="50" 
                    style={{ strokeDasharray: 251.2, strokeDashoffset: 251.2 - (251.2 * completionRate) / 100, transition: 'stroke-dashoffset 1s ease-in-out' }} 
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-white">{completionRate}%</span>
                </div>
              </div>
              <p className="text-center text-xs text-textMuted">Tasks completion rate</p>
            </div>
          )}
        </div>

        {/* Stats and Edit Form */}
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="glass-card p-4 text-center">
              <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center mx-auto mb-2">
                <Briefcase size={18} />
              </div>
              <p className="text-xl font-bold text-white">{personalStats.projectsCount}</p>
              <p className="text-[10px] text-textMuted uppercase tracking-wider">My Projects</p>
            </div>
            <div className="glass-card p-4 text-center">
              <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center mx-auto mb-2">
                <CheckSquare size={18} />
              </div>
              <p className="text-xl font-bold text-white">{personalStats.assignedTasks}</p>
              <p className="text-[10px] text-textMuted uppercase tracking-wider">Assigned to Me</p>
            </div>
            <div className="glass-card p-4 text-center">
              <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto mb-2">
                <Clock size={18} />
              </div>
              <p className="text-xl font-bold text-white">{personalStats.completedTasks}</p>
              <p className="text-[10px] text-textMuted uppercase tracking-wider">Completed by Me</p>
            </div>
            <div className="glass-card p-4 text-center">
              <div className="w-8 h-8 rounded-lg bg-orange-500/20 text-orange-400 flex items-center justify-center mx-auto mb-2">
                <LayoutDashboard size={18} />
              </div>
              <p className="text-xl font-bold text-white">{user?.role === 'admin' ? personalStats.createdTasks : personalStats.assignedTasks}</p>
              <p className="text-[10px] text-textMuted uppercase tracking-wider">{user?.role === 'admin' ? 'Tasks Created' : 'Total Workload'}</p>
            </div>
          </div>

          <div className="glass-card p-8">
            <h3 className="text-xl font-bold text-white mb-6">Edit Profile Settings</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-textMuted mb-2 flex items-center gap-2">
                    <User size={16} /> Name
                  </label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-field" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-textMuted mb-2 flex items-center gap-2">
                    <Mail size={16} /> Email Address
                  </label>
                  <input 
                    type="email" 
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input-field" 
                    required 
                  />
                </div>
              </div>
              
              <div className="pt-4 flex justify-end">
                <button 
                  type="submit" 
                  disabled={loading}
                  className="btn-primary px-8 flex items-center gap-2"
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
