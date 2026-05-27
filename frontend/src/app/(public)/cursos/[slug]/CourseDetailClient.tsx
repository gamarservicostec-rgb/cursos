'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { api } from '@/services/api';

interface CourseDetail {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  summary: string | null;
  price: number;
  duration: number | null;
  thumbnail: string | null;
  status: string;
  classes: ClassItem[];
}

interface ClassItem {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  schedule: string | null;
  maxStudents: number;
  status: string;
  _count?: { enrollments: number };
}

export default function CourseDetailClient() {
  const params = useParams();
  const slug = params?.slug as string;
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!slug) return;
    api.getCourse(slug)
      .then((data) => setCourse(data))
      .catch((err) => setError(err.message || 'Curso não encontrado'))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <svg className="animate-spin h-10 w-10 text-yellow-500" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </main>
    );
  }

  if (error || !course) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">Curso não encontrado</h1>
          <p className="text-slate-400 mb-8">{error || 'O curso que você procura não está disponível.'}</p>
          <a href="/cursos" className="btn-primary">Ver todos os cursos</a>
        </div>
      </main>
    );
  }

  const availableClasses = course.classes.filter(
    (c) => c.status === 'SCHEDULED' || c.status === 'IN_PROGRESS'
  );

  return (
    <main className="min-h-screen">
      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 glass border-b border-slate-700/40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <img src="/logos/logo.png" alt="Cursos GT Logo" className="w-13 h-13 object-contain drop-shadow-[0_0_15px_rgba(234,179,8,0.45)] transition-all hover:scale-105" />
            <span className="text-xl font-extrabold text-white tracking-tight">Cursos GT</span>
          </a>
          <div className="flex items-center gap-3">
            <a href="/cursos" className="text-sm text-slate-300 hover:text-white transition-colors px-3 py-2">Cursos</a>
            <a href="/login" className="text-sm text-slate-300 hover:text-white transition-colors px-3 py-2">Entrar</a>
            <a href="/register" className="btn-primary text-sm !px-5 !py-2">Começar</a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-24 pb-0 relative overflow-hidden">
        <div className="h-72 relative"
          style={{ background: 'linear-gradient(135deg, hsl(40, 70%, 20%), hsl(50, 60%, 10%))' }}>
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="w-32 h-32 text-white/10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={0.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          {/* Breadcrumb */}
          <div className="absolute bottom-0 left-0 right-0">
            <div className="max-w-7xl mx-auto px-6 py-4">
              <nav className="flex items-center gap-2 text-sm text-slate-400">
                <a href="/" className="hover:text-white transition-colors">Início</a>
                <span>›</span>
                <a href="/cursos" className="hover:text-white transition-colors">Cursos</a>
                <span>›</span>
                <span className="text-slate-200">{course.title}</span>
              </nav>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2 space-y-8">
              <div className="animate-fade-in-up">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">{course.title}</h1>

                {course.summary && (
                  <p className="text-lg text-slate-300 leading-relaxed">{course.summary}</p>
                )}

                {/* Meta badges */}
                <div className="flex flex-wrap items-center gap-3 mt-6">
                  {course.duration && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm glass">
                      <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="text-slate-300">{course.duration} horas</span>
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm glass">
                    <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-slate-300">{availableClasses.length} turma(s) aberta(s)</span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm glass">
                    <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                    <span className="text-slate-300">Certificado incluso</span>
                  </span>
                </div>
              </div>

              {/* Description */}
              {course.description && (
                <div className="glass rounded-2xl p-8 animate-fade-in-up-delay-1">
                  <h2 className="text-xl font-bold text-white mb-4">Sobre o Curso</h2>
                  <div className="text-slate-300 leading-relaxed whitespace-pre-line">
                    {course.description}
                  </div>
                </div>
              )}

              {/* Available classes */}
              {availableClasses.length > 0 && (
                <div className="glass rounded-2xl p-8 animate-fade-in-up-delay-2">
                  <h2 className="text-xl font-bold text-white mb-6">Turmas Disponíveis</h2>
                  <div className="space-y-4">
                    {availableClasses.map((cls) => (
                      <div key={cls.id} className="p-5 rounded-xl border border-slate-700/50 hover:border-yellow-500/30 transition-all group"
                        style={{ background: 'rgba(15, 23, 42, 0.5)' }}>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div>
                            <h3 className="font-semibold text-white">{cls.name}</h3>
                            <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-slate-400">
                              <span className="flex items-center gap-1.5">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {new Date(cls.startDate).toLocaleDateString('pt-BR')} — {new Date(cls.endDate).toLocaleDateString('pt-BR')}
                              </span>
                              {cls.schedule && (
                                <span className="flex items-center gap-1.5">
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  {cls.schedule}
                                </span>
                              )}
                            </div>
                          </div>
                          <span className="inline-flex px-3 py-1.5 rounded-xl text-xs font-semibold"
                            style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#4ade80' }}>
                            Vagas abertas
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="glass rounded-2xl p-8 sticky top-24 animate-fade-in-up-delay-1">
                <div className="text-center mb-6">
                  <p className="text-sm text-slate-400 mb-1">Investimento</p>
                  <p className="text-4xl font-bold gradient-text">
                    {course.price > 0 ? `R$ ${course.price.toFixed(2)}` : 'Gratuito'}
                  </p>
                  {course.price > 0 && (
                    <p className="text-xs text-slate-500 mt-1">Parcele em até 12x</p>
                  )}
                </div>

                <div className="space-y-3 mb-8">
                  {[
                    { icon: '✓', text: 'Certificado reconhecido' },
                    { icon: '✓', text: 'Material incluso' },
                    { icon: '✓', text: 'Suporte ao aluno' },
                    { icon: '✓', text: 'Presença controlada' },
                  ].map((item) => (
                    <div key={item.text} className="flex items-center gap-3">
                      <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-green-400"
                        style={{ background: 'rgba(34, 197, 94, 0.15)' }}>
                        {item.icon}
                      </span>
                      <span className="text-sm text-slate-300">{item.text}</span>
                    </div>
                  ))}
                </div>

                {availableClasses.length > 0 ? (
                  <a
                    href={`/checkout/${availableClasses[0].id}`}
                    className="btn-primary w-full text-center block text-lg !py-4"
                    id="cta-course-enroll"
                  >
                    Matricular-se Agora
                  </a>
                ) : (
                  <button
                    disabled
                    className="w-full text-center block text-lg !py-4 rounded-xl font-semibold bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700"
                    id="cta-course-enroll"
                  >
                    Nenhuma Turma Disponível
                  </button>
                )}

                <p className="text-xs text-slate-500 text-center mt-4">
                  Crie sua conta para efetuar a matrícula
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8 mt-12">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm text-slate-600">© 2026 Cursos GT. Todos os direitos reservados.</p>
        </div>
      </footer>
    </main>
  );
}
