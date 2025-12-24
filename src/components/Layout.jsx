
import Header from './Header';
import Footer from './Footer';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen w-full flex flex-col font-sans overflow-x-hidden">
      <Header />
      <main className="grow flex items-center justify-center p-4 lg:p-6">
         {children}
      </main>
      <Footer />
    </div>
  );
}
