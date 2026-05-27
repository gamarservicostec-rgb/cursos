import CourseDetailClient from "./CourseDetailClient";

// generateStaticParams é necessário para permitir que rotas dinâmicas
// funcionem em compilações de exportação estática (Next.js Static HTML Export)
export async function generateStaticParams() {
  return [
    { slug: "design-grafico-profissional" },
    { slug: "informatica-avancada-e-office" }
  ];
}

export default function CourseDetailPage() {
  return <CourseDetailClient />;
}
