'use client';

import { useState, useEffect } from 'react';

interface PublicCourse {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  summary: string | null;
  price: number;
  duration: number | null;
  thumbnail: string | null;
  status: string;
  _count?: { classes: number };
}

export default function PublicCoursesPage() {
  const [courses, setCourses] = useState<PublicCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api'}/courses?status=PUBLISHED`)
      .then((r) => r.json())
      .then((data) => setCourses(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const filtered = courses.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    (c.summary && c.summary.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <main className="min-h-screen">
      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 glass border-b border-slate-700/40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-sm text-white"
              style={{ background: 'var(--gradient-primary)' }}>GT</div>
            <span className="text-lg font-bold text-white">Cursos GT</span>
          </a>
          <div className="flex items-center gap-3">
            <a href="/login" className="text-sm text-slate-300 hover:text-white transition-colors px-3 py-2">Entrar</a>
            <a href="/register" className="btn-primary text-sm !px-5 !py-2">Começar</a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-12 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 right-0 w-[400px] h-[400px] rounded-full bg-yellow-500/6 blur-[120px]" />
          <div className="absolute bottom-0 -left-20 w-[300px] h-[300px] rounded-full bg-amber-600/6 blur-[100px]" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Nossos <span className="gradient-text">Cursos</span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mb-8">
            Explore nossa grade de cursos profissionalizantes e encontre o ideal para sua carreira.
          </p>

          {/* Search */}
          <div className="relative max-w-md">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-12"
              placeholder="Buscar cursos..."
              id="search-courses"
            />
          </div>
        </div>
      </section>

      {/* Course Grid */}
      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-6">
          {loading ? (
            <div className="flex justify-center py-20">
              <svg className="animate-spin h-10 w-10 text-yellow-500" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          ) : filtered.length > 0 ? (
            <>
              <p className="text-sm text-slate-500 mb-6">{filtered.length} curso(s) encontrado(s)</p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((course, i) => (
                  <a
                    key={course.id}
                    href={`/cursos/${course.slug}`}
                    className="glass rounded-2xl overflow-hidden card-hover group animate-fade-in-up"
                    style={{ animationDelay: `${i * 0.05}s` }}
                    id={`public-course-${course.slug}`}
                  >
                    <div className="h-52 relative overflow-hidden"
                      style={{ background: `linear-gradient(135deg, hsl(${40 + i * 25}, 65%, 22%), hsl(${60 + i * 25}, 55%, 12%))` }}>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <svg className="w-20 h-20 text-white/10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                      <div className="absolute top-4 right-4 px-3 py-1.5 rounded-xl text-sm font-bold text-gray-900"
                        style={{ background: 'var(--gradient-primary)' }}>
                        {course.price > 0 ? `R$ ${course.price.toFixed(2)}` : 'Gratuito'}
                      </div>
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-white group-hover:text-yellow-400 transition-colors">
                        {course.title}
                      </h3>
                      {course.summary && (
                        <p className="text-sm text-slate-400 mt-2 line-clamp-3">{course.summary}</p>
                      )}
                      <div className="flex items-center gap-4 mt-4 text-xs text-slate-500">
                        {course.duration && (
                          <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {course.duration}h de aula
                          </span>
                        )}
                        {course._count?.classes !== undefined && (
                          <span className="flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            {course._count.classes} turma(s)
                          </span>
                        )}
                      </div>
                      <div className="mt-5 flex items-center text-sm font-semibold group-hover:gap-3 gap-1.5 transition-all"
                        style={{ color: '#d4af37' }}>
                        Ver detalhes
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                        </svg>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </>
          ) : (
            <div className="text-center py-20">
              <svg className="w-20 h-20 mx-auto text-slate-700 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <p className="text-xl text-slate-400">
                {search ? 'Nenhum curso encontrado para sua busca' : 'Nenhum curso disponível no momento'}
              </p>
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="mt-4 text-sm font-medium transition-colors hover:underline"
                  style={{ color: '#d4af37' }}
                >
                  Limpar busca
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 py-8">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm text-slate-600">© 2026 Cursos GT. Todos os direitos reservados.</p>
        </div>
      </footer>
    </main>
  );
}
