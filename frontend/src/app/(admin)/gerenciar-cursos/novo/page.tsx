'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
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
  Plus
} from 'lucide-react';
import Link from 'next/link';

export default function NewCoursePage() {
  const [activeTab, setActiveTab] = useState('informacoes');

  const tabs = [
    { id: 'informacoes', label: '1. Informações Básicas', icon: AlignLeft },
    { id: 'visual', label: '2. Identidade Visual', icon: ImageIcon },
    { id: 'grade', label: '3. Grade Curricular', icon: Layers },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-yellow-500/80 mb-2 font-medium">
            <Link href="/gerenciar-cursos" className="hover:text-yellow-400 transition-colors">Cursos</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-white">Criar Novo Curso</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">Criador de Experiência</h1>
          <p className="text-slate-400 mt-1">Configure as informações, identidade visual e a grade curricular do seu novo curso.</p>
        </div>

        <div className="flex gap-3">
          <Link href="/gerenciar-cursos">
            <button className="px-6 py-2.5 rounded-xl font-bold text-slate-300 hover:text-white glass-panel hover:bg-white/5 transition-all">
              Cancelar
            </button>
          </Link>
          <button className="px-6 py-2.5 rounded-xl font-bold text-black bg-gradient-to-r from-yellow-400 to-yellow-500 hover:to-yellow-400 shadow-[0_0_20px_rgba(234,179,8,0.3)] hover:shadow-[0_0_30px_rgba(234,179,8,0.5)] transition-all flex items-center gap-2 transform hover:-translate-y-0.5">
            <Save className="w-5 h-5" />
            Salvar e Continuar
          </button>
        </div>
      </div>

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
                    placeholder="Ex: Formação Fullstack Masterclass..." 
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-slate-600 focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/50 transition-all text-lg"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-300 ml-1">Resumo Curto (Aparece nos cards)</label>
                  <textarea 
                    rows={2}
                    placeholder="Uma frase de impacto sobre o que o aluno vai aprender..." 
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-slate-600 focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/50 transition-all resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-300 ml-1">Descrição Completa</label>
                  <textarea 
                    rows={6}
                    placeholder="Detalhe tudo o que o curso oferece, os benefícios, grade de conhecimento..." 
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder-slate-600 focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/50 transition-all resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-300 ml-1 flex items-center gap-2">
                      <Clock className="w-4 h-4 text-slate-500" /> Duração (horas)
                    </label>
                    <input 
                      type="number" 
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
                      placeholder="Ex: 297.00" 
                      className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-yellow-500/50 focus:ring-1 focus:ring-yellow-500/50 transition-all"
                    />
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
                <p className="text-slate-400 text-sm mb-6">Arraste as imagens direto do seu computador. O sistema de upload fará o processamento automático.</p>
                
                {/* Upload Thumbnail */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-base font-bold text-white flex items-center gap-2">
                      <Layout className="w-5 h-5 text-yellow-500" /> Thumbnail do Curso (Card)
                    </label>
                    <span className="text-xs text-slate-500 bg-white/5 px-3 py-1 rounded-full">Recomendado: 800x600px</span>
                  </div>
                  <div className="border-2 border-dashed border-white/10 rounded-3xl p-10 flex flex-col items-center justify-center bg-black/20 hover:bg-black/40 hover:border-yellow-500/50 transition-all cursor-pointer group relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <UploadCloud className="w-12 h-12 text-slate-600 group-hover:text-yellow-400 mb-4 transition-colors" />
                    <p className="text-lg font-bold text-slate-300 group-hover:text-white transition-colors">Clique ou arraste a imagem do Card</p>
                    <p className="text-sm text-slate-500 mt-1">JPG, PNG ou WEBP até 5MB</p>
                  </div>
                </div>

                {/* Upload Banner */}
                <div className="space-y-3 pt-6 border-t border-white/5">
                  <div className="flex items-center justify-between">
                    <label className="text-base font-bold text-white flex items-center gap-2">
                      <MonitorPlay className="w-5 h-5 text-yellow-500" /> Banner Principal (Capa Interna)
                    </label>
                    <span className="text-xs text-slate-500 bg-white/5 px-3 py-1 rounded-full">Recomendado: 1920x600px</span>
                  </div>
                  <div className="border-2 border-dashed border-white/10 rounded-3xl p-12 flex flex-col items-center justify-center bg-black/20 hover:bg-black/40 hover:border-yellow-500/50 transition-all cursor-pointer group relative overflow-hidden aspect-[21/9]">
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent to-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <ImageIcon className="w-12 h-12 text-slate-600 group-hover:text-yellow-400 mb-4 transition-colors" />
                    <p className="text-lg font-bold text-slate-300 group-hover:text-white transition-colors">Arraste o Banner Full HD aqui</p>
                    <p className="text-sm text-slate-500 mt-1">Essa imagem ficará no topo da página do curso</p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: GRADE CURRICULAR */}
            {activeTab === 'grade' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                    <Layers className="text-yellow-500 w-6 h-6" />
                    Grade Curricular
                  </h2>
                  <button className="px-4 py-2 rounded-xl text-sm font-bold bg-yellow-500/10 text-yellow-400 hover:bg-yellow-500/20 border border-yellow-500/20 flex items-center gap-2 transition-colors">
                    <Plus className="w-4 h-4" /> Novo Módulo
                  </button>
                </div>
                
                <div className="flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-white/5 rounded-3xl bg-black/20">
                  <Film className="w-16 h-16 text-slate-600 mb-4" />
                  <h3 className="text-xl font-bold text-slate-300">Nenhum módulo criado</h3>
                  <p className="text-slate-500 mt-2 max-w-md">
                    Salve as informações básicas do curso primeiro para liberar a criação avançada de Módulos, Matérias e a integração com as aulas da Bunny.net.
                  </p>
                  <button onClick={() => setActiveTab('informacoes')} className="mt-6 px-6 py-2 rounded-xl glass-panel text-white hover:text-yellow-400 text-sm font-bold transition-colors">
                    Voltar para Informações
                  </button>
                </div>
              </div>
            )}
            
          </motion.div>
        </div>
      </div>
    </div>
  );
}
