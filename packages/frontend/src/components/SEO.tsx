// ============================================================
// SEO Component - Dynamic Meta Tags
// ============================================================

import { Helmet } from "react-helmet-async";

interface SEOProps {
  title?: string;
  description?: string;
  keywords?: string;
  ogImage?: string;
  ogType?: string;
  canonical?: string;
  noindex?: boolean;
}

const DEFAULT_TITLE = "Magnma Institute - Your Partner in Education";
const DEFAULT_DESCRIPTION =
  "Magnma Institute is a contemporary education consulting firm specializing in college admissions, scholarships, and career guidance. We help students achieve their educational dreams.";
const DEFAULT_KEYWORDS =
  "education consulting, college admission, scholarship, career coaching, MBBS, B.Tech, MBA, study abroad, India colleges";
const SITE_URL = "https://magnmainstitute.netlify.app";
const DEFAULT_OG_IMAGE = "/assets/images/og-image.jpg";

export default function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords = DEFAULT_KEYWORDS,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = "website",
  canonical,
  noindex = false,
}: SEOProps) {
  const fullTitle = title ? `${title} | Magnma Institute` : DEFAULT_TITLE;
  const fullCanonical = canonical ? `${SITE_URL}${canonical}` : undefined;

  return (
    <Helmet>
      {/* Basic Meta */}
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content="Magnma Institute" />
      <meta name="robots" content={noindex ? "noindex, nofollow" : "index, follow"} />

      {/* Canonical */}
      {fullCanonical && <link rel="canonical" href={fullCanonical} />}

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={fullCanonical || SITE_URL} />
      <meta property="og:image" content={`${SITE_URL}${ogImage}`} />
      <meta property="og:site_name" content="Magnma Institute" />
      <meta property="og:locale" content="en_IN" />

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={`${SITE_URL}${ogImage}`} />

      {/* Additional SEO */}
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="theme-color" content="#0a4d68" />
      <link rel="icon" type="image/png" href="/assets/images/favicon.png" />
    </Helmet>
  );
}
