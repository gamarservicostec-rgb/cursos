'use client';

import { Suspense } from 'react';
import CourseDetailClient from '../[slug]/CourseDetailClient';

// Como o Next.js no modo export estático requer que o useSearchParams esteja envolvido em Suspense,
// nós o envolvemos aqui para garantir que funcione perfeitamente.
export default function CursoDetalhesQueryPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center">
        <svg className="animate-spin h-10 w-10 text-yellow-500" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </main>
    }>
      <CourseDetailClient />
    </Suspense>
  );
}
