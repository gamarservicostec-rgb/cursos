'use client';

import { useState, useEffect } from 'react';
import { api } from '@/services/api';

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
  const [recentEnrollments, setRecentEnrollments] = useState<any[]>([]);
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

      if (enrollments.status === 'fulfilled') {
        setRecentEnrollments(enrollments.value.slice(0, 5));
      }
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
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      gradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
      bgGlow: 'rgba(59, 130, 246, 0.1)',
    },
    {
      title: 'Cursos',
      value: stats.totalCourses,
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      gradient: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
      bgGlow: 'rgba(139, 92, 246, 0.1)',
    },
    {
      title: 'Turmas Ativas',
      value: stats.activeClasses,
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      ),
      gradient: 'linear-gradient(135deg, #d946ef, #a21caf)',
      bgGlow: 'rgba(217, 70, 239, 0.1)',
    },
    {
      title: 'Matrículas',
      value: stats.totalEnrollments,
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      gradient: 'linear-gradient(135deg, #10b981, #059669)',
      bgGlow: 'rgba(16, 185, 129, 0.1)',
    },
  ];

  const statusColors: Record<string, { bg: string; text: string; label: string }> = {
    PENDING_PAYMENT: { bg: 'rgba(245, 158, 11, 0.15)', text: '#fbbf24', label: 'Pend. Pagamento' },
    ACTIVE: { bg: 'rgba(34, 197, 94, 0.15)', text: '#4ade80', label: 'Ativa' },
    COMPLETED: { bg: 'rgba(59, 130, 246, 0.15)', text: '#60a5fa', label: 'Concluída' },
    CANCELLED: { bg: 'rgba(239, 68, 68, 0.15)', text: '#f87171', label: 'Cancelada' },
    EXPIRED: { bg: 'rgba(107, 114, 128, 0.15)', text: '#9ca3af', label: 'Expirada' },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <svg className="animate-spin h-8 w-8 text-blue-500" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-slate-400 mt-1">Visão geral da plataforma</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card, index) => (
          <div
            key={card.title}
            className="glass rounded-2xl p-6 card-hover relative overflow-hidden"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            {/* Background glow */}
            <div
              className="absolute -top-10 -right-10 w-32 h-32 rounded-full blur-3xl"
              style={{ backgroundColor: card.bgGlow }}
            />

            <div className="relative z-10 flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-400 font-medium">{card.title}</p>
                <p className="text-4xl font-bold text-white mt-2">{card.value}</p>
              </div>
              <div
                className="p-3 rounded-xl text-white"
                style={{ background: card.gradient }}
              >
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Enrollments */}
      <div className="glass rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-white">Matrículas Recentes</h2>
            <p className="text-sm text-slate-400 mt-0.5">Últimas matrículas realizadas</p>
          </div>
          <a
            href="/alunos"
            className="text-sm font-medium transition-colors hover:underline"
            style={{ color: 'rgb(96, 165, 250)' }}
          >
            Ver todas →
          </a>
        </div>

        {recentEnrollments.length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-slate-500">Nenhuma matrícula registrada ainda</p>
            <p className="text-sm text-slate-600 mt-1">As matrículas aparecerão aqui quando forem criadas</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700/50">
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider pb-3 px-2">Aluno</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider pb-3 px-2">Curso</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider pb-3 px-2">Status</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider pb-3 px-2">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {recentEnrollments.map((enrollment) => (
                  <tr key={enrollment.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                          style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}>
                          {enrollment.user?.name?.charAt(0).toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{enrollment.user?.name}</p>
                          <p className="text-xs text-slate-500">{enrollment.user?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <p className="text-sm text-slate-300">{enrollment.class?.course?.title || '—'}</p>
                    </td>
                    <td className="py-3 px-2">
                      <span
                        className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold"
                        style={{
                          backgroundColor: statusColors[enrollment.status]?.bg || 'rgba(107,114,128,0.15)',
                          color: statusColors[enrollment.status]?.text || '#9ca3af',
                        }}
                      >
                        {statusColors[enrollment.status]?.label || enrollment.status}
                      </span>
                    </td>
                    <td className="py-3 px-2 text-sm text-slate-400">
                      {new Date(enrollment.enrolledAt).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <a href="/cursos" className="glass rounded-2xl p-6 card-hover group" id="quick-action-courses">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl text-white" style={{ background: 'linear-gradient(135deg, #8b5cf6, #6d28d9)' }}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-white group-hover:text-blue-400 transition-colors">Novo Curso</p>
              <p className="text-xs text-slate-500">Criar curso e turmas</p>
            </div>
          </div>
        </a>

        <a href="/alunos" className="glass rounded-2xl p-6 card-hover group" id="quick-action-students">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl text-white" style={{ background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' }}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-white group-hover:text-blue-400 transition-colors">Novo Aluno</p>
              <p className="text-xs text-slate-500">Cadastrar aluno</p>
            </div>
          </div>
        </a>

        <a href="/turmas" className="glass rounded-2xl p-6 card-hover group" id="quick-action-classes">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl text-white" style={{ background: 'linear-gradient(135deg, #d946ef, #a21caf)' }}>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold text-white group-hover:text-blue-400 transition-colors">Nova Turma</p>
              <p className="text-xs text-slate-500">Abrir nova turma</p>
            </div>
          </div>
        </a>
      </div>
    </div>
  );
}
