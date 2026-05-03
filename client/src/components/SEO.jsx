import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, keywords, image, url }) => {
  const siteName = 'GoElectriQ';
  const fullTitle = title ? `${title} | ${siteName}` : siteName;
  const defaultDescription = 'GoElectriQ - Premium Electric Cab Booking & Tour Packages. Eco-friendly, reliable, and affordable electric vehicle rides for local and intercity travel.';
  const defaultImage = '/og-image.png'; // Make sure this exists in public folder
  const siteUrl = window.location.origin;

  return (
    <Helmet>
      {/* Basic Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="description" content={description || defaultDescription} />
      <meta name="keywords" content={keywords || 'electric cab, ev booking, tour packages, eco-friendly travel, intercity cab, airport pickup'} />
      <meta name="author" content="GoElectriQ Team" />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url || window.location.href} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description || defaultDescription} />
      <meta property="og:image" content={image || `${siteUrl}${defaultImage}`} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url || window.location.href} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description || defaultDescription} />
      <meta property="twitter:image" content={image || `${siteUrl}${defaultImage}`} />

      {/* Canonical Link */}
      <link rel="canonical" href={url || window.location.href} />
    </Helmet>
  );
};

export default SEO;
