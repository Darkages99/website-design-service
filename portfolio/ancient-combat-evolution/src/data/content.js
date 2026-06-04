// ---------------------------------------------------------------------------
//  Ancient Combat Evolution — single source of truth for all site copy.
//  Founder-editable: change text here, rebuild, done. Placeholders that must be
//  swapped before launch are wrapped with the BRACKET convention e.g. PHONE.
// ---------------------------------------------------------------------------

// [PHONE NUMBER] — placeholder, replace with the gym's real number.
export const PHONE_DISPLAY = '+91 98765 43210'
export const PHONE_E164 = '919876543210' // for tel: and wa.me links

export const BUSINESS = {
  name: 'Ancient Combat Evolution',
  shortName: 'ACE',
  tagline: 'Where Ancient Discipline Meets Modern Combat.',
  address: '2, Ashoka Street, Sri Ram Colony, Abiramapuram, Alwarpet, Chennai, 600018',
  locality: 'Alwarpet, Chennai',
  hours: '6:00–9:30 AM  |  5:30–9:00 PM',
  days: 'Monday – Sunday',
  rating: '5/5',
  reviews: '12+',
  // [LAT/LONG] — placeholder coordinates for Alwarpet, Chennai. Replace with exact.
  mapLat: '13.0388',
  mapLng: '80.2487',
}

// Pre-filled WhatsApp click-to-chat
export const WHATSAPP_LINK = `https://wa.me/${PHONE_E164}?text=${encodeURIComponent(
  'Hi Ancient Combat Evolution, I want to book a trial class.'
)}`

export const TEL_LINK = `tel:+${PHONE_E164}`

export const MAPS_DIRECTIONS = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
  BUSINESS.address
)}`

// Google Maps embed — uses an address-query embed (no API key needed).
// For a precise pin, swap to an API-key embed using BUSINESS.mapLat/mapLng.
export const MAPS_EMBED = `https://www.google.com/maps?q=${encodeURIComponent(
  BUSINESS.address
)}&output=embed`

export const NAV_LINKS = [
  { label: 'The Arena', href: '#about' },
  { label: 'Programs', href: '#programs' },
  { label: 'Schedule', href: '#schedule' },
  { label: 'Fighters', href: '#testimonials' },
  { label: 'Find Us', href: '#location' },
]

export const STATS = [
  { value: '5/5', label: 'Rating' },
  { value: '12+', label: 'Reviews' },
  { value: '7', label: 'Days Open' },
  { value: 'All', label: 'Ages' },
]

export const PROGRAMS = [
  {
    id: 'boxing',
    icon: 'glove',
    title: 'Boxing',
    blurb: 'The sweet science. Footwork, defense, and knockout power.',
  },
  {
    id: 'muay-thai',
    icon: 'shin',
    title: 'Muay Thai',
    blurb: 'The art of eight limbs. Elbows, knees, and clinch warfare.',
  },
  {
    id: 'bjj',
    icon: 'belt',
    title: 'Brazilian Jiu Jitsu',
    blurb: 'Ground control and submission mastery.',
  },
  {
    id: 'strength',
    icon: 'kettlebell',
    title: 'Strength & Conditioning',
    blurb: 'Fight-ready fitness. Not gym-fit. Fight-fit.',
  },
]

// REAL testimonials — used exactly as provided.
export const TESTIMONIALS = [
  {
    quote:
      'The boxing training at ACE completely transformed my fitness. The coaches are friendly, motivating, and truly know their craft.',
    author: 'Member Review',
  },
  {
    quote:
      'Top-notch facilities in a convenient Alwarpet location. I came for fitness, stayed for the community.',
    author: 'Member Review',
  },
  {
    quote:
      'ACE has had a massive positive impact on both my mental and physical well-being. This is more than a gym — it’s a transformation space.',
    author: 'Member Review',
  },
]

export const SCHEDULE = [
  {
    period: 'Morning',
    time: '6:00 – 9:30 AM',
    focus: 'Boxing & Fitness',
    accent: 'gold',
  },
  {
    period: 'Evening',
    time: '5:30 – 9:00 PM',
    focus: 'MMA, BJJ & Muay Thai',
    accent: 'red',
  },
]
