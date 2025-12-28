import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

const SEO = ({ title, description, name, type }) => {
  const { t } = useTranslation();

  const siteTitle = t('seo.title', 'Mass Index');
  const metaDescription = description || t('seo.description', 'Calculate your Body Mass Index (BMI) accurately.');
  
  // If a specific title is provided, append the site title. Otherwise just show site title.
  // Example: "Calculator | Mass Index" or just "Mass Index"
  const fullTitle = title ? `${title} | ${siteTitle}` : siteTitle;

  return (
    <Helmet>
      {/* Standard metadata tags */}
      <title>{fullTitle}</title>
      <meta name='description' content={metaDescription} />
      
      {/* Open Graph tags (optional but good for SEO) */}
      <meta property="og:type" content={type || 'website'} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={metaDescription} />
      {/* <meta property="og:image" content={image} />  -- Add if we have an image */}
      
      {/* Twitter Card tags */}
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={metaDescription} />
    </Helmet>
  );
};

export default SEO;
