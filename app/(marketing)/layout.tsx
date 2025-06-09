// app/(marketing)/layout.tsx
import { PublicNavbar } from "@/components/layout/PublicNavbar"; // Ajusta la ruta
import { Footer } from "@/components/layout/Footer"; // Ajusta la ruta

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <PublicNavbar />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
