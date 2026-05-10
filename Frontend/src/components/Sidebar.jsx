import { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, FolderKanban, CheckSquare, LogOut, Users, User } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Sidebar = () => {
  const { user, logout } = useContext(AuthContext);

  const links = [
    { name: 'Dashboard', path: '/app/dashboard', icon: <LayoutDashboard size={20} /> },
    { name: 'Projects', path: '/app/projects', icon: <FolderKanban size={20} /> },
    { name: 'Tasks', path: '/app/tasks', icon: <CheckSquare size={20} /> },
  ];

  if (user?.role === 'admin') {
    links.push({ name: 'Team', path: '/app/team', icon: <Users size={20} /> });
  }

  return (
    <motion.aside 
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      className="w-64 bg-surface/80 backdrop-blur-xl border-r border-white/5 flex flex-col h-screen"
    >
      <div className="p-6">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
          TeamTask Pro
        </h1>
      </div>

      <div className="px-4 py-6 flex-1">
        <nav className="space-y-2">
          {links.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                  isActive
                    ? 'bg-primary/20 text-primary border border-primary/20'
                    : 'text-textMuted hover:bg-white/5 hover:text-white'
                }`
              }
            >
              {link.icon}
              <span className="font-medium">{link.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="p-4 border-t border-white/5">
        <Link 
          to="/app/profile"
          className="flex items-center gap-3 px-4 py-3 mb-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all cursor-pointer group"
        >
          <img 
            src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name}&background=random`} 
            alt="Avatar" 
            className="w-10 h-10 rounded-full object-cover group-hover:ring-2 ring-primary transition-all"
          />
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-white truncate group-hover:text-primary transition-colors">{user?.name}</p>
            <p className="text-xs text-textMuted capitalize truncate">{user?.role}</p>
          </div>
        </Link>

        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors font-medium"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </motion.aside>
  );
};

export default Sidebar;
