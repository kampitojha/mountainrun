const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://mountainrun.in';

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Mountain Run',
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  description: 'India\'s premier virtual running events platform with GPS verification, UPI registration, medals, and certificates.',
  sameAs: [
    'https://twitter.com/mountainrun',
    'https://instagram.com/mountainrun',
    'https://facebook.com/mountainrun',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    telephone: '+91-XXXXXXXXXX',
    contactType: 'customer service',
    availableLanguage: 'English',
  },
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'IN',
  },
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Mountain Run',
  url: SITE_URL,
  description: 'Join India\'s premier virtual running events. Register with UPI, track with GPS, earn medals & certificates.',
  potentialAction: {
    '@type': 'SearchAction',
    target: `${SITE_URL}/events?search={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
};

export function StructuredData() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
    </>
  );
}
