import Header from './Header';
import Footer from './Footer';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[#f6f3ee]">
      <Header />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}