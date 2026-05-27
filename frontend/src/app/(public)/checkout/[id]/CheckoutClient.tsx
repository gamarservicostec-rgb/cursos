'use client';

import { useState, useEffect, FormEvent } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { api } from '@/services/api';

interface ClassDetail {
  id: number;
  name: string;
  startDate: string;
  endDate: string;
  schedule: string | null;
  maxStudents: number;
  course: {
    id: number;
    title: string;
    summary: string | null;
    price: number;
    duration: number | null;
  };
}

export default function CheckoutClient() {
  const params = useParams();
  const router = useRouter();
  const classId = parseInt(params?.id as string, 10);

  const { user, isAuthenticated, register } = useAuth();
  const [classItem, setClassItem] = useState<ClassDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Form states (if not authenticated)
  const [regData, setRegData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    cpf: '',
  });

  // Credit card mockup states
  const [paymentData, setPaymentData] = useState({
    cardName: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
  });

  useEffect(() => {
    if (!classId) return;

    api.getClass(classId)
      .then((data) => setClassItem(data))
      .catch((err) => setError(err.message || 'Turma não encontrada'))
      .finally(() => setLoading(false));
  }, [classId]);

  const handlePay = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setProcessing(true);

    try {
      let currentUserId = user?.id;

      // 1. Se não estiver autenticado, criar conta primeiro
      if (!isAuthenticated) {
        if (!regData.name || !regData.email || !regData.password || !regData.cpf) {
          throw new Error('Por favor, preencha todos os dados de cadastro obrigatórios');
        }

        // Executa o registro via AuthContext
        await register({
          name: regData.name,
          email: regData.email,
          password: regData.password,
          phone: regData.phone || undefined,
          cpf: regData.cpf,
        });

        // Tentar obter o profile recém-criado para pegar o ID
        const profile = await api.getProfile();
        currentUserId = profile.id;
      }

      if (!currentUserId) {
        throw new Error('Falha ao identificar usuário. Tente fazer login.');
      }

      // 2. Simular atraso de processamento de pagamento
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // 3. Criar a matrícula como ATIVA diretamente (simulando webhook de pagamento aprovado)
      await api.createEnrollment({
        userId: currentUserId,
        classId: classItem!.id,
        status: 'ACTIVE',
      } as any);

      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Erro ao processar matrícula e pagamento.');
    } finally {
      setProcessing(false);
    }
  };

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

  if (error && !classItem) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center glass rounded-2xl p-8 max-w-md">
          <h1 className="text-3xl font-bold text-white mb-4">Ops!</h1>
          <p className="text-slate-400 mb-6">{error}</p>
          <a href="/cursos" className="btn-primary">Ver outros cursos</a>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen pt-24 pb-16 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-yellow-500/5 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-blue-500/5 blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        {success ? (
          /* Success Screen */
          <div className="max-w-xl mx-auto text-center glass rounded-3xl p-12 border border-green-500/20 animate-fade-in-up">
            <div className="w-20 h-20 bg-green-500/15 rounded-full flex items-center justify-center mx-auto mb-6 text-green-400">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-3">Matrícula Confirmada!</h1>
            <p className="text-slate-300 leading-relaxed mb-8">
              Parabéns! Seu pagamento foi processado com sucesso e sua vaga na turma{' '}
              <span className="text-yellow-400 font-semibold">{classItem?.name}</span> do curso{' '}
              <span className="text-white font-semibold">{classItem?.course.title}</span> está garantida.
            </p>
            <div className="space-y-4">
              <button
                onClick={() => {
                  // Forçar reload e ir pro dashboard
                  window.location.href = '/dashboard';
                }}
                className="btn-primary w-full text-center text-lg py-4 block"
              >
                Acessar Área do Aluno
              </button>
              <a href="/cursos" className="block text-sm text-slate-400 hover:text-white transition-colors">
                Explorar mais cursos
              </a>
            </div>
          </div>
        ) : (
          /* Checkout Grid */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Summary */}
            <div className="lg:col-span-5 space-y-6">
              <div className="glass rounded-2xl p-6 border border-slate-700/40">
                <span className="text-xs font-semibold uppercase tracking-wider text-yellow-400">Você está adquirindo</span>
                <h1 className="text-2xl font-bold text-white mt-1.5 mb-3">{classItem?.course.title}</h1>
                <p className="text-sm text-slate-400 leading-relaxed">{classItem?.course.summary}</p>Option

                <div className="border-t border-slate-700/40 my-5" />

                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-slate-300">
                    <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <span>Turma: <strong className="text-white">{classItem?.name}</strong></span>
                  </div>
                  {classItem?.schedule && (
                    <div className="flex items-center gap-3 text-sm text-slate-300">
                      <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>Horários: <strong className="text-white">{classItem.schedule}</strong></span>
                    </div>
                  )}
                  <div className="flex items-center gap-3 text-sm text-slate-300">
                    <svg className="w-4 h-4 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>Início: <strong className="text-white">{new Date(classItem!.startDate).toLocaleDateString('pt-BR')}</strong></span>
                  </div>
                </div>

                <div className="border-t border-slate-700/40 my-5" />

                <div className="flex justify-between items-end">
                  <span className="text-sm text-slate-400">Total do Investimento</span>
                  <div className="text-right">
                    <span className="text-4xl font-extrabold gradient-text">
                      R$ {classItem?.course.price.toFixed(2)}
                    </span>
                    <span className="block text-xs text-slate-500 mt-1">À vista ou em até 12x no cartão</span>
                  </div>
                </div>
              </div>

              {/* Guarantees */}
              <div className="glass rounded-2xl p-5 border border-slate-700/20 text-xs text-slate-400 space-y-4">
                <div className="flex gap-3">
                  <span className="text-green-400 text-lg">🛡️</span>
                  <div>
                    <strong className="text-slate-300 block mb-0.5">Compra 100% Segura</strong>
                    Seus dados pessoais e de pagamento são protegidos por criptografia SSL de nível bancário.
                  </div>
                </div>
                <div className="flex gap-3">
                  <span className="text-green-400 text-lg">🔄</span>
                  <div>
                    <strong className="text-slate-300 block mb-0.5">Garantia Incondicional de 7 dias</strong>
                    Se não ficar satisfeito com a plataforma, solicite o estorno do valor integral em até 7 dias.
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Payment form */}
            <div className="lg:col-span-7">
              <div className="glass rounded-2xl p-8 border border-slate-700/40">
                <h2 className="text-2xl font-bold text-white mb-6">Finalizar Matrícula</h2>

                {error && (
                  <div className="p-4 rounded-xl text-sm font-medium bg-red-500/10 border border-red-500/30 text-red-400 mb-6">
                    {error}
                  </div>
                )}

                <form onSubmit={handlePay} className="space-y-6">
                  {/* STEP 1: Registration Form (if not logged in) */}
                  {!isAuthenticated && (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="w-6 h-6 rounded-full flex items-center justify-center bg-yellow-500/20 text-yellow-400 text-xs font-bold">1</span>
                        <h3 className="font-semibold text-white">Criar sua Conta</h3>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5">NOME COMPLETO *</label>
                        <input
                          type="text"
                          value={regData.name}
                          onChange={(e) => setRegData({ ...regData, name: e.target.value })}
                          className="input-field"
                          placeholder="Ex: Maria Souza"
                          required={!isAuthenticated}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1.5">E-MAIL *</label>
                          <input
                            type="email"
                            value={regData.email}
                            onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                            className="input-field"
                            placeholder="seu@email.com"
                            required={!isAuthenticated}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1.5">SENHA DE ACESSO (MÍN. 6 CARAC.) *</label>
                          <input
                            type="password"
                            value={regData.password}
                            onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                            className="input-field"
                            placeholder="Defina uma senha"
                            required={!isAuthenticated}
                            minLength={6}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1.5">CPF *</label>
                          <input
                            type="text"
                            value={regData.cpf}
                            onChange={(e) => setRegData({ ...regData, cpf: e.target.value })}
                            className="input-field"
                            placeholder="000.000.000-00"
                            required={!isAuthenticated}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-400 mb-1.5">WHATSAPP / TELEFONE</label>
                          <input
                            type="text"
                            value={regData.phone}
                            onChange={(e) => setRegData({ ...regData, phone: e.target.value })}
                            className="input-field"
                            placeholder="(00) 90000-0000"
                          />
                        </div>
                      </div>

                      <div className="h-px bg-slate-700/40 my-6" />
                    </div>
                  )}

                  {/* STEP 2: Credit Card Payment Info */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-6 h-6 rounded-full flex items-center justify-center bg-yellow-500/20 text-yellow-400 text-xs font-bold">
                        {isAuthenticated ? '1' : '2'}
                      </span>
                      <h3 className="font-semibold text-white">Dados de Pagamento (Cartão de Crédito)</h3>
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">NOME IMPRESSO NO CARTÃO *</label>
                      <input
                        type="text"
                        value={paymentData.cardName}
                        onChange={(e) => setPaymentData({ ...paymentData, cardName: e.target.value })}
                        className="input-field uppercase"
                        placeholder="EX: MARIA SOUZA"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-medium text-slate-400 mb-1.5">NÚMERO DO CARTÃO *</label>
                      <input
                        type="text"
                        value={paymentData.cardNumber}
                        onChange={(e) => setPaymentData({ ...paymentData, cardNumber: e.target.value })}
                        className="input-field"
                        placeholder="0000 0000 0000 0000"
                        maxLength={19}
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5">VALIDADE *</label>
                        <input
                          type="text"
                          value={paymentData.cardExpiry}
                          onChange={(e) => setPaymentData({ ...paymentData, cardExpiry: e.target.value })}
                          className="input-field"
                          placeholder="MM/AA"
                          maxLength={5}
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1.5">CÓD. SEGURANÇA (CVV) *</label>
                        <input
                          type="text"
                          value={paymentData.cardCvv}
                          onChange={(e) => setPaymentData({ ...paymentData, cardCvv: e.target.value })}
                          className="input-field"
                          placeholder="000"
                          maxLength={4}
                          required
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={processing}
                    className="btn-primary w-full py-4 text-center font-bold text-lg flex items-center justify-center gap-2 mt-8 disabled:opacity-50"
                  >
                    {processing ? (
                      <>
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Processando Pagamento...
                      </>
                    ) : (
                      `Pagar R$ ${classItem?.course.price.toFixed(2)}`
                    )}
                  </button>

                  <p className="text-center text-xs text-slate-500 mt-4">
                    Ao confirmar, você concorda com nossos Termos de Serviço e política de privacidade.
                  </p>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
