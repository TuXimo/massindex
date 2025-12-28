
import Header from './Header';
import Footer from './Footer';

export default function Layout({ children }) {
  return (
    <div className="h-screen w-full flex flex-col font-sans overflow-x-hidden overflow-y-auto touch-manipulation pb-6">
      <Header />
      <main className="grow flex flex-col items-center p-3 lg:p-6">
         {children}
      </main>
      <Footer />
    </div>
  );
}
