import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import ProjectCard from '../components/ProjectCard';
import { Plus, Search, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const Projects = () => {
  const { user } = useContext(AuthContext);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ title: '', description: '', deadline: '', status: 'Not Started' });

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const { data } = await api.get('/projects');
      setProjects(data);
    } catch (error) {
      toast.error('Failed to fetch projects');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = () => {
    setEditingProject(null);
    setFormData({ title: '', description: '', deadline: '', status: 'Not Started' });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (project) => {
    setEditingProject(project);
    setFormData({ 
      title: project.title, 
      description: project.description, 
      deadline: new Date(project.deadline).toISOString().slice(0, 16), 
      status: project.status 
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProject) {
        await api.put(`/projects/${editingProject._id}`, formData);
        toast.success('Project updated successfully');
      } else {
        await api.post('/projects', formData);
        toast.success('Project created successfully');
      }
      setIsModalOpen(false);
      fetchProjects();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('Are you sure you want to delete this project? All associated tasks will also be deleted.')) return;
    
    try {
      await api.delete(`/projects/${projectId}`);
      toast.success('Project deleted successfully');
      fetchProjects();
    } catch (error) {
      toast.error('Failed to delete project');
    }
  };

  const filteredProjects = projects.filter(p => p.title.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 relative">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Projects</h1>
          <p className="text-textMuted">Manage your team's projects here.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search projects..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10 py-2 w-64"
            />
          </div>
          {user?.role === 'admin' && (
            <button onClick={handleOpenCreateModal} className="btn-primary py-2 px-4 whitespace-nowrap">
              <Plus size={20} />
              New Project
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" size={40} /></div>
      ) : filteredProjects.length === 0 ? (
        <div className="glass-card p-12 flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mb-4">
            <Search size={32} className="text-slate-500" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No projects found</h3>
          <p className="text-textMuted max-w-sm">We couldn't find any projects matching your search. Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProjects.map(project => (
            <ProjectCard 
              key={project._id} 
              project={project} 
              onClick={() => navigate(`/app/tasks?project=${project._id}`)} 
              onDelete={user?.role === 'admin' ? () => handleDeleteProject(project._id) : null}
              onEdit={user?.role === 'admin' ? () => handleOpenEditModal(project) : null}
            />
          ))}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
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
              className="glass-card w-full max-w-lg p-6 relative"
            >
              <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-textMuted hover:text-white">
                <X size={24} />
              </button>
              <h2 className="text-2xl font-bold text-white mb-6">{editingProject ? 'Edit Project' : 'Create New Project'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-textMuted mb-1">Title</label>
                  <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="input-field" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-textMuted mb-1">Description</label>
                  <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="input-field min-h-[100px]" required></textarea>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-textMuted mb-1">Deadline & Time</label>
                    <input type="datetime-local" value={formData.deadline} onChange={e => setFormData({...formData, deadline: e.target.value})} className="input-field" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-textMuted mb-1">Status</label>
                    <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="input-field bg-slate-800">
                      <option value="Not Started">Not Started</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                    <p className="text-[10px] text-textMuted mt-1">
                      {formData.status === 'Not Started' && 'Planning phase. No work begun.'}
                      {formData.status === 'In Progress' && 'Active phase. Progress tracks completed tasks.'}
                      {formData.status === 'Completed' && 'Final phase. Mark as 100% done.'}
                    </p>
                  </div>
                </div>
                <button type="submit" className="btn-primary w-full mt-4">{editingProject ? 'Update Project' : 'Create Project'}</button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Projects;
