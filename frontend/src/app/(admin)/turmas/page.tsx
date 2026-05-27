'use client';

import { useState, useEffect, FormEvent } from 'react';
import { api } from '@/services/api';

interface ClassItem {
  id: number;
  courseId: number;
  name: string;
  startDate: string;
  endDate: string;
  schedule: string | null;
  maxStudents: number;
  status: string;
  createdAt: string;
  course?: { id: number; title: string; slug: string };
  _count?: { enrollments: number };
}

interface CourseOption {
  id: number;
  title: string;
}

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  SCHEDULED: { bg: 'rgba(59, 130, 246, 0.15)', text: '#60a5fa', label: 'Agendada' },
  IN_PROGRESS: { bg: 'rgba(34, 197, 94, 0.15)', text: '#4ade80', label: 'Em Andamento' },
  COMPLETED: { bg: 'rgba(107, 114, 128, 0.15)', text: '#9ca3af', label: 'Concluída' },
  CANCELLED: { bg: 'rgba(239, 68, 68, 0.15)', text: '#f87171', label: 'Cancelada' },
};

export default function AdminTurmasPage() {
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingClass, setEditingClass] = useState<ClassItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    courseId: 0,
    name: '',
    startDate: '',
    endDate: '',
    schedule: '',
    maxStudents: 30,
    status: 'SCHEDULED',
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [classData, courseData] = await Promise.all([
        api.getClasses(),
        api.getCourses(),
      ]);
      setClasses(classData);
      setCourses(courseData.map((c: any) => ({ id: c.id, title: c.title })));
    } catch (err) {
      console.error('Erro ao carregar turmas:', err);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingClass(null);
    setFormData({
      courseId: courses.length > 0 ? courses[0].id : 0,
      name: '',
      startDate: '',
      endDate: '',
      schedule: '',
      maxStudents: 30,
      status: 'SCHEDULED',
    });
    setError('');
    setShowModal(true);
  };

  const openEdit = (item: ClassItem) => {
    setEditingClass(item);
    setFormData({
      courseId: item.courseId,
      name: item.name,
      startDate: item.startDate.split('T')[0],
      endDate: item.endDate.split('T')[0],
      schedule: item.schedule || '',
      maxStudents: item.maxStudents,
      status: item.status,
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
        courseId: Number(formData.courseId),
        maxStudents: Number(formData.maxStudents),
        schedule: formData.schedule || null,
      };

      if (editingClass) {
        await api.updateClass(editingClass.id, payload);
      } else {
        await api.createClass(payload);
      }

      setShowModal(false);
      loadData();
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta turma?')) return;
    try {
      await api.deleteClass(id);
      loadData();
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
          <h1 className="text-3xl font-bold text-white">Turmas</h1>
          <p className="text-slate-400 mt-1">Gerencie as turmas de cada curso</p>
        </div>
        <button onClick={openCreate} className="btn-primary flex items-center gap-2" id="btn-create-class">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nova Turma
        </button>
      </div>

      {/* Table */}
      <div className="glass rounded-2xl overflow-hidden">
        {classes.length === 0 ? (
          <div className="text-center py-16">
            <svg className="w-16 h-16 mx-auto text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <p className="text-slate-400 text-lg">Nenhuma turma encontrada</p>
            <p className="text-slate-600 text-sm mt-1">Crie sua primeira turma</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: 'rgba(15, 23, 42, 0.5)' }}>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-4">Turma</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-4">Curso</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-4">Período</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-4">Vagas</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-4">Status</th>
                  <th className="text-right text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-4">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {classes.map((item) => {
                  const enrolled = item._count?.enrollments || 0;
                  const vacancyPercent = (enrolled / item.maxStudents) * 100;
                  return (
                    <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-white">{item.name}</p>
                        {item.schedule && (
                          <p className="text-xs text-slate-500 mt-0.5">{item.schedule}</p>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-300">
                        {item.course?.title || '—'}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-slate-300">
                          {new Date(item.startDate).toLocaleDateString('pt-BR')}
                        </p>
                        <p className="text-xs text-slate-500">
                          até {new Date(item.endDate).toLocaleDateString('pt-BR')}
                        </p>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 max-w-[80px]">
                            <div className="h-1.5 rounded-full bg-slate-700">
                              <div
                                className="h-1.5 rounded-full transition-all"
                                style={{
                                  width: `${Math.min(vacancyPercent, 100)}%`,
                                  background: vacancyPercent >= 90 ? '#ef4444' : vacancyPercent >= 70 ? '#f59e0b' : '#22c55e',
                                }}
                              />
                            </div>
                          </div>
                          <span className="text-xs text-slate-400">{enrolled}/{item.maxStudents}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold"
                          style={{
                            backgroundColor: statusConfig[item.status]?.bg,
                            color: statusConfig[item.status]?.text,
                          }}
                        >
                          {statusConfig[item.status]?.label || item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEdit(item)}
                            className="p-2 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-slate-800/50 transition-all"
                            title="Editar"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-2 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800/50 transition-all"
                            title="Excluir"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
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
            style={{ border: '1px solid rgba(51, 65, 85, 0.6)' }}>
            <h2 className="text-2xl font-bold text-white mb-6">
              {editingClass ? 'Editar Turma' : 'Nova Turma'}
            </h2>

            {error && (
              <div className="p-3 rounded-xl text-sm font-medium bg-red-500/10 border border-red-500/30 text-red-400 mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Curso *</label>
                <select
                  value={formData.courseId}
                  onChange={(e) => setFormData({ ...formData, courseId: parseInt(e.target.value) })}
                  className="input-field"
                  required
                >
                  <option value={0} disabled>Selecione um curso</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Nome da Turma *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  placeholder="Ex: Turma A - Manhã"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Início *</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Término *</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    className="input-field"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Horário</label>
                <input
                  type="text"
                  value={formData.schedule}
                  onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                  className="input-field"
                  placeholder="Ex: Seg/Qua/Sex 08:00-12:00"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Máx. Alunos</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.maxStudents}
                    onChange={(e) => setFormData({ ...formData, maxStudents: parseInt(e.target.value) || 30 })}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="input-field"
                  >
                    <option value="SCHEDULED">Agendada</option>
                    <option value="IN_PROGRESS">Em Andamento</option>
                    <option value="COMPLETED">Concluída</option>
                    <option value="CANCELLED">Cancelada</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-3 rounded-xl font-medium text-slate-300 border border-slate-600 hover:bg-slate-800/50 transition-all"
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
                    editingClass ? 'Salvar Alterações' : 'Criar Turma'
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
