'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  BookOpen, 
  Layers, 
  Users, 
  TrendingUp, 
  LifeBuoy, 
  Settings, 
  LogOut,
  Menu,
  X
} from 'lucide-react';

const menuItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Cursos', href: '/gerenciar-cursos', icon: BookOpen },
  { label: 'Módulos', href: '/modulos', icon: Layers },
  { label: 'Usuários', href: '/alunos', icon: Users },
  { label: 'Analytics', href: '/analytics', icon: TrendingUp },
  { label: 'Suporte', href: '/suporte', icon: LifeBuoy },
  { label: 'Configurações', href: '/configuracoes', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, logout, loading, isAuthenticated, isAdmin } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [currentPath, setCurrentPath] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentPath(window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.href = '/login';
    }
  }, [loading, isAuthenticated]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#09090b]">
        <motion.div 
          animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-16 h-16 rounded-full border-4 border-yellow-500 border-t-transparent animate-spin"
        />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen flex bg-[#09090b] text-slate-100 overflow-hidden relative">
      {/* Luzes de Fundo para profundidade */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-yellow-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[30%] h-[50%] rounded-full bg-amber-700/10 blur-[120px] pointer-events-none" />

      {/* Overlay Mobile */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar Flutuante Premium */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 transform transition-transform duration-300 ease-out lg:translate-x-0 flex flex-col p-4 w-72 h-screen ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="glass-panel flex-1 rounded-[2rem] flex flex-col overflow-hidden relative shadow-[0_0_40px_rgba(234,179,8,0.05)] border border-white/5">
          <div className="flex items-center gap-4 px-6 py-8">
            <img src="/logos/logo.png" alt="Cursos GT Logo" className="w-14 h-14 object-contain drop-shadow-[0_0_15px_rgba(234,179,8,0.5)] transition-all hover:scale-105" />
            <div className="flex flex-col">
              <span className="font-extrabold text-xl tracking-tight text-white leading-none">Cursos GT</span>
              <span className="text-[10px] text-yellow-500/80 uppercase tracking-widest font-extrabold mt-1">Admin</span>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-2 space-y-2 overflow-y-auto custom-scrollbar">
            {menuItems.map((item) => {
              const isActive = currentPath === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative block"
                >
                  <motion.div
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className={`flex items-center gap-4 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300 ${
                      isActive 
                        ? 'text-yellow-400 bg-white/5 border border-yellow-500/30 shadow-[0_0_20px_rgba(234,179,8,0.15)]' 
                        : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-yellow-400' : 'text-slate-500'}`} />
                    {item.label}
                    {isActive && (
                      <motion.div 
                        layoutId="active-indicator"
                        className="absolute right-4 w-1.5 h-1.5 rounded-full bg-yellow-400 shadow-[0_0_10px_rgba(234,179,8,0.8)]"
                      />
                    )}
                  </motion.div>
                </Link>
              );
            })}
          </nav>

          {/* User Profile */}
          <div className="p-4 mt-auto">
            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-yellow-400 to-amber-600 p-[2px]">
                <div className="w-full h-full rounded-full bg-[#18181b] flex items-center justify-center text-yellow-500 font-bold">
                  {user?.name?.charAt(0).toUpperCase() || 'A'}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-white truncate">{user?.name}</p>
                <p className="text-xs text-slate-400 truncate">{user?.email}</p>
              </div>
              <button 
                onClick={logout}
                className="p-2 text-slate-500 hover:text-red-400 transition-colors rounded-xl hover:bg-red-400/10"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-h-screen p-4 lg:pl-0 z-10">
        <div className="flex-1 flex flex-col relative">
          
          {/* Top Header */}
          <header className="h-20 flex items-center justify-between px-4 lg:px-8">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl glass-panel text-slate-400"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Admin Overview</h1>
                <p className="text-sm text-slate-400">Gerenciamento completo da plataforma</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="glass-panel px-4 py-2 rounded-full flex items-center gap-2 border border-yellow-500/20">
                <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse shadow-[0_0_10px_rgba(234,179,8,0.8)]" />
                <span className="text-sm font-medium text-yellow-400 text-gold-gradient">
                  {isAdmin ? 'Administrador' : 'Equipe'}
                </span>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <div className="flex-1 overflow-x-hidden p-4 lg:px-8 pb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {children}
            </motion.div>
          </div>
        </div>
      </main>
    </div>
  );
}
