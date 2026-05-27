import CheckoutClient from "./CheckoutClient";

// generateStaticParams é necessário para permitir que rotas dinâmicas
// funcionem em compilações de exportação estática (Next.js Static HTML Export)
export async function generateStaticParams() {
  return [
    { id: "1" },
    { id: "2" },
    { id: "3" },
    { id: "4" },
    { id: "5" },
    { id: "6" },
    { id: "7" },
    { id: "8" },
    { id: "9" },
    { id: "10" }
  ];
}

export default function CheckoutPage() {
  return <CheckoutClient />;
}
