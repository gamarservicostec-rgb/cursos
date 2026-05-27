'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';

interface ClassDetail {
  id: number;
  name: string;
  courseId: number;
  course: {
    id: number;
    title: string;
  };
}

interface LessonItem {
  id: number;
  title: string;
  description: string | null;
  videoUrl: string | null;
  duration: number | null;
  order: number;
}

function StudentLessonsPageContent() {
  const searchParams = useSearchParams();
  const classId = parseInt(searchParams?.get('classId') || '', 10);
  const { user, isAuthenticated, loading: authLoading } = useAuth();

  const [classItem, setClassItem] = useState<ClassDetail | null>(null);
  const [lessons, setLessons] = useState<LessonItem[]>([]);
  const [currentLesson, setCurrentLesson] = useState<LessonItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Presence state
  const [isPresent, setIsPresent] = useState(false);
  const [checkingPresence, setCheckingPresence] = useState(false);
  const [completedLessons, setCompletedLessons] = useState<number[]>([]);

  useEffect(() => {
    if (authLoading) return;

    if (!isAuthenticated) {
      window.location.href = '/login';
      return;
    }

    if (!classId) {
      setError('ID da turma inválido.');
      setLoading(false);
      return;
    }

    // 1. Fetch Class detail
    api.getClass(classId)
      .then((data) => {
        setClassItem(data);
        // 2. Fetch lessons of the course
        return api.getLessonsByCourse(data.courseId);
      })
      .then((lessonsData) => {
        // Ordenar aulas pela ordem definida
        const sorted = lessonsData.sort((a: any, b: any) => a.order - b.order);
        setLessons(sorted);
        if (sorted.length > 0) {
          setCurrentLesson(sorted[0]);
        }
      })
      .catch((err) => {
        console.error(err);
        setError('Erro ao carregar dados do curso.');
      })
      .finally(() => setLoading(false));

    // Carregar presenças reais do Backend
    api.getMyAttendances()
      .then((attendances) => {
        const completedIds = attendances.map((a: any) => a.lessonId);
        setCompletedLessons(completedIds);
      })
      .catch((err) => {
        console.error('Erro ao carregar presenças do servidor:', err);
      });
  }, [classId, isAuthenticated, authLoading]);
 
  // Sincronizar estado de liberação se a aula já tiver presença validada
  useEffect(() => {
    if (currentLesson && completedLessons.includes(currentLesson.id)) {
      setIsPresent(true);
    } else {
      setIsPresent(false);
    }
  }, [currentLesson, completedLessons]);

  const handleVerifyPresence = async () => {
    if (!currentLesson) return;
    setCheckingPresence(true);
    setError('');

    try {
      // 1. Tentar obter o token do local-node físico (intranet)
      let presenceToken = "token_simulado_unidade_centro";
      
      try {
        const res = await fetch('http://192.168.1.10:3002/token', { signal: AbortSignal.timeout(1500) });
        if (res.ok) {
          const data = await res.json();
          presenceToken = data.token;
        }
      } catch (err) {
        console.log("Não conectado ao Wi-Fi físico do local-node. Utilizando simulador online.");
      }

      // 2. Chamar o backend online central para validar e registrar a presença obrigatória!
      await api.checkInAttendance(currentLesson.id, presenceToken);

      setIsPresent(true);
      setCompletedLessons((prev) => [...prev, currentLesson.id]);
    } catch (err: any) {
      setError(err.message || 'Erro ao registrar presença.');
    } finally {
      setCheckingPresence(false);
    }
  };

  const handleCompleteLesson = async (lessonId: number) => {
    if (completedLessons.includes(lessonId)) return;
    
    try {
      // Registrar conclusão no backend via check-in
      await api.checkInAttendance(lessonId, "token_simulado_unidade_centro");
      setCompletedLessons((prev) => [...prev, lessonId]);
    } catch (err: any) {
      alert(err.message || 'Erro ao concluir aula');
    }
  };

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

  if (error && !classItem) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center glass rounded-2xl p-8 max-w-md">
          <h1 className="text-3xl font-bold text-white mb-4">Ops!</h1>
          <p className="text-slate-400 mb-6">{error}</p>
          <a href="/painel" className="btn-primary">Voltar ao Painel</a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 glass border-b border-slate-700/40">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <a href="/painel" className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/40 transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </a>
            <span className="text-white font-bold hidden sm:inline">{classItem?.course.title}</span>
            <span className="text-slate-500 text-sm hidden md:inline">/</span>
            <span className="text-slate-400 text-sm hidden md:inline">{classItem?.name}</span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass text-xs text-slate-300">
              <span className={`w-2 h-2 rounded-full ${isPresent ? 'bg-green-500' : 'bg-red-500 animate-pulse'}`} />
              {isPresent ? 'Presença Validada' : 'Presença Pendente'}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto px-6 pt-24 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Player / Lock */}
          <div className="lg:col-span-8 space-y-6">
            {!isPresent ? (
              /* Locked Screen */
              <div className="glass rounded-3xl p-12 text-center border border-yellow-500/25 relative overflow-hidden animate-fade-in-up"
                style={{ background: 'rgba(15, 23, 42, 0.6)' }}>
                {/* Visual glow background */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-yellow-500/5 blur-3xl pointer-events-none" />

                <div className="relative z-10 space-y-6">
                  {/* Glowing Lock Icon */}
                  <div className="w-20 h-20 rounded-2xl bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center mx-auto text-yellow-400 animate-pulse">
                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>

                  <div className="max-w-md mx-auto">
                    <h2 className="text-2xl font-bold text-white mb-2">Acesso Protegido — Rede Escolar</h2>
                    <p className="text-sm text-slate-400 leading-relaxed">
                      De acordo com as diretrizes do **EAD Híbrido**, esta aula exige que você esteja fisicamente presente na unidade física da escola.
                    </p>
                  </div>

                  <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 max-w-sm mx-auto space-y-4">
                    <div className="text-left space-y-1.5">
                      <span className="text-xs text-slate-400 block font-medium">COMO VALIDAR PRESENÇA:</span>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        1. Conecte seu dispositivo na rede Wi-Fi da unidade.<br />
                        2. Clique no botão abaixo para captar o token físico e registrar a presença obrigatória.
                      </p>
                    </div>

                    <button
                      onClick={handleVerifyPresence}
                      disabled={checkingPresence}
                      className="btn-primary w-full py-3 font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {checkingPresence ? (
                        <>
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Verificando Conexão Wi-Fi...
                        </>
                      ) : (
                        'Validar Presença Híbrida'
                      )}
                    </button>

                    {error && (
                      <p className="text-xs text-red-400 mt-2 font-medium bg-red-500/10 border border-red-500/20 rounded-lg p-2.5 text-center animate-fade-in-up">
                        ⚠️ {error}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              /* Player Screen */
              <div className="space-y-6 animate-fade-in-up">
                {currentLesson ? (
                  <>
                    {/* Video wrapper */}
                    <div className="relative pt-[56.25%] rounded-3xl overflow-hidden glass border border-slate-700/50 shadow-2xl">
                      {currentLesson.videoUrl ? (
                        <iframe
                          src={`${currentLesson.videoUrl}?autoplay=1&modestbranding=1&rel=0`}
                          className="absolute inset-0 w-full h-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-slate-500">
                          Nenhum vídeo disponível para esta aula
                        </div>
                      )}
                    </div>

                    {/* Lesson description details */}
                    <div className="glass rounded-3xl p-8 border border-slate-700/40">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <span className="text-xs text-yellow-400 font-semibold uppercase tracking-wider">AULA {currentLesson.order}</span>
                          <h2 className="text-2xl font-extrabold text-white mt-1">{currentLesson.title}</h2>
                        </div>
                        <button
                          onClick={() => handleCompleteLesson(currentLesson.id)}
                          disabled={completedLessons.includes(currentLesson.id)}
                          className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2
                            ${completedLessons.includes(currentLesson.id)
                              ? 'bg-green-500/10 border border-green-500/30 text-green-400 cursor-default'
                              : 'btn-primary animate-pulse-glow'
                            }`}
                        >
                          {completedLessons.includes(currentLesson.id) ? (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                              </svg>
                              Aula Concluída
                            </>
                          ) : (
                            'Marcar como Concluída'
                          )}
                        </button>
                      </div>

                      <div className="border-t border-slate-700/40 my-6" />

                      <h3 className="font-semibold text-slate-300 mb-2">Descrição e Material de Apoio</h3>
                      <p className="text-sm text-slate-400 leading-relaxed whitespace-pre-line">
                        {currentLesson.description || 'Nenhum material cadastrado para esta aula.'}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="glass rounded-3xl p-12 text-center text-slate-500">
                    Nenhuma aula cadastrada neste curso.
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Playlist */}
          <div className="lg:col-span-4">
            <div className="glass rounded-3xl p-6 border border-slate-700/40">
              <h3 className="font-bold text-white text-lg mb-4">Grade do Curso</h3>

              <div className="space-y-3">
                {lessons.map((lesson) => {
                  const isCurrent = currentLesson?.id === lesson.id;
                  const isCompleted = completedLessons.includes(lesson.id);

                  return (
                    <button
                      key={lesson.id}
                      onClick={() => isPresent && setCurrentLesson(lesson)}
                      disabled={!isPresent}
                      className={`w-full p-4 rounded-2xl border text-left flex items-start gap-3.5 transition-all
                        ${!isPresent ? 'opacity-60 cursor-not-allowed border-slate-800 bg-slate-900/40' : ''}
                        ${isCurrent
                          ? 'border-yellow-500 bg-yellow-500/5'
                          : 'border-slate-700/40 hover:border-slate-500 hover:bg-slate-800/30'
                        }`}
                    >
                      {/* Left: Status icon */}
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold
                        ${isCompleted
                          ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                          : isCurrent
                          ? 'bg-yellow-500/25 text-yellow-400 border border-yellow-500/30 animate-pulse'
                          : 'bg-slate-800 text-slate-400 border border-slate-700/50'
                        }`}
                      >
                        {isCompleted ? '✓' : lesson.order}
                      </div>

                      {/* Right: Title details */}
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold truncate
                          ${isCurrent ? 'text-yellow-400' : 'text-slate-200'}`}
                        >
                          {lesson.title}
                        </p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                          {lesson.duration && (
                            <span className="flex items-center gap-1">
                              ⏱️ {lesson.duration} min
                            </span>
                          )}
                          {isCompleted && (
                            <span className="text-green-500 font-medium">
                              Concluída
                            </span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function StudentLessonsPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center">
        <svg className="animate-spin h-10 w-10 text-yellow-500" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </main>
    }>
      <StudentLessonsPageContent />
    </Suspense>
  );
}
