'use client';

import { useState, useEffect } from 'react';
import { api } from '@/services/api';

interface Student {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  status: string;
  createdAt: string;
}

const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
  ACTIVE: { bg: 'rgba(34, 197, 94, 0.15)', text: '#4ade80', label: 'Ativo' },
  INACTIVE: { bg: 'rgba(245, 158, 11, 0.15)', text: '#fbbf24', label: 'Inativo' },
  BLOCKED: { bg: 'rgba(239, 68, 68, 0.15)', text: '#f87171', label: 'Bloqueado' },
};

const roleConfig: Record<string, { bg: string; text: string; label: string }> = {
  ADMIN: { bg: 'rgba(139, 92, 246, 0.15)', text: '#a78bfa', label: 'Admin' },
  STUDENT: { bg: 'rgba(59, 130, 246, 0.15)', text: '#60a5fa', label: 'Aluno' },
  INSTRUCTOR: { bg: 'rgba(217, 70, 239, 0.15)', text: '#e879f9', label: 'Instrutor' },
};

export default function AdminAlunosPage() {
  const [users, setUsers] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const data = await api.getUsers();
      setUsers(data);
    } catch (err) {
      console.error('Erro ao carregar usuários:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter((u) =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

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
          <h1 className="text-3xl font-bold text-white">Alunos e Usuários</h1>
          <p className="text-slate-400 mt-1">{users.length} usuários cadastrados</p>
        </div>
      </div>

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
          placeholder="Buscar por nome ou e-mail..."
          id="search-users"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Alunos', count: users.filter(u => u.role === 'STUDENT').length, gradient: 'linear-gradient(135deg, #3b82f6, #1d4ed8)' },
          { label: 'Instrutores', count: users.filter(u => u.role === 'INSTRUCTOR').length, gradient: 'linear-gradient(135deg, #d946ef, #a21caf)' },
          { label: 'Admins', count: users.filter(u => u.role === 'ADMIN').length, gradient: 'linear-gradient(135deg, #8b5cf6, #6d28d9)' },
        ].map((stat) => (
          <div key={stat.label} className="glass rounded-xl p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-lg font-bold"
              style={{ background: stat.gradient }}>
              {stat.count}
            </div>
            <span className="text-sm text-slate-300 font-medium">{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="glass rounded-2xl overflow-hidden">
        {filteredUsers.length === 0 ? (
          <div className="text-center py-16">
            <svg className="w-16 h-16 mx-auto text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
            <p className="text-slate-400 text-lg">
              {search ? 'Nenhum resultado encontrado' : 'Nenhum usuário cadastrado'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr style={{ background: 'rgba(15, 23, 42, 0.5)' }}>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-4">Usuário</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-4">Contato</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-4">Função</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-4">Status</th>
                  <th className="text-left text-xs font-semibold text-slate-400 uppercase tracking-wider px-6 py-4">Cadastro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/30">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                          style={{ background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
                        >
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{user.name}</p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-300">
                      {user.phone || '—'}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold"
                        style={{
                          backgroundColor: roleConfig[user.role]?.bg,
                          color: roleConfig[user.role]?.text,
                        }}
                      >
                        {roleConfig[user.role]?.label || user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className="inline-flex px-2.5 py-1 rounded-full text-xs font-semibold"
                        style={{
                          backgroundColor: statusConfig[user.status]?.bg,
                          color: statusConfig[user.status]?.text,
                        }}
                      >
                        {statusConfig[user.status]?.label || user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-400">
                      {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
