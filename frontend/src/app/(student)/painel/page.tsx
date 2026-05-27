'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';

interface EnrollmentItem {
  id: number;
  status: string;
  enrolledAt: string;
  class: {
    id: number;
    name: string;
    startDate: string;
    endDate: string;
    schedule: string | null;
    course: {
      id: number;
      title: string;
      summary: string | null;
      duration: number | null;
      thumbnail: string | null;
    };
  };
}

export default function StudentPainelPage() {
  const { user, isAuthenticated, loading: authLoading, logout } = useAuth();
  const [enrollments, setEnrollments] = useState<EnrollmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }

    api.getMyEnrollments()
      .then((data) => {
        setEnrollments(data);
      })
      .catch((err) => {
        console.error('Erro ao carregar matrículas:', err);
        setError('Não foi possível carregar seus cursos.');
      })
      .finally(() => setLoading(false));
  }, [isAuthenticated, authLoading]);

  if (authLoading || loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <svg className="animate-spin h-10 w-10 text-yellow-500" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </main>
    );
  }

  const activeEnrollments = enrollments.filter(e => e.status === 'ACTIVE');

  return (
    <main className="min-h-screen">
      {/* Dynamic Student Header Navigation */}
      <nav className="fixed top-0 inset-x-0 z-50 glass border-b border-slate-700/40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <img src="/logos/logo.png" alt="Cursos GT Logo" className="w-13 h-13 object-contain drop-shadow-[0_0_15px_rgba(234,179,8,0.45)] transition-all hover:scale-105" />
            <span className="text-xl font-extrabold text-white tracking-tight">Cursos GT</span>
          </a>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-300 hidden sm:inline">Área do Aluno</span>
            <button
              onClick={logout}
              className="text-xs px-3 py-1.5 rounded-lg border border-slate-700/50 text-slate-400 hover:text-red-400 hover:bg-slate-800/40 transition-colors"
            >
              Sair
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 pt-24 pb-16">
        {/* Header/Greeting */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
          <div>
            <h1 className="text-3xl font-extrabold text-white">Olá, {user?.name}! 👋</h1>
            <p className="text-slate-400 mt-1">Bem-vindo à sua área de estudos. Pronto para aprender hoje?</p>
          </div>
          <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl glass border border-slate-700/40 text-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-slate-300">Conectado na Unidade Principal</span>
          </div>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {[
            { label: 'Cursos Ativos', value: activeEnrollments.length, icon: '📚', color: 'text-yellow-400' },
            { label: 'Frequência Média', value: '100%', icon: '📅', color: 'text-blue-400' },
            { label: 'Aulas Assistidas', value: '3 / 6', icon: '✅', color: 'text-green-400' },
          ].map((stat, i) => (
            <div key={i} className="glass rounded-2xl p-6 border border-slate-700/30 flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400 font-medium">{stat.label}</p>
                <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
              </div>
              <span className={`text-3xl ${stat.color}`}>{stat.icon}</span>
            </div>
          ))}
        </div>

        {/* Courses Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <h2 className="text-xl font-bold text-white">Meus Cursos Matriculados</h2>

            {activeEnrollments.length === 0 ? (
              <div className="glass rounded-2xl p-12 text-center border border-slate-700/20 animate-fade-in-up">
                <svg className="w-16 h-16 mx-auto text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <p className="text-slate-400 text-lg">Você ainda não possui matrículas ativas</p>
                <a href="/cursos" className="btn-primary mt-6 inline-block">Navegar pelos Cursos</a>
              </div>
            ) : (
              <div className="space-y-6">
                {activeEnrollments.map((enrollment) => {
                  const course = enrollment.class.course;
                  return (
                    <div key={enrollment.id} className="glass rounded-2xl overflow-hidden border border-slate-700/40 card-hover flex flex-col md:flex-row gap-6 p-6 animate-fade-in-up">
                      {/* Image placeholder / gradient */}
                      <div className="w-full md:w-48 h-32 rounded-xl flex-shrink-0 relative overflow-hidden"
                        style={{ background: 'linear-gradient(135deg, hsl(45, 65%, 25%), hsl(60, 50%, 15%))' }}>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-4xl">💻</span>
                        </div>
                      </div>

                      {/* Content details */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <span className="px-2.5 py-1 rounded-lg text-xs font-semibold"
                              style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80' }}>
                              Matrícula Ativa
                            </span>
                            <span className="text-xs text-slate-500">Adquirido em {new Date(enrollment.enrolledAt).toLocaleDateString('pt-BR')}</span>
                          </div>

                          <h3 className="text-xl font-bold text-white mt-2 group-hover:text-yellow-400 transition-colors">
                            {course.title}
                          </h3>
                          <p className="text-sm text-slate-400 mt-1">Turma: <strong className="text-slate-200">{enrollment.class.name}</strong></p>
                        </div>

                        {/* Progress Bar & CTA */}
                        <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex-1 max-w-[240px]">
                            <div className="flex justify-between text-xs text-slate-400 mb-1">
                              <span>Seu Progresso</span>
                              <span>50%</span>
                            </div>
                            <div className="h-2 rounded-full bg-slate-700">
                              <div className="h-2 rounded-full bg-yellow-500" style={{ width: '50%' }} />
                            </div>
                          </div>

                          <a
                            href={`/minhas-aulas?classId=${enrollment.class.id}`}
                            className="btn-primary !px-6 !py-2.5 text-center text-sm font-semibold whitespace-nowrap self-end sm:self-auto animate-pulse-glow"
                          >
                            Acessar Aulas
                          </a>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Sidebar: Profile & Notices */}
          <div className="space-y-6">
            {/* User Mini Card */}
            <div className="glass rounded-2xl p-6 border border-slate-700/40 text-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center font-bold text-3xl mx-auto mb-4"
                style={{ background: 'var(--gradient-primary)', color: '#0f172a' }}>
                {user?.name.charAt(0)}
              </div>
              <h3 className="font-bold text-white text-lg">{user?.name}</h3>
              <p className="text-xs text-slate-500 mt-0.5">{user?.email}</p>

              <div className="border-t border-slate-700/40 my-5" />

              <div className="space-y-2 text-left">
                <span className="block text-sm text-slate-400 py-1.5 px-3">
                  🏷️ Perfil: <strong>Aluno</strong>
                </span>
                <span className="block text-sm text-slate-400 py-1.5 px-3">
                  🔑 CPF: <strong>{user?.cpf || 'Não cadastrado'}</strong>
                </span>
              </div>
            </div>

            {/* School Alerts */}
            <div className="glass rounded-2xl p-6 border border-slate-700/40">
              <h3 className="font-bold text-white mb-3">📢 Avisos Importantes</h3>
              <div className="space-y-3 text-xs text-slate-400">
                <div className="p-3 rounded-xl border border-slate-700/30 bg-slate-800/25">
                  <strong className="text-yellow-400 block mb-1">Presença Presencial Obrigatória</strong>
                  Conecte-se ao Wi-Fi local da escola no seu dispositivo móvel ou laptop para validar seu token e desbloquear os vídeos das aulas.
                </div>
                <div className="p-3 rounded-xl border border-slate-700/30 bg-slate-800/25">
                  <strong className="text-slate-200 block mb-1">Dúvidas Frequentes</strong>
                  A presença é contabilizada no banco central assim que o check-in é concluído.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
