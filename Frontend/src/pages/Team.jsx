import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { Shield, User, Loader2, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Team = () => {
  const { user: currentUser } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('/users');
      setUsers(data);
    } catch (error) {
      toast.error('Failed to fetch team members');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (targetUser, newRole) => {
    if (newRole === targetUser.role) return;
    try {
      await api.put(`/users/${targetUser._id}/role`, { role: newRole });
      toast.success(`Role updated for ${targetUser.name}`);
      setUsers(users.map(u => u._id === targetUser._id ? { ...u, role: newRole } : u));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update role');
    }
  };

  const handleDeleteUser = async (targetUser) => {
    if (!window.confirm(`Are you sure you want to remove ${targetUser.name} from the team?`)) return;
    try {
      await api.delete(`/users/${targetUser._id}`);
      toast.success('Team member removed');
      setUsers(users.filter(u => u._id !== targetUser._id));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete member');
    }
  };

  const isAdmin = currentUser?.role === 'admin';

  return (
    <div className="space-y-6 relative h-full flex flex-col">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">{isAdmin ? 'Team Management' : 'Team Members'}</h1>
        <p className="text-textMuted">{isAdmin ? 'Manage your team members and their roles.' : 'View your team and their roles.'}</p>
      </div>

      {loading ? (
        <div className="flex-1 flex justify-center items-center py-20"><Loader2 className="animate-spin text-primary" size={40} /></div>
      ) : (
        <div className="glass-card rounded-2xl overflow-x-auto border border-white/5">
          <table className="w-full text-left border-collapse min-w-[600px]">
            <thead>
              <tr className="bg-surface/50 border-b border-white/5">
                <th className="p-4 text-sm font-semibold text-textMuted uppercase tracking-wider">User</th>
                <th className="p-4 text-sm font-semibold text-textMuted uppercase tracking-wider">Email</th>
                <th className="p-4 text-sm font-semibold text-textMuted uppercase tracking-wider">Role</th>
                {isAdmin && <th className="p-4 text-sm font-semibold text-textMuted uppercase tracking-wider text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img src={u.avatar || `https://ui-avatars.com/api/?name=${u.name}`} alt="avatar" className="w-10 h-10 rounded-full border border-surface" />
                      <div>
                        <p className="text-white font-medium">{u.name}</p>
                        {u._id === currentUser._id && <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full mt-1 inline-block">You</span>}
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-textMuted">{u.email}</td>
                  <td className="p-4">
                    {isAdmin && u._id !== currentUser._id ? (
                      <select 
                        value={u.role}
                        onChange={(e) => handleRoleChange(u, e.target.value)}
                        className="bg-surface border border-white/10 text-white text-xs font-bold py-1 px-2 rounded-lg focus:outline-none focus:ring-1 ring-primary capitalize"
                      >
                        <option value="member">Member</option>
                        <option value="admin">Admin</option>
                      </select>
                    ) : (
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                        u.role === 'admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {u.role === 'admin' ? <Shield size={12} /> : <User size={12} />}
                        <span className="capitalize">{u.role}</span>
                      </span>
                    )}
                  </td>
                  {isAdmin && (
                    <td className="p-4 text-right">
                      {u._id !== currentUser._id && (
                        <button 
                          onClick={() => handleDeleteUser(u)}
                          className="p-2 hover:bg-red-500/10 rounded-lg text-textMuted hover:text-red-500 transition-all"
                          title="Remove Member"
                        >
                          <Trash2 size={16} />
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Team;
