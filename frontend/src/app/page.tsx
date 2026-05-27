'use client';

import { useState, useEffect } from 'react';
import { api } from '@/services/api';

interface PublicCourse {
  id: number;
  title: string;
  slug: string;
  summary: string | null;
  price: number;
  duration: number | null;
  thumbnail: string | null;
  _count?: { classes: number };
}

export default function HomePage() {
  const [courses, setCourses] = useState<PublicCourse[]>([]);
  const [loadingCourses, setLoadingCourses] = useState(true);

  useEffect(() => {
    api.getPublishedCourses()
      .then((data) => setCourses(data.slice(0, 6)))
      .catch(() => {})
      .finally(() => setLoadingCourses(false));
  }, []);

  return (
    <main className="min-h-screen">
      {/* ── Navbar ── */}
      <nav className="fixed top-0 inset-x-0 z-50 glass border-b border-slate-700/40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-sm text-white"
              style={{ background: 'var(--gradient-primary)' }}>GT</div>
            <span className="text-lg font-bold text-white">Cursos GT</span>
          </a>
          <div className="hidden md:flex items-center gap-8">
            <a href="#cursos" className="text-sm text-slate-300 hover:text-white transition-colors">Cursos</a>
            <a href="#metodo" className="text-sm text-slate-300 hover:text-white transition-colors">Método</a>
            <a href="#depoimentos" className="text-sm text-slate-300 hover:text-white transition-colors">Depoimentos</a>
            <a href="#contato" className="text-sm text-slate-300 hover:text-white transition-colors">Contato</a>
          </div>
          <div className="flex items-center gap-3">
            <a href="/login" className="text-sm text-slate-300 hover:text-white transition-colors px-3 py-2" id="nav-login">
              Entrar
            </a>
            <a href="/register" className="btn-primary text-sm !px-5 !py-2" id="nav-register">
              Começar
            </a>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-yellow-500/8 blur-[120px]" />
          <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-amber-600/8 blur-[120px]" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-yellow-700/5 blur-[160px]" />
        </div>

        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <div className="animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 text-sm text-slate-300">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              Matrículas abertas para 2026
            </div>
          </div>

          <h1 className="text-5xl md:text-7xl font-extrabold mb-6 animate-fade-in-up-delay-1 leading-tight">
            Sua carreira começa<br />
            <span className="gradient-text">na prática.</span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-400 mb-10 leading-relaxed max-w-3xl mx-auto animate-fade-in-up-delay-2">
            Cursos profissionalizantes com{' '}
            <span className="text-white font-semibold">ensino presencial controlado</span>.
            Matricule-se online e assista às aulas na unidade mais próxima.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in-up-delay-3">
            <a href="/cursos" className="btn-primary text-center text-lg !px-8 !py-4" id="cta-hero-courses">
              Ver Cursos Disponíveis
            </a>
            <a
              href="#metodo"
              className="px-8 py-4 rounded-xl font-semibold text-white border border-slate-600 hover:border-yellow-500/50 transition-all duration-300 hover:bg-slate-800/50 text-center text-lg"
              id="cta-hero-method"
            >
              Como Funciona?
            </a>
          </div>

          {/* Stats */}
          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-5 animate-fade-in-up-delay-3">
            {[
              { value: '500+', label: 'Alunos Formados' },
              { value: '15+', label: 'Cursos Ativos' },
              { value: '98%', label: 'Taxa de Aprovação' },
              { value: '5+', label: 'Unidades' },
            ].map((stat) => (
              <div key={stat.label} className="glass rounded-2xl p-5 card-hover">
                <div className="text-3xl font-bold gradient-text">{stat.value}</div>
                <div className="text-sm text-slate-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Cursos Section ── */}
      <section id="cursos" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-4"
              style={{ background: 'rgba(212, 175, 55, 0.12)', color: '#d4af37' }}>
              Catálogo
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Nossos Cursos</h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Cursos profissionalizantes que preparam você para o mercado de trabalho com aulas práticas e certificação.
            </p>
          </div>

          {loadingCourses ? (
            <div className="flex justify-center py-12">
              <svg className="animate-spin h-8 w-8 text-yellow-500" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
          ) : courses.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course, i) => (
                <a
                  key={course.id}
                  href={`/cursos/${course.slug}`}
                  className="glass rounded-2xl overflow-hidden card-hover group"
                  style={{ animationDelay: `${i * 0.1}s` }}
                  id={`course-card-${course.slug}`}
                >
                  {/* Thumbnail placeholder */}
                  <div className="h-48 relative overflow-hidden"
                    style={{ background: `linear-gradient(135deg, hsl(${40 + i * 30}, 70%, 25%), hsl(${60 + i * 30}, 60%, 15%))` }}>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg className="w-16 h-16 text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    {/* Price badge */}
                    <div className="absolute top-4 right-4 px-3 py-1.5 rounded-xl text-sm font-bold text-gray-900"
                      style={{ background: 'var(--gradient-primary)' }}>
                      {course.price > 0 ? `R$ ${course.price.toFixed(0)}` : 'Gratuito'}
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-white group-hover:text-yellow-400 transition-colors">
                      {course.title}
                    </h3>
                    {course.summary && (
                      <p className="text-sm text-slate-400 mt-2 line-clamp-2">{course.summary}</p>
                    )}
                    <div className="flex items-center gap-4 mt-4 text-xs text-slate-500">
                      {course.duration && (
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {course.duration}h
                        </span>
                      )}
                      {course._count?.classes !== undefined && (
                        <span className="flex items-center gap-1">
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {course._count.classes} turma(s)
                        </span>
                      )}
                    </div>
                  </div>
                </a>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-slate-500 text-lg">Cursos serão publicados em breve!</p>
            </div>
          )}

          <div className="text-center mt-12">
            <a href="/cursos" className="inline-flex items-center gap-2 text-sm font-semibold transition-colors hover:underline"
              style={{ color: '#d4af37' }}>
              Ver todos os cursos
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* ── Método Section ── */}
      <section id="metodo" className="py-24 relative" style={{ background: 'linear-gradient(180deg, rgba(15,23,42,0) 0%, rgba(15,23,42,0.8) 50%, rgba(15,23,42,0) 100%)' }}>
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-4"
              style={{ background: 'rgba(59, 130, 246, 0.12)', color: '#60a5fa' }}>
              Método Exclusivo
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">Ensino Híbrido Controlado</h2>
            <p className="text-lg text-slate-400 max-w-2xl mx-auto">
              Combinamos a praticidade da matrícula online com a segurança do ensino presencial.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '01',
                title: 'Matricule-se Online',
                desc: 'Escolha seu curso, efetue o pagamento de forma segura e garanta sua vaga em segundos.',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                ),
                gradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
              },
              {
                step: '02',
                title: 'Vá à Unidade',
                desc: 'Conecte-se à rede Wi-Fi da escola. Sua presença é validada automaticamente pelo sistema.',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ),
                gradient: 'linear-gradient(135deg, #8b5cf6, #6d28d9)',
              },
              {
                step: '03',
                title: 'Assista e Aprenda',
                desc: 'As aulas são liberadas após validação presencial. Acompanhe seu progresso e conquiste seu certificado.',
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                gradient: 'linear-gradient(135deg, #d946ef, #a21caf)',
              },
            ].map((item, i) => (
              <div key={item.step} className="glass rounded-2xl p-8 card-hover relative group"
                style={{ animationDelay: `${i * 0.15}s` }}>
                <div className="absolute top-6 right-6 text-5xl font-extrabold text-slate-700/30">{item.step}</div>
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-6"
                  style={{ background: item.gradient }}>
                  {item.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Depoimentos Section ── */}
      <section id="depoimentos" className="py-24 relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-4"
              style={{ background: 'rgba(34, 197, 94, 0.12)', color: '#4ade80' }}>
              Depoimentos
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">O que dizem nossos alunos</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { name: 'Maria Silva', role: 'Formada em Design Gráfico', text: 'Graças ao curso, consegui meu primeiro emprego na área em menos de 2 meses. O ensino prático fez toda a diferença.' },
              { name: 'João Pereira', role: 'Formado em Informática', text: 'A estrutura presencial me deu a disciplina que eu precisava. O certificado é reconhecido e me abriu muitas portas.' },
              { name: 'Ana Costa', role: 'Formada em Administração', text: 'Melhor investimento que fiz na minha carreira. Professores excelentes e material de qualidade. Super recomendo!' },
            ].map((testimonial, i) => (
              <div key={testimonial.name} className="glass rounded-2xl p-8 card-hover"
                style={{ animationDelay: `${i * 0.1}s` }}>
                <div className="flex items-center gap-1 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} className="w-4 h-4 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-slate-300 leading-relaxed mb-6 italic">&ldquo;{testimonial.text}&rdquo;</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white"
                    style={{ background: `linear-gradient(135deg, hsl(${200 + i * 40}, 60%, 50%), hsl(${220 + i * 40}, 60%, 35%))` }}>
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">{testimonial.name}</p>
                    <p className="text-xs text-slate-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="py-24 relative">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="glass rounded-3xl p-12 md:p-16 relative overflow-hidden animate-pulse-glow">
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute -top-20 -right-20 w-60 h-60 rounded-full blur-[100px]"
                style={{ background: 'rgba(212, 175, 55, 0.1)' }} />
              <div className="absolute -bottom-20 -left-20 w-60 h-60 rounded-full blur-[100px]"
                style={{ background: 'rgba(250, 204, 21, 0.08)' }} />
            </div>
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                Pronto para transformar<br />
                <span className="gradient-text">sua carreira?</span>
              </h2>
              <p className="text-lg text-slate-400 mb-8 max-w-xl mx-auto">
                Garanta sua vaga agora e comece sua jornada de aprendizado com a Cursos GT.
              </p>
              <a href="/register" className="btn-primary inline-flex items-center gap-2 text-lg !px-10 !py-4" id="cta-final">
                Criar Conta Grátis
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer id="contato" className="border-t border-slate-800 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-sm text-white"
                  style={{ background: 'var(--gradient-primary)' }}>GT</div>
                <span className="text-lg font-bold text-white">Cursos GT</span>
              </div>
              <p className="text-slate-400 leading-relaxed max-w-sm">
                Plataforma híbrida de ensino profissionalizante. Matrícula online, aulas presenciais com presença controlada.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Links Rápidos</h4>
              <ul className="space-y-2">
                <li><a href="/cursos" className="text-sm text-slate-400 hover:text-white transition-colors">Cursos</a></li>
                <li><a href="/login" className="text-sm text-slate-400 hover:text-white transition-colors">Entrar</a></li>
                <li><a href="/register" className="text-sm text-slate-400 hover:text-white transition-colors">Criar Conta</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Contato</h4>
              <ul className="space-y-2">
                <li className="text-sm text-slate-400">contato@cursosgt.com.br</li>
                <li className="text-sm text-slate-400">(00) 0000-0000</li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-800 mt-12 pt-8 text-center">
            <p className="text-sm text-slate-600">© 2026 Cursos GT. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
