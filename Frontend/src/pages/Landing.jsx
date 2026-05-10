import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LayoutDashboard, CheckSquare, Users, Shield, ArrowRight, Zap, Globe, BarChart3 } from 'lucide-react';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Landing = () => {
  const { user } = useContext(AuthContext);

  const features = [
    {
      title: 'Kanban Board',
      description: 'Visualize your workflow and move tasks through customizable stages with ease.',
      icon: <LayoutDashboard className="text-primary" size={24} />,
    },
    {
      title: 'Role-Based Access',
      description: 'Secure your organization with strict Admin and Member permissions.',
      icon: <Shield className="text-primary" size={24} />,
    },
    {
      title: 'Team Management',
      description: 'Easily manage members, assign roles, and track individual performance.',
      icon: <Users className="text-primary" size={24} />,
    },
    {
      title: 'Productivity Analytics',
      description: 'Get real-time insights into team velocity and project growth metrics.',
      icon: <BarChart3 className="text-primary" size={24} />,
    },
  ];

  return (
    <div className="min-h-screen bg-background text-white selection:bg-primary/30">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/20 rounded-lg border border-primary/20">
              <CheckSquare className="text-primary" size={24} />
            </div>
            <span className="text-xl font-bold tracking-tight">TeamTask <span className="text-primary">Pro</span></span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-textMuted">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#about" className="hover:text-white transition-colors">About</a>
            <a href="#contact" className="hover:text-white transition-colors">Contact</a>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/login" className="text-sm font-medium hover:text-primary transition-colors">Sign In</Link>
            <Link to="/register" className="btn-primary px-6 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-primary/20">
              Sign Up
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-4 relative overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-primary/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] bg-purple-600/10 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <span className="px-4 py-2 bg-primary/10 text-primary border border-primary/20 rounded-full text-xs font-bold uppercase tracking-widest mb-6 inline-block">
              Scale your productivity
            </span>
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight bg-gradient-to-b from-white to-white/60 bg-clip-text text-transparent leading-[1.1]">
              Elevate Your Workflow. <br /> <span className="text-primary italic">Unify</span> Your Team.
            </h1>
            <p className="text-lg md:text-xl text-textMuted max-w-2xl mx-auto mb-10 leading-relaxed">
              Experience a new standard of project management. Built for high-performance teams that demand speed, security, and absolute clarity in every task.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register" className="btn-primary px-10 py-4 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20 flex items-center gap-3 w-full sm:w-auto">
                Get Started Now <Zap size={20} />
              </Link>
              <a href="#features" className="px-10 py-4 rounded-2xl text-lg font-bold bg-white/5 border border-white/10 hover:bg-white/10 transition-all w-full sm:w-auto">
                Explore Features
              </a>
            </div>
          </motion.div>

          {/* Hero Image / Mockup */}
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mt-8 relative max-w-3xl mx-auto px-4"
          >
            <div className="glass-card p-1 rounded-[1rem] border border-white/10 shadow-2xl overflow-hidden group">
              <img 
                src="/dashboard_mockup.png" 
                alt="Team Collaboration" 
                className="w-full h-auto rounded-[0.9rem] opacity-90 group-hover:scale-[1.005] transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-40"></div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 px-4 bg-surface/30 relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Built for Human Collaboration</h2>
            <p className="text-textMuted max-w-xl mx-auto">Empower your team with a platform designed for clarity, speed, and pleasant interaction.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-8 hover:border-primary/50 transition-colors"
              >
                <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 border border-primary/20">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-sm text-textMuted leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof / Stats */}
      <section className="py-24 px-4 border-y border-white/5 bg-background relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">Powering productivity for modern teams worldwide</h2>
          <p className="text-textMuted text-sm font-medium uppercase tracking-[0.2em]">
            Used by startups, developers, and high-performance teams
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="py-20 px-4 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between gap-10">
          <div className="max-w-xs">
            <div className="flex items-center gap-2 mb-6 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
              <div className="p-1.5 bg-primary rounded-lg">
                <CheckSquare className="text-white" size={20} />
              </div>
              <span className="text-lg font-bold">TeamTask Pro</span>
            </div>
            <p className="text-sm text-textMuted leading-relaxed mb-6">
              Empowering the world's most innovative teams to deliver their best work, faster and more securely than ever before.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-10 text-sm">
            <div className="space-y-4">
              <h4 className="font-bold text-white">Product</h4>
              <ul className="space-y-2 text-textMuted">
                {['Product Features', 'Integrations', 'Pricing'].map(item => (
                  <li key={item}><button onClick={() => toast.success(`${item} coming soon!`)} className="hover:text-primary transition-colors">{item}</button></li>
                ))}
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-bold text-white">Company</h4>
              <ul className="space-y-2 text-textMuted">
                {['About Us', 'Careers', 'Contact'].map(item => (
                  <li key={item}><button onClick={() => toast.success(`${item} coming soon!`)} className="hover:text-primary transition-colors">{item}</button></li>
                ))}
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-bold text-white">Support</h4>
              <ul className="space-y-2 text-textMuted">
                {['Help Center', 'Privacy', 'Terms'].map(item => (
                  <li key={item}><button onClick={() => toast.success(`${item} coming soon!`)} className="hover:text-primary transition-colors">{item}</button></li>
                ))}
              </ul>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-20 pt-10 border-t border-white/5 text-center text-xs text-textMuted">
          © 2026 TeamTask Pro. All rights reserved. Designed for excellence.
        </div>
      </footer>
    </div>
  );
};

export default Landing;
