'use client';

import { useState, useEffect } from 'react';
import { api } from '@/services/api';
import { motion } from 'framer-motion';
import { Users, BookOpen, Layers, DollarSign, Plus, Settings, PlayCircle, MoreHorizontal } from 'lucide-react';

interface DashboardStats {
  totalStudents: number;
  totalCourses: number;
  totalEnrollments: number;
  activeClasses: number;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalCourses: 0,
    totalEnrollments: 0,
    activeClasses: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [users, courses, classes, enrollments] = await Promise.allSettled([
        api.getUsers(),
        api.getCourses(),
        api.getClasses(),
        api.getEnrollments(),
      ]);

      setStats({
        totalStudents: users.status === 'fulfilled' ? users.value.filter((u: any) => u.role === 'STUDENT').length : 0,
        totalCourses: courses.status === 'fulfilled' ? courses.value.length : 0,
        activeClasses: classes.status === 'fulfilled' ? classes.value.filter((c: any) => c.status === 'SCHEDULED' || c.status === 'IN_PROGRESS').length : 0,
        totalEnrollments: enrollments.status === 'fulfilled' ? enrollments.value.length : 0,
      });
    } catch (err) {
      console.error('Erro ao carregar dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Alunos',
      value: stats.totalStudents,
      icon: Users,
    },
    {
      title: 'Cursos',
      value: stats.totalCourses,
      icon: BookOpen,
    },
    {
      title: 'Turmas',
      value: stats.activeClasses,
      icon: Layers,
    },
    {
      title: 'Matrículas',
      value: stats.totalEnrollments,
      icon: DollarSign,
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <motion.div 
          animate={{ scale: [0.9, 1.1, 0.9], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-12 h-12 rounded-full border-4 border-yellow-500 border-t-transparent animate-spin"
        />
      </div>
    );
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 tracking-tight">
            Gestão de Cursos
          </h2>
          <p className="text-slate-400 mt-1 text-sm font-medium">Visão geral do LMS e métricas principais</p>
        </div>
        <button className="btn-gold flex items-center gap-2 neon-border w-fit">
          <Plus className="w-5 h-5" />
          Criar Novo Curso
        </button>
      </div>

      {/* Metrics Grid */}
      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.title}
              variants={item}
              className="glass-card rounded-[2rem] p-6 relative overflow-hidden group"
            >
              {/* Glow Background Hover Effect */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-yellow-500/20 rounded-full blur-[50px] group-hover:bg-yellow-400/30 transition-colors duration-500" />
              
              <div className="relative z-10 flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <p className="text-slate-400 font-medium text-sm">{card.title}</p>
                  <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.1)] group-hover:shadow-[0_0_20px_rgba(234,179,8,0.3)] transition-shadow">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                <div className="flex items-end gap-3">
                  <h3 className="text-4xl font-black text-white tracking-tight">
                    {card.value.toLocaleString()}
                  </h3>
                </div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Main Content Area (Course List Example similar to mock) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (Course List) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-white">Cursos Ativos</h3>
            <button className="text-sm font-medium text-yellow-500 hover:text-yellow-400 flex items-center gap-1">
              Ver todos
            </button>
          </div>

          {/* Dummy Course Cards representing the UI from the prompt image */}
          {[
            { name: "Design Gráfico Profissional", students: "1.2K", status: "Publicado", color: "from-blue-500 to-cyan-400" },
            { name: "Formação Full-Stack", students: "850", status: "Rascunho", color: "from-purple-500 to-pink-500" },
            { name: "Marketing Digital EAD", students: "3.4K", status: "Publicado", color: "from-yellow-400 to-orange-500" }
          ].map((course, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 + (idx * 0.1) }}
              className="glass-card rounded-2xl p-4 flex items-center gap-4 group cursor-pointer"
            >
              {/* Course Icon */}
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${course.color} p-[1px] shadow-lg`}>
                <div className="w-full h-full rounded-xl bg-[#18181b] flex items-center justify-center">
                  <BookOpen className="w-6 h-6 text-white/80" />
                </div>
              </div>
              
              {/* Details */}
              <div className="flex-1">
                <h4 className="font-bold text-white text-lg group-hover:text-yellow-400 transition-colors">{course.name}</h4>
                <div className="flex items-center gap-4 text-sm text-slate-400 mt-1">
                  <span>12 Módulos</span>
                  <span className="w-1 h-1 rounded-full bg-slate-600" />
                  <span>{course.students} Alunos</span>
                </div>
                
                {/* Progress Bar visual */}
                <div className="w-full h-1.5 bg-black/40 rounded-full mt-3 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-yellow-500 to-amber-500 rounded-full w-[70%]" />
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col items-end justify-between self-stretch">
                <div className="flex items-center gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                    course.status === 'Publicado' 
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>
                    {course.status}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-2 text-slate-400 hover:text-white transition-colors">
                    <Settings className="w-4 h-4" />
                  </button>
                  <button className="p-2 text-slate-400 hover:text-white transition-colors">
                    <MoreHorizontal className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Right Column (Floating Widget) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          className="relative"
        >
          {/* A floating glass card representing the video player from the mockup */}
          <div className="glass-panel rounded-3xl p-5 sticky top-24 shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-yellow-500/20">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[10px] font-bold tracking-widest text-yellow-500 uppercase">AULA ATUAL</span>
                <h4 className="font-bold text-white leading-tight mt-1">Introdução ao Design Gráfico</h4>
              </div>
              <button className="p-1.5 bg-white/5 rounded-lg text-slate-400 hover:text-white">
                <MoreHorizontal className="w-4 h-4" />
              </button>
            </div>
            
            {/* Video Placeholder */}
            <div className="w-full aspect-video rounded-2xl bg-black/60 relative overflow-hidden group cursor-pointer border border-white/5">
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent z-10" />
              
              {/* Play Button */}
              <div className="absolute inset-0 flex items-center justify-center z-20">
                <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center backdrop-blur-md border border-yellow-400/50 group-hover:scale-110 transition-transform shadow-[0_0_20px_rgba(234,179,8,0.4)]">
                  <PlayCircle className="w-6 h-6 text-yellow-400 ml-1" />
                </div>
              </div>

              {/* Controls */}
              <div className="absolute bottom-3 left-3 right-3 z-20 flex items-center gap-3">
                <div className="h-1 flex-1 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full bg-yellow-400 w-1/3 shadow-[0_0_10px_rgba(234,179,8,1)]" />
                </div>
                <span className="text-xs font-medium text-white">12:40</span>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-xs font-medium text-slate-400">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
                Status: Online
              </div>
              <span>Tipo: Vídeo</span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
