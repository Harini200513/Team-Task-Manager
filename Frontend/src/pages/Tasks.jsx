import { useState, useEffect, useContext } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import TaskCard from '../components/TaskCard';
import { Plus, X, Loader2, LayoutGrid, User, Calendar, Tag, Info, MessageSquare, Send, Clock, Edit2, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const COLUMNS = ['Todo', 'In Progress', 'Completed'];

const Tasks = () => {
  const { user } = useContext(AuthContext);
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const projectIdParam = searchParams.get('project');
  const statusParam = searchParams.get('status');
  
  const [formData, setFormData] = useState({
    title: '', description: '', priority: 'Medium', status: 'Todo',
    assignedTo: '', project: '', dueDate: ''
  });
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [commentText, setCommentText] = useState('');

  useEffect(() => {
    fetchData();
  }, [projectIdParam, statusParam]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    try {
      const { data } = await api.post(`/tasks/${selectedTask._id}/comments`, { text: commentText });
      setSelectedTask({ ...selectedTask, comments: data });
      setCommentText('');
      toast.success('Progress updated');
      fetchData(); // Refresh main list
    } catch (error) {
      toast.error('Failed to add comment');
    }
  };

  const fetchData = async () => {
    try {
      let tasksUrl = '/tasks?';
      if (projectIdParam) tasksUrl += `projectId=${projectIdParam}&`;
      if (statusParam) tasksUrl += `status=${statusParam}&`;

      const [tasksRes, projectsRes, usersRes] = await Promise.all([
        api.get(tasksUrl),
        api.get('/projects'),
        api.get('/users')
      ]);
      setTasks(tasksRes.data);
      setProjects(projectsRes.data);
      setUsers(usersRes.data);
      
      if (projectIdParam) {
        setFormData(prev => ({ ...prev, project: projectIdParam }));
      } else if (projectsRes.data.length > 0) {
        setFormData(prev => ({ ...prev, project: projectsRes.data[0]._id }));
      }
      
      if (usersRes.data.length > 0) setFormData(prev => ({ ...prev, assignedTo: usersRes.data[0]._id }));
      
    } catch (error) {
      toast.error('Failed to load tasks data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      if (editingTaskId) {
        await api.put(`/tasks/${editingTaskId}`, formData);
        toast.success('Task updated successfully');
      } else {
        await api.post('/tasks', formData);
        toast.success('Task created successfully');
      }
      setIsModalOpen(false);
      setEditingTaskId(null);
      setFormData({ ...formData, title: '', description: '', dueDate: '' });
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to save task');
    }
  };

  const updateTaskStatus = async (taskId, newStatus) => {
    try {
      setTasks(tasks.map(t => t._id === taskId ? { ...t, status: newStatus } : t));
      await api.patch(`/tasks/status/${taskId}`, { status: newStatus });
      toast.success('Task status updated');
    } catch (error) {
      fetchData(); // revert
      toast.error('Failed to update status');
    }
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    try {
      await api.delete(`/tasks/${taskId}`);
      toast.success('Task deleted successfully');
      setSelectedTask(null);
      fetchData();
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Kanban Board</h1>
          <p className="text-textMuted">Track and update task progress.</p>
        </div>
        <div className="flex items-center gap-4">
          <select 
            value={projectIdParam || ''} 
            onChange={(e) => {
              const newParams = {};
              if (e.target.value) newParams.project = e.target.value;
              if (statusParam) newParams.status = statusParam;
              setSearchParams(newParams);
            }}
            className="input-field bg-surface/50 border-white/10"
          >
            <option value="">All Projects</option>
            {projects.map(p => (
              <option key={p._id} value={p._id}>{p.title}</option>
            ))}
          </select>

          {user?.role === 'admin' && (
            <button onClick={() => setIsModalOpen(true)} className="btn-primary py-2 px-4 whitespace-nowrap">
              <Plus size={20} />
              New Task
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex-1 flex justify-center py-20"><Loader2 className="animate-spin text-primary" size={40} /></div>
      ) : (
        <div className="flex-1 flex gap-6 overflow-x-auto pb-4 snap-x">
          {COLUMNS.map(column => (
            <div key={column} className="bg-surface/40 border border-white/5 rounded-2xl flex flex-col min-w-[300px] w-[300px] md:w-auto md:flex-1 shrink-0 snap-center">
              <div className="p-4 border-b border-white/5 flex items-center justify-between">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <LayoutGrid size={16} className="text-primary" />
                  {column}
                </h3>
                <span className="bg-slate-800 text-xs font-bold px-2 py-1 rounded-lg text-textMuted">
                  {tasks.filter(t => t.status === column).length}
                </span>
              </div>
              <div className="p-4 flex-1 space-y-4 overflow-y-auto">
                {tasks.filter(t => t.status === column).map(task => (
                  <div key={task._id} className="relative group">
                    <TaskCard 
                      task={task} 
                      onClick={() => setSelectedTask(task)}
                      isDraggable={user.role === 'admin' || task.assignedTo?._id === user._id}
                    />
                    {/* Inline Status Changer */}
                    {(user.role === 'admin' || task.assignedTo?._id === user._id) && (
                      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col gap-1 bg-surface/90 p-1 rounded backdrop-blur border border-white/10 z-10">
                        {COLUMNS.filter(c => c !== column).map(c => (
                          <button key={c} onClick={(e) => { e.stopPropagation(); updateTaskStatus(task._id, c); }} className="text-[10px] bg-white/5 hover:bg-white/10 px-2 py-1 rounded text-white text-left">
                            Move to {c}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {tasks.filter(t => t.status === column).length === 0 && (
                  <div className="border-2 border-dashed border-white/5 rounded-xl h-24 flex items-center justify-center text-textMuted text-sm">
                    No tasks here
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Task Details Modal */}
      <AnimatePresence>
        {selectedTask && (
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
              <div className="absolute top-4 right-4 flex items-center gap-2">
                {user.role === 'admin' && (
                  <>
                    <button 
                      onClick={() => {
                        setFormData({
                          title: selectedTask.title,
                          description: selectedTask.description,
                          priority: selectedTask.priority,
                          status: selectedTask.status,
                          assignedTo: selectedTask.assignedTo?._id,
                          project: selectedTask.project?._id,
                          dueDate: new Date(selectedTask.dueDate).toISOString().slice(0, 16)
                        });
                        setIsModalOpen(true);
                        // We'll use a separate state to track if we are editing
                        setEditingTaskId(selectedTask._id);
                        setSelectedTask(null);
                      }}
                      className="p-2 text-textMuted hover:text-primary hover:bg-white/5 rounded-lg transition-all"
                      title="Edit Task"
                    >
                      <Edit2 size={20} />
                    </button>
                    <button 
                      onClick={() => handleDeleteTask(selectedTask._id)}
                      className="p-2 text-textMuted hover:text-red-500 hover:bg-white/5 rounded-lg transition-all"
                      title="Delete Task"
                    >
                      <Trash2 size={20} />
                    </button>
                  </>
                )}
                <button onClick={() => setSelectedTask(null)} className="p-2 text-textMuted hover:text-white hover:bg-white/5 rounded-lg transition-all">
                  <X size={24} />
                </button>
              </div>
              
              <div className="mb-6 pr-20">
                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-primary/20 text-primary border border-primary/20`}>
                  {selectedTask.priority} Priority
                </span>
                <h2 className="text-2xl font-bold text-white mt-3">{selectedTask.title}</h2>
                <p className="text-textMuted mt-2">{selectedTask.description}</p>
              </div>

              <div className="space-y-4 border-t border-white/5 pt-4">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-primary">
                    <User size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] text-textMuted uppercase font-bold tracking-wider">Assigned To</p>
                    <div className="flex items-center gap-2 mt-1">
                      <img 
                        src={selectedTask.assignedTo?.avatar || `https://ui-avatars.com/api/?name=${selectedTask.assignedTo?.name}`} 
                        alt="avatar" 
                        className="w-5 h-5 rounded-full" 
                      />
                      <p className="text-white text-sm font-medium">{selectedTask.assignedTo?.name || 'Unassigned'}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-primary">
                    <Calendar size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] text-textMuted uppercase font-bold tracking-wider">Due Date</p>
                    <p className="text-white text-sm font-medium mt-1">{new Date(selectedTask.dueDate).toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-primary">
                    <Tag size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] text-textMuted uppercase font-bold tracking-wider">Project</p>
                    <p className="text-white text-sm font-medium mt-1">{selectedTask.project?.title || 'No Project'}</p>
                  </div>
                </div>
              </div>

              {/* Progress Updates / Comments Section */}
              <div className="mt-8 border-t border-white/5 pt-6">
                <h3 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
                  <MessageSquare size={16} className="text-primary" />
                  Progress Updates
                </h3>
                
                <div className="space-y-4 max-h-[200px] overflow-y-auto mb-6 pr-2 custom-scrollbar">
                  {selectedTask.comments?.length > 0 ? (
                    selectedTask.comments.map((comment, i) => (
                      <div key={i} className="flex gap-3">
                        <img 
                          src={comment.user?.avatar || `https://ui-avatars.com/api/?name=${comment.user?.name}`} 
                          alt="user" 
                          className="w-6 h-6 rounded-full shrink-0" 
                        />
                        <div className="flex-1 bg-white/5 p-2 rounded-lg">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] font-bold text-white">{comment.user?.name}</span>
                            <span className="text-[8px] text-textMuted flex items-center gap-1">
                              <Clock size={8} />
                              {new Date(comment.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-xs text-textMuted">{comment.text}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 bg-white/[0.02] rounded-xl border border-dashed border-white/5">
                      <p className="text-xs text-textMuted">No progress updates yet.</p>
                    </div>
                  )}
                </div>

                <form onSubmit={handleAddComment} className="relative">
                  <input 
                    type="text" 
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="Update progress..." 
                    className="input-field pr-12 text-sm bg-surface/50 border-white/5"
                  />
                  <button 
                    type="submit" 
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-primary hover:text-white transition-colors"
                  >
                    <Send size={18} />
                  </button>
                </form>
              </div>

              <button 
                onClick={() => setSelectedTask(null)}
                className="btn-primary w-full mt-8"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Task Creation Modal */}
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
              className="glass-card w-full max-w-lg p-6 relative max-h-[90vh] overflow-y-auto"
            >
              <button 
                onClick={() => {
                  setIsModalOpen(false);
                  setEditingTaskId(null);
                }} 
                className="absolute top-4 right-4 text-textMuted hover:text-white"
              >
                <X size={24} />
              </button>
              <h2 className="text-2xl font-bold text-white mb-6">{editingTaskId ? 'Edit Task' : 'Create New Task'}</h2>
              <form onSubmit={handleCreateTask} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-textMuted mb-1">Title</label>
                  <input type="text" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="input-field" required />
                </div>
                <div>
                  <label className="block text-sm font-medium text-textMuted mb-1">Description</label>
                  <textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="input-field min-h-[80px]" required></textarea>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-textMuted mb-1">Project</label>
                    <select value={formData.project} onChange={e => setFormData({...formData, project: e.target.value})} className="input-field bg-slate-800" required>
                      {projects.map(p => <option key={p._id} value={p._id}>{p.title}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-textMuted mb-1">Assign To</label>
                    <select value={formData.assignedTo} onChange={e => setFormData({...formData, assignedTo: e.target.value})} className="input-field bg-slate-800" required>
                      {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-textMuted mb-1">Priority</label>
                    <select value={formData.priority} onChange={e => setFormData({...formData, priority: e.target.value})} className="input-field bg-slate-800">
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-textMuted mb-1">Due Date & Time</label>
                    <input type="datetime-local" value={formData.dueDate} onChange={e => setFormData({...formData, dueDate: e.target.value})} className="input-field" required />
                  </div>
                </div>
                <button type="submit" className="btn-primary w-full mt-4">
                  {editingTaskId ? 'Update Task' : 'Create Task'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Tasks;
