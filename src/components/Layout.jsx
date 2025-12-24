
import Header from './Header';
import Footer from './Footer';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen w-full flex flex-col bg-white text-black font-mono overflow-x-hidden">
      <Header />
      <main className="grow flex items-center justify-center p-6 grayscale">
         {children}
      </main>
      <Footer />
    </div>
  );
}
