import { useTranslation } from 'react-i18next';

export default function Footer() {
  const { t } = useTranslation();
  return (
    <footer className="w-full py-8 mt-auto text-center">
      <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 opacity-60 hover:opacity-100 transition-opacity">
        <p>
          &copy; {new Date().getFullYear()} MassIndex. {t('footer.designedFor')}
        </p>
      </div>
    </footer>
  );
}
