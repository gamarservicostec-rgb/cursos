'use client';

import { useState, useEffect, FormEvent } from 'react';
import { api } from '@/services/api';
import Link from 'next/link';

interface Course {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  summary: string | null;
  price: number;
  duration: number | null;
  thumbnail: string | null;
  status: string;
  createdAt: string;
  _count?: { classes: number };
}

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  DRAFT: { bg: 'rgba(245, 158, 11, 0.15)', text: '#fbbf24', label: 'Rascunho' },
  PUBLISHED: { bg: 'rgba(34, 197, 94, 0.15)', text: '#4ade80', label: 'Publicado' },
  ARCHIVED: { bg: 'rgba(107, 114, 128, 0.15)', text: '#9ca3af', label: 'Arquivado' },
};

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    summary: '',
    price: 0,
    duration: 0,
    status: 'DRAFT',
  });

  useEffect(() => {
    loadCourses();
  }, [filter]);

  const loadCourses = async () => {
    try {
      const data = await api.getCourses(filter || undefined);
      setCourses(data);
    } catch (err) {
      console.error('Erro ao carregar cursos:', err);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingCourse(null);
    setFormData({ title: '', description: '', summary: '', price: 0, duration: 0, status: 'DRAFT' });
    setError('');
    setShowModal(true);
  };

  const openEdit = (course: Course) => {
    setEditingCourse(course);
    setFormData({
      title: course.title,
      description: course.description || '',
      summary: course.summary || '',
      price: course.price,
      duration: course.duration || 0,
      status: course.status,
    });
    setError('');
    setShowModal(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        duration: formData.duration ? Number(formData.duration) : null,
        description: formData.description || null,
        summary: formData.summary || null,
      };

      if (editingCourse) {
        await api.updateCourse(editingCourse.id, payload);
      } else {
        await api.createCourse(payload);
      }

      setShowModal(false);
      loadCourses();
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este curso?')) return;
    try {
      await api.deleteCourse(id);
      loadCourses();
    } catch (err: any) {
      alert(err.message || 'Erro ao excluir');
    }
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
    <div className="space-y-6 animate-fade-in-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Cursos</h1>
          <p className="text-slate-400 mt-1">Gerencie os cursos da plataforma</p>
        </div>
        <Link href="/gerenciar-cursos/novo" className="btn-primary flex items-center gap-2" id="btn-create-course">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Novo Curso
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {[
          { value: '', label: 'Todos' },
          { value: 'DRAFT', label: 'Rascunho' },
          { value: 'PUBLISHED', label: 'Publicado' },
          { value: 'ARCHIVED', label: 'Arquivado' },
        ].map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
              filter === f.value
                ? 'text-white shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-[#27272a]'
            }`}
            style={filter === f.value ? { background: 'rgba(212, 175, 55, 0.15)', border: '1px solid rgba(212, 175, 55, 0.3)', color: 'var(--color-primary)' } : { background: 'rgba(30,30,30,0.5)', border: '1px solid rgba(60,60,60,0.5)' }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="glass rounded-2xl overflow-hidden">
        {courses.length === 0 ? (
          <div className="text-center py-16">
            <svg className="w-16 h-16 mx-auto text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <p className="text-slate-400 text-lg">Nenhum curso encontrado</p>
            <p className="text-slate-600 text-sm mt-1">Comece criando seu primeiro curso</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: 'rgba(18, 18, 18, 0.5)' }}>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-4">Curso</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-4">Preço</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-4">Duração</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-4">Turmas</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-4">Status</th>
                  <th className="text-right text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-4">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#27272a]">
                {courses.map((course) => (
                  <tr key={course.id} className="hover:bg-[#18181b] transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-semibold text-white">{course.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">/{course.slug}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-emerald-400">
                        R$ {course.price.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300">
                      {course.duration ? `${course.duration}h` : '—'}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300">
                      {course._count?.classes || 0}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold"
                        style={{
                          backgroundColor: statusConfig[course.status]?.bg,
                          color: statusConfig[course.status]?.text,
                        }}
                      >
                        {statusConfig[course.status]?.label || course.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/gerenciar-cursos/novo?id=${course.id}`}
                          className="p-2 rounded-lg text-slate-400 hover:text-[var(--color-primary)] hover:bg-[#27272a] transition-all"
                          title="Editar"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </Link>
                        <button
                          onClick={() => handleDelete(course.id)}
                          className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-[#27272a] transition-all"
                          title="Excluir"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative glass rounded-2xl p-8 w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fade-in-up"
            style={{ border: '1px solid rgba(60, 60, 60, 0.6)' }}>
            <h2 className="text-2xl font-bold text-white mb-6">
              {editingCourse ? 'Editar Curso' : 'Novo Curso'}
            </h2>

            {error && (
              <div className="p-3 rounded-xl text-sm font-medium bg-red-500/10 border border-red-500/30 text-red-400 mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Título *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="input-field"
                  placeholder="Nome do curso"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Descrição</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="input-field resize-none"
                  rows={3}
                  placeholder="Descrição detalhada do curso"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Resumo</label>
                <input
                  type="text"
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  className="input-field"
                  placeholder="Resumo breve para listagem"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Preço (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Duração (horas)</label>
                  <input
                    type="number"
                    min="0"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="input-field"
                >
                  <option value="DRAFT">Rascunho</option>
                  <option value="PUBLISHED">Publicado</option>
                  <option value="ARCHIVED">Arquivado</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 rounded-xl font-medium text-slate-300 border border-[#27272a] hover:bg-[#18181b] transition-all"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 btn-primary flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Salvando...
                    </>
                  ) : (
                    editingCourse ? 'Salvar Alterações' : 'Criar Curso'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
