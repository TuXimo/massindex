import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default function PageTitle() {
  const { t } = useTranslation();

  useEffect(() => {
    document.title = t('header.title');
  }, [t]);

  return null;
}
