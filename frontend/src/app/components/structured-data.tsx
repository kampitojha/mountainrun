const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://mountainrun.in';

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'SportsOrganization',
  name: 'Mountain Run',
  alternateName: [
    'MountainRun India',
    'Mountain Run Virtual Marathon & Running Events',
    'Mountain Run Virtual Races India',
  ],
  url: SITE_URL,
  logo: `${SITE_URL}/logo-mark.svg`,
  image: `${SITE_URL}/og-image.png`,
  description:
    "India's leading GPS-verified virtual running and marathon platform. Offering 1.5K, 3K, 5K, 10K, and 21K Half Marathon challenges. Runners earn authentic heavy metal 3D finisher medals, performance t-shirts, and instant QR-verified digital certificates with free doorstep delivery nationwide.",
  slogan: 'Run Anywhere. Your Pace. Your Proof.',
  sport: [
    'Running',
    'Marathon',
    'Half Marathon',
    '5K Run',
    '10K Run',
    'Trail Running',
    'Cycling Challenge',
    'Fitness Walking',
  ],
  knowsAbout: [
    'Virtual Marathons in India',
    'GPS Running Verification (Strava & Garmin)',
    'Finisher Medals and T-shirts',
    'Online Running Challenges',
    'Marathon Timing Certificates',
    'Indian Running Community',
  ],
  sameAs: [
    'https://instagram.com/mountainrunofficial',
    'https://facebook.com/mountainrunofficial',
    'https://twitter.com/mountainrun',
    'https://wa.me/917518418960',
  ],
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'IN',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer support',
    email: 'mountainrunofficial@gmail.com',
    telephone: '+91-7518418960',
    areaServed: 'IN',
    availableLanguage: ['English', 'Hindi'],
  },
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Mountain Run',
  alternateName: 'Mountain Run - Virtual Running Events & Marathons India',
  url: SITE_URL,
  description:
    'Join India’s top virtual running challenges, marathons, 5K, 10K, and 21K races. Run anywhere across India with Strava or Garmin, submit GPS tracking proof, and receive authentic heavy 3D metal medals and verified digital certificates.',
  inLanguage: 'en-IN',
  potentialAction: {
    '@type': 'SearchAction',
    target: {
      '@type': 'EntryPoint',
      urlTemplate: `${SITE_URL}/events?search={search_term_string}`,
    },
    'query-input': 'required name=search_term_string',
  },
};

const homeFaqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is a virtual marathon and how does Mountain Run work in India?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'A virtual marathon allows you to run anywhere, outdoors or on a treadmill, at your own pace and schedule. Register for any Mountain Run challenge, complete your chosen distance (1.5 km, 3 km, 5 km, 10 km, or 21 km Half Marathon) using any GPS tracking app (Strava, Garmin, Nike Run Club, Apple Fitness, Google Fit), and upload your activity screenshot on your runner dashboard. Once verified by our arbiters, your official verifiable E-Certificate is generated instantly and your physical heavy metal finisher medal is dispatched to your doorstep.',
      },
    },
    {
      '@type': 'Question',
      name: 'What distances and categories are available in Mountain Run virtual events?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We offer multiple distance categories for all fitness levels: 1.5K / 3K (Starter & Youth), 5K (Classic Fun Run), 10K (Endurance Challenge), 21K (Half Marathon), as well as Walking and Cycling distance categories. Every distance entry receives the complete finisher reward kit.',
      },
    },
    {
      '@type': 'Question',
      name: 'Which GPS running apps and smartwatches are accepted for race proof?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We accept all popular GPS running apps and smartwatches including Strava, Garmin Connect, Nike Run Club (NRC), Adidas Running, Apple Watch / Apple Fitness, Samsung Health, Google Fit, Coros, and Suunto. Outdoor GPS runs as well as treadmill console photos showing elapsed time and distance are accepted.',
      },
    },
    {
      '@type': 'Question',
      name: 'When and how will I receive my physical finisher medal and running kit?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Every finisher with verified GPS proof receives an authentic, heavy die-cast metal embossed finisher medal, custom dri-fit t-shirt, and printed certificate. Kits are dispatched via tracked courier partners (Delhivery, BlueDart, India Post) within 7-10 business days of result verification with live SMS and tracking updates.',
      },
    },
    {
      '@type': 'Question',
      name: 'How do I get my official digital running certificate with QR verification?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Your official certificate is generated automatically as soon as your run proof is approved. Each certificate features a verifiable QR code, unique certificate serial number, verified finish time, pace, and national leaderboard ranking.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can marathon athletes and beginner runners from any Indian city participate?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes! Mountain Run welcomes athletes, marathoners, joggers, and beginners from all 28 states and union territories in India—including Mumbai, Delhi NCR, Bengaluru, Pune, Hyderabad, Chennai, Kolkata, Ahmedabad, Jaipur, Lucknow, and tier-2/tier-3 cities. We deliver medals to all 19,000+ Indian pincodes with zero shipping fees.',
      },
    },
  ],
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeFaqSchema) }}
      />
    </>
  );
}
