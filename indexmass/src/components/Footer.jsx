export default function Footer() {
  return (
    <footer className="w-full py-6 border-t-2 border-black mt-auto bg-white">
      <div className="text-center text-xs font-bold uppercase tracking-widest text-black">
        <p>
          &copy; {new Date().getFullYear()} MassIndex. Diseñado para tu salud.
        </p>
      </div>
    </footer>
  );
}
