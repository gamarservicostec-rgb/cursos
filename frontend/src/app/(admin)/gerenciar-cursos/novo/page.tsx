'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  UploadCloud, 
  Image as ImageIcon, 
  Film, 
  Save, 
  Layout, 
  AlignLeft, 
  Clock, 
  DollarSign,
  ChevronRight,
  MonitorPlay,
  Layers,
  Plus,
  Trash2,
  BookOpen,
  FileText,
  HelpCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/services/api';

interface Lesson {
  title: string;
  type: 'VIDEO' | 'TEXT' | 'QUIZ';
  duration: number;
  videoUrl?: string;
  content?: string;
}

interface Subject {
  title: string;
  lessons: Lesson[];
}

interface Module {
  title: string;
  subjects: Subject[];
}

export default function NewCoursePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const courseIdStr = searchParams.get('id');
  const courseId = courseIdStr ? parseInt(courseIdStr, 10) : null;

  const [activeTab, setActiveTab] = useState('informacoes');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Course Info State
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState(0);
  const [duration, setDuration] = useState(0);
  const [thumbnail, setThumbnail] = useState('');
  const [bannerUrl, setBannerUrl] = useState('');
  const [status, setStatus] = useState('DRAFT');

  // Course Grade (Modules tree) State
  const [modules, setModules] = useState<Module[]>([]);

  // Accordion state
  const [openModuleIdx, setOpenModuleIdx] = useState<number | null>(0);

  // File Inputs references
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const bannerInputRef = useRef<HTMLInputElement>(null);

  // Load Course if editing
  useEffect(() => {
    if (courseId) {
      setLoading(true);
      api.getCourseById(courseId)
        .then((course) => {
          setTitle(course.title || '');
          setSummary(course.summary || '');
          setDescription(course.description || '');
          setPrice(course.price || 0);
          setDuration(course.duration || 0);
          setThumbnail(course.thumbnail || '');
          setBannerUrl(course.bannerUrl || '');
          setStatus(course.status || 'DRAFT');
          setModules(course.modules || []);
        })
        .catch((err) => {
          console.error(err);
          setError('Erro ao carregar dados do curso para edição.');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [courseId]);

  // Handle image upload
  const handleImageUpload = async (file: File, type: 'thumbnail' | 'banner') => {
    try {
      setError('');
      const res = await api.uploadFile(file);
      if (type === 'thumbnail') {
        setThumbnail(res.url);
      } else {
        setBannerUrl(res.url);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erro ao fazer upload da imagem.');
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'thumbnail' | 'banner') => {
    if (e.target.files && e.target.files[0]) {
      handleImageUpload(e.target.files[0], type);
    }
  };

  // Grade Hierarchy management
  const addModule = () => {
    setModules([...modules, { title: 'Novo Módulo', subjects: [] }]);
    setOpenModuleIdx(modules.length); // open the newly created module
  };

  const removeModule = (mIdx: number) => {
    setModules(modules.filter((_, idx) => idx !== mIdx));
    if (openModuleIdx === mIdx) setOpenModuleIdx(null);
  };

  const updateModuleTitle = (mIdx: number, title: string) => {
    const updated = [...modules];
    updated[mIdx].title = title;
    setModules(updated);
  };

  const addSubject = (mIdx: number) => {
    const updated = [...modules];
    updated[mIdx].subjects.push({ title: 'Nova Matéria', lessons: [] });
    setModules(updated);
  };

  const removeSubject = (mIdx: number, sIdx: number) => {
    const updated = [...modules];
    updated[mIdx].subjects = updated[mIdx].subjects.filter((_, idx) => idx !== sIdx);
    setModules(updated);
  };

  const updateSubjectTitle = (mIdx: number, sIdx: number, title: string) => {
    const updated = [...modules];
    updated[mIdx].subjects[sIdx].title = title;
    setModules(updated);
  };

  const addLesson = (mIdx: number, sIdx: number, type: 'VIDEO' | 'TEXT' | 'QUIZ') => {
    const updated = [...modules];
    updated[mIdx].subjects[sIdx].lessons.push({
      title: 'Nova Aula',
      type,
      duration: 10,
      videoUrl: '',
      content: ''
    });
    setModules(updated);
  };

  const removeLesson = (mIdx: number, sIdx: number, lIdx: number) => {
    const updated = [...modules];
    updated[mIdx].subjects[sIdx].lessons = updated[mIdx].subjects[sIdx].lessons.filter((_, idx) => idx !== lIdx);
    setModules(updated);
  };

  const updateLessonField = (mIdx: number, sIdx: number, lIdx: number, field: keyof Lesson, value: any) => {
    const updated = [...modules];
    updated[mIdx].subjects[sIdx].lessons[lIdx] = {
      ...updated[mIdx].subjects[sIdx].lessons[lIdx],
      [field]: value
    };
    setModules(updated);
  };

  // Submit action
  const handleSave = async () => {
    if (!title) {
      setError('O título do curso é obrigatório!');
      setActiveTab('informacoes');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    const payload = {
      title,
      summary,
      description,
      price: Number(price),
      duration: Number(duration),
      thumbnail,
      bannerUrl,
      status,
      modules
    };

    try {
      if (courseId) {
        await api.updateCourse(courseId, payload);
        setSuccess('Curso atualizado com sucesso absoluto!');
      } else {
        await api.createCourse(payload);
        setSuccess('Curso revolucionário criado com sucesso!');
      }
      setTimeout(() => {
        router.push('/gerenciar-cursos');
      }, 1500);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erro ao salvar o curso.');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'informacoes', label: '1. Informações Básicas', icon: AlignLeft },
    { id: 'visual', label: '2. Identidade Visual', icon: ImageIcon },
    { id: 'grade', label: '3. Grade Curricular', icon: Layers },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96 space-y-4">
        <svg className="animate-spin h-10 w-10 text-yellow-500" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p className="text-slate-400 font-medium">Carregando a experiência do curso...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-yellow-500/80 mb-2 font-medium">
            <Link href="/gerenciar-cursos" className="hover:text-yellow-400 transition-colors">Cursos</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-white">{courseId ? 'Editar Curso' : 'Criar Novo Curso'}</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            {courseId ? 'Editar Experiência' : 'Criador de Experiência'}
          </h1>
          <p className="text-slate-400 mt-1">
            {courseId ? 'Ajuste os parâmetros visuais e intelectuais da sua jornada de ensino.' : 'Configure as informações, identidade visual e a grade curricular do seu novo curso.'}
          </p>
        </div>

        <div className="flex gap-3">
          <Link href="/gerenciar-cursos">
            <button className="px-6 py-2.5 rounded-xl font-bold text-slate-300 hover:text-white glass-panel hover:bg-white/5 transition-all">
              Cancelar
            </button>
          </Link>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 rounded-xl font-bold text-black bg-gradient-to-r from-yellow-400 to-yellow-500 hover:to-yellow-400 shadow-[0_0_20px_rgba(234,179,8,0.3)] hover:shadow-[0_0_30px_rgba(234,179,8,0.5)] transition-all flex items-center gap-2 transform hover:-translate-y-0.5 disabled:opacity-50"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Salvando...' : courseId ? 'Salvar Alterações' : 'Salvar e Publicar'}
          </button>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="p-4 rounded-2xl text-sm font-semibold bg-red-500/10 border border-red-500/30 text-red-400">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 rounded-2xl text-sm font-semibold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
          {success}
        </div>
      )}

      {/* Main Form Area */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar Navigation */}
        <div className="lg:col-span-1 space-y-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-4 rounded-2xl text-left transition-all duration-300 ${
                  isActive 
                    ? 'glass-card border-yellow-500/50 shadow-[0_0_30px_rgba(234,179,8,0.1)]' 
                    : 'glass-panel hover:bg-white/5 text-slate-400 border-transparent'
                }`}
              >
                <div className={`p-2 rounded-xl ${isActive ? 'bg-yellow-500/20 text-yellow-400' : 'bg-black/40 text-slate-500'}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className={`font-bold ${isActive ? 'text-white' : ''}`}>{tab.label}</span>
              </button>
            )
          })}
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <motion.div 
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
            className="glass-card p-8 rounded-3xl border-t-[1px] border-t-white/10"
          >
            {/* TAB 1: INFORMAÇÕES */}
            {activeTab === 'informacoes' && (
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                  <AlignLeft className="text-yellow-500 w-6 h-6" />
                  Informações Essenciais
                </h2>
                
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-300 ml-1">Título Oficial do Curso</label>
                  <input 
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Ex: Formação Fullstack Masterclass..." 
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-slate-600 focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/50 transition-all text-lg"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-300 ml-1">Resumo Curto (Aparece nos cards)</label>
                  <textarea 
                    rows={2}
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="Uma frase de impacto sobre o que o aluno vai aprender..." 
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-slate-600 focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/50 transition-all resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-300 ml-1">Descrição Completa</label>
                  <textarea 
                    rows={6}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Detalhe tudo o que o curso oferece, os benefícios, grade de conhecimento..." 
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-slate-600 focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/50 transition-all resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-300 ml-1 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-500" /> Duração (horas)
                    </label>
                    <input 
                      type="number" 
                      value={duration}
                      onChange={(e) => setDuration(parseInt(e.target.value, 10) || 0)}
                      placeholder="Ex: 40" 
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/50 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-300 ml-1 flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-slate-500" /> Preço (R$)
                    </label>
                    <input 
                      type="number" 
                      value={price}
                      onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                      placeholder="Ex: 297.00" 
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/50 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-300 ml-1 flex items-center gap-2">
                      Status
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/50 transition-all"
                    >
                      <option value="DRAFT" className="bg-[#18181b] text-white">Rascunho</option>
                      <option value="PUBLISHED" className="bg-[#18181b] text-white">Publicado</option>
                      <option value="ARCHIVED" className="bg-[#18181b] text-white">Arquivado</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: IDENTIDADE VISUAL */}
            {activeTab === 'visual' && (
              <div className="space-y-8">
                <h2 className="text-2xl font-bold text-white mb-2 flex items-center gap-3">
                  <ImageIcon className="text-yellow-500 w-6 h-6" />
                  Identidade Visual e Capas
                </h2>
                <p className="text-slate-400 text-sm mb-6">O sistema de upload aceita imagens diretamente do seu computador e as processa automaticamente.</p>
                
                {/* Upload Thumbnail */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-base font-bold text-white flex items-center gap-2">
                      <Layout className="w-5 h-5 text-yellow-500" /> Thumbnail do Curso (Card)
                    </label>
                    <span className="text-xs text-slate-500 bg-white/5 px-3 py-1 rounded-full">Recomendado: 800x600px</span>
                  </div>

                  <input 
                    type="file" 
                    ref={thumbnailInputRef}
                    onChange={(e) => onFileChange(e, 'thumbnail')}
                    accept="image/*"
                    className="hidden"
                  />

                  {thumbnail ? (
                    <div className="relative group rounded-3xl overflow-hidden border border-white/10 aspect-[4/3] max-w-md mx-auto">
                      <img src={thumbnail} alt="Thumbnail preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                        <button 
                          onClick={() => thumbnailInputRef.current?.click()}
                          className="px-5 py-2.5 bg-yellow-500 text-black font-bold rounded-xl flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300"
                        >
                          <UploadCloud className="w-5 h-5" /> Substituir
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div 
                      onClick={() => thumbnailInputRef.current?.click()}
                      className="border-2 border-dashed border-white/10 rounded-3xl p-10 flex flex-col items-center justify-center bg-black/20 hover:bg-black/40 hover:border-yellow-500/50 transition-all cursor-pointer group relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <UploadCloud className="w-12 h-12 text-slate-600 group-hover:text-yellow-400 mb-4 transition-colors" />
                      <p className="text-lg font-bold text-slate-300 group-hover:text-white transition-colors">Clique para enviar a imagem do Card</p>
                      <p className="text-sm text-slate-500 mt-1">JPG, PNG ou WEBP até 5MB</p>
                    </div>
                  )}
                </div>

                {/* Upload Banner */}
                <div className="space-y-3 pt-6 border-t border-white/5">
                  <div className="flex items-center justify-between">
                    <label className="text-base font-bold text-white flex items-center gap-2">
                      <MonitorPlay className="w-5 h-5 text-yellow-500" /> Banner Principal (Capa Interna)
                    </label>
                    <span className="text-xs text-slate-500 bg-white/5 px-3 py-1 rounded-full">Recomendado: 1920x600px</span>
                  </div>

                  <input 
                    type="file" 
                    ref={bannerInputRef}
                    onChange={(e) => onFileChange(e, 'banner')}
                    accept="image/*"
                    className="hidden"
                  />

                  {bannerUrl ? (
                    <div className="relative group rounded-3xl overflow-hidden border border-white/10 aspect-[21/9]">
                      <img src={bannerUrl} alt="Banner preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                        <button 
                          onClick={() => bannerInputRef.current?.click()}
                          className="px-5 py-2.5 bg-yellow-500 text-black font-bold rounded-xl flex items-center gap-2 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300"
                        >
                          <UploadCloud className="w-5 h-5" /> Substituir
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div 
                      onClick={() => bannerInputRef.current?.click()}
                      className="border-2 border-dashed border-white/10 rounded-3xl p-12 flex flex-col items-center justify-center bg-black/20 hover:bg-black/40 hover:border-yellow-500/50 transition-all cursor-pointer group relative overflow-hidden aspect-[21/9]"
                    >
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <ImageIcon className="w-12 h-12 text-slate-600 group-hover:text-yellow-400 mb-4 transition-colors" />
                      <p className="text-lg font-bold text-slate-300 group-hover:text-white transition-colors">Clique para enviar o Banner Full HD aqui</p>
                      <p className="text-sm text-slate-500 mt-1">Essa imagem ficará no topo da página interna do curso</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: GRADE CURRICULAR (Hierarquia 4 Níveis) */}
            {activeTab === 'grade' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                      <Layers className="text-yellow-500 w-6 h-6" />
                      Grade Estruturada do Curso
                    </h2>
                    <p className="text-slate-400 text-xs mt-1">Organização de módulos, matérias e aulas (vídeo, texto ou quiz).</p>
                  </div>
                  <button 
                    onClick={addModule}
                    className="px-4 py-2.5 rounded-xl text-sm font-bold bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 border border-yellow-500/20 flex items-center gap-2 transition-all hover:scale-105"
                  >
                    <Plus className="w-4 h-4" /> Novo Módulo
                  </button>
                </div>

                {modules.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-white/5 rounded-3xl bg-black/20">
                    <Film className="w-16 h-16 text-slate-600 mb-4" />
                    <h3 className="text-xl font-bold text-slate-300">Nenhum módulo criado</h3>
                    <p className="text-slate-500 mt-2 max-w-md">
                      Crie o primeiro módulo para começar a organizar as matérias e as aulas com embutimento de Bunny.net.
                    </p>
                    <button 
                      onClick={addModule}
                      className="mt-6 px-6 py-2.5 rounded-xl bg-yellow-500 text-black font-bold transition-all shadow-[0_0_20px_rgba(234,179,8,0.3)] hover:scale-105"
                    >
                      Adicionar Módulo
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {modules.map((module, mIdx) => {
                      const isExpanded = openModuleIdx === mIdx;
                      return (
                        <div 
                          key={mIdx} 
                          className="glass-card rounded-2xl border border-white/10 overflow-hidden shadow-md"
                        >
                          {/* Module Header */}
                          <div 
                            className="p-5 flex items-center justify-between bg-white/5 cursor-pointer select-none"
                            onClick={() => setOpenModuleIdx(isExpanded ? null : mIdx)}
                          >
                            <div className="flex items-center gap-4 flex-1">
                              <span className="text-xs font-extrabold px-2.5 py-1 bg-yellow-500/20 text-yellow-400 rounded-full">
                                MÓDULO {mIdx + 1}
                              </span>
                              <input 
                                type="text"
                                value={module.title}
                                onClick={(e) => e.stopPropagation()}
                                onChange={(e) => updateModuleTitle(mIdx, e.target.value)}
                                className="bg-transparent text-lg font-bold text-white border-b border-transparent hover:border-white/20 focus:border-yellow-500 focus:outline-none px-2 py-0.5 w-64"
                              />
                            </div>

                            <div className="flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                              <button 
                                onClick={() => addSubject(mIdx)}
                                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white/5 hover:bg-white/10 text-white flex items-center gap-1.5 transition-colors"
                              >
                                <Plus className="w-3.5 h-3.5" /> Nova Matéria
                              </button>
                              <button 
                                onClick={() => removeModule(mIdx)}
                                className="p-2 rounded-lg hover:bg-red-500/10 text-slate-400 hover:text-red-400 transition-colors"
                                title="Excluir Módulo"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                              <div onClick={() => setOpenModuleIdx(isExpanded ? null : mIdx)} className="p-1 cursor-pointer">
                                {isExpanded ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                              </div>
                            </div>
                          </div>

                          {/* Module Content */}
                          {isExpanded && (
                            <div className="p-6 bg-black/25 space-y-6 divide-y divide-white/5">
                              {module.subjects.length === 0 ? (
                                <div className="text-center py-6 text-slate-500 text-sm">
                                  Nenhuma matéria configurada neste módulo. Clique em "Nova Matéria" acima para começar.
                                </div>
                              ) : (
                                module.subjects.map((subject, sIdx) => (
                                  <div key={sIdx} className="pt-6 first:pt-0 space-y-4">
                                    {/* Subject Title */}
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-3 flex-1">
                                        <BookOpen className="w-4 h-4 text-yellow-500/80" />
                                        <input 
                                          type="text"
                                          value={subject.title}
                                          onChange={(e) => updateSubjectTitle(mIdx, sIdx, e.target.value)}
                                          className="bg-transparent font-bold text-white border-b border-transparent hover:border-white/20 focus:border-yellow-500 focus:outline-none px-2 py-0.5 w-64"
                                          placeholder="Título da Matéria"
                                        />
                                      </div>
                                      
                                      <div className="flex items-center gap-2">
                                        <button 
                                          onClick={() => addLesson(mIdx, sIdx, 'VIDEO')}
                                          className="px-2.5 py-1 rounded bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 text-xs font-bold transition-colors flex items-center gap-1"
                                        >
                                          <MonitorPlay className="w-3.5 h-3.5" /> + Vídeo
                                        </button>
                                        <button 
                                          onClick={() => addLesson(mIdx, sIdx, 'TEXT')}
                                          className="px-2.5 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-bold transition-colors flex items-center gap-1"
                                        >
                                          <FileText className="w-3.5 h-3.5" /> + Texto
                                        </button>
                                        <button 
                                          onClick={() => removeSubject(mIdx, sIdx)}
                                          className="p-1.5 rounded hover:bg-red-500/10 text-slate-500 hover:text-red-400 transition-colors"
                                          title="Excluir Matéria"
                                        >
                                          <Trash2 className="w-4 h-4" />
                                        </button>
                                      </div>
                                    </div>

                                    {/* Lessons List under Subject */}
                                    <div className="pl-6 space-y-3">
                                      {subject.lessons.map((lesson, lIdx) => (
                                        <div 
                                          key={lIdx} 
                                          className="p-4 rounded-xl bg-white/5 border border-white/5 flex flex-col md:flex-row gap-4 justify-between items-start md:items-center"
                                        >
                                          <div className="flex-1 space-y-2 w-full">
                                            <div className="flex items-center gap-3">
                                              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                                                lesson.type === 'VIDEO' ? 'bg-yellow-500/20 text-yellow-400' :
                                                lesson.type === 'TEXT' ? 'bg-emerald-500/20 text-emerald-400' :
                                                'bg-blue-500/20 text-blue-400'
                                              }`}>
                                                {lesson.type}
                                              </span>
                                              <input 
                                                type="text"
                                                value={lesson.title}
                                                onChange={(e) => updateLessonField(mIdx, sIdx, lIdx, 'title', e.target.value)}
                                                className="bg-transparent text-sm font-semibold text-white border-b border-transparent hover:border-white/10 focus:border-yellow-500 focus:outline-none px-2 py-0.5 w-full max-w-sm"
                                                placeholder="Título da Aula"
                                              />
                                            </div>

                                            {/* Extra Fields based on type */}
                                            {lesson.type === 'VIDEO' && (
                                              <div className="flex gap-4 items-center">
                                                <input 
                                                  type="text"
                                                  value={lesson.videoUrl || ''}
                                                  onChange={(e) => updateLessonField(mIdx, sIdx, lIdx, 'videoUrl', e.target.value)}
                                                  className="bg-black/40 border border-white/5 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-yellow-500/40 w-full"
                                                  placeholder="ID do vídeo Bunny.net (ex: 88ba5bdf-332d...)"
                                                />
                                                <input 
                                                  type="number"
                                                  value={lesson.duration}
                                                  onChange={(e) => updateLessonField(mIdx, sIdx, lIdx, 'duration', parseInt(e.target.value, 10) || 0)}
                                                  className="bg-black/40 border border-white/5 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-yellow-500/40 w-24"
                                                  placeholder="Duração (min)"
                                                />
                                              </div>
                                            )}

                                            {lesson.type === 'TEXT' && (
                                              <textarea 
                                                value={lesson.content || ''}
                                                onChange={(e) => updateLessonField(mIdx, sIdx, lIdx, 'content', e.target.value)}
                                                className="bg-black/40 border border-white/5 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-yellow-500/40 w-full resize-y h-16"
                                                placeholder="Escreva ou cole o conteúdo enriquecido em markdown/HTML da aula..."
                                              />
                                            )}
                                          </div>

                                          <button 
                                            onClick={() => removeLesson(mIdx, sIdx, lIdx)}
                                            className="p-1.5 rounded hover:bg-red-500/10 text-slate-500 hover:text-red-400 self-end md:self-auto transition-colors"
                                            title="Excluir Aula"
                                          >
                                            <Trash2 className="w-3.5 h-3.5" />
                                          </button>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}
            
          </motion.div>
        </div>
      </div>
    </div>
  );
}
