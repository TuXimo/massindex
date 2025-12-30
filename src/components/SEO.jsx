import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

const SEO = ({ title, description, keywords, name, type }) => {
  const { t, i18n } = useTranslation();

  const siteTitle = t('seo.title', 'Mass Index');
  const metaDescription = description || t('seo.description', 'Calculate your Body Mass Index (BMI) accurately.');
  const metaKeywords = keywords || t('seo.keywords', 'BMI, body mass index, mass index, health, calculator');
  
  // If a specific title is provided, append the site title. Otherwise just show site title.
  // Example: "Calculator | Mass Index" or just "Mass Index"
  const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;

  return (
    <Helmet>
      {/* Set the HTML lang attribute dynamically */}
      <html lang={i18n.language} />
      
      {/* Standard metadata tags */}
      <title>{fullTitle}</title>
      <meta name='description' content={metaDescription} />
      <meta name="keywords" content={metaKeywords} />
      
      {/* Open Graph tags (optional but good for SEO) */}
      <meta property="og:type" content={type || 'website'} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:locale" content={i18n.language} />
      <meta property="og:image" content="https://www.massindex.fit/og-image.jpg" />
      
      {/* Twitter Card tags */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content="https://www.massindex.fit/og-image.jpg" />
    </Helmet>
  );
};

export default SEO;
