export interface ExperiencePage {
  slug: string;
  title: string;
  kicker: string;
  hero: string;
  img: string;
  intro: string;
  pillars: { title: string; body: string; stat?: string; icon: string }[];
  facts: [string, string][];
  faq: { q: string; a: string }[];
  note?: string;
  access?: { who: string; what: string }[];
}

export const EXPERIENCES: ExperiencePage[] = [
  {
    slug: 'airport',
    title: 'Airport experience',
    kicker: 'From the kerb to the seat, without the theatre',
    hero: 'Ninety-four percent of our passengers reach their gate without standing in a queue longer than ten minutes.',
    img: '/img/hero.jpg',
    intro:
      'We rebuilt the airport journey around one measurement: the elapsed time between your taxi door and your seat, and how much of it you spent standing. At Accra the median is 24 minutes. At Nairobi it is 31. We publish both, per hour of the day, and staff the counters accordingly.',
    pillars: [
      { title: 'One door, one desk', body: 'Every AeroNova ticket is served at a single row, whatever the cabin. Bags, seats, document checks and disruption help happen at the same counter, with the same person.', stat: '1 row', icon: 'counter' },
      { title: 'Fast track that is not for sale', body: 'Economy Flex and above get the priority lane because they paid for it in the fare. Everyone else gets the same lane when we are the reason they are late.', stat: 'Free', icon: 'zap' },
      { title: 'The 10-minute promise', body: 'If check-in plus security takes you longer than 10 minutes outside peak, tell us at the desk and we put USD 25 on your wallet. We paid it 4,180 times last year.', stat: 'USD 25', icon: 'wallet' },
      { title: 'Boarding that lets people sit down', body: 'Group boarding from the back forward, families first, and no scramble: cabin crew announce the seat blocks, and the gate agent controls the flow.', stat: '5 groups', icon: 'users' },
      { title: 'Assistance as a rota, not a request', body: '38 trained agents at the hub, a five-minute response promise, and a completion rate published monthly. Ninety-nine point two percent last quarter.', stat: '99.2%', icon: 'accessibility' },
      { title: 'Bag drop, not bag queue', body: 'Pre-paid bags go down the dedicated lane at Kotoka rows A–D. Twelve minutes median at 06:00, the busiest hour on the network.', stat: '12 min', icon: 'luggage' },
    ],
    facts: [
      ['Check-in opens', '48 h before departure'],
      ['Counters close', '60 min short-haul · 75 min long-haul'],
      ['Fast track', 'Economy Flex and above, free'],
      ['Lounge access', 'Business, Elite+, or a USD 58 day pass'],
      ['Security median', '6 minutes at ACC · 14 at NBO'],
      ['Gate closing', '10 minutes before departure'],
    ],
    faq: [
      { q: 'How early should I get to the airport?', a: 'Two hours for a short-haul departure from a hub, three for long-haul anywhere. If you have no bags and you check in on the phone, 90 minutes is genuinely enough at Accra — we have timed it.' },
      { q: 'Can I check in a bag at a different airport than my departure?', a: 'At the hubs, yes: “early bag drop” accepts bags up to 24 hours before departure at the Galaxy desk in the arrivals hall. Useful on a late-afternoon flight after a day in the city.' },
      { q: 'What happens if I am late because of a traffic jam?', a: 'Call the number on your booking. We hold the last five seats for anyone in the queue when the counter closes and the duty supervisor re-protects you on the next flight at no cost.' },
      { q: 'Is there a quiet area at the airport?', a: 'The contemplation room is at every Galaxy terminal, unstaffed and unlocked from 04:00. The Climb zone is the opposite: for children, until 21:00.' },
    ],
  },
  {
    slug: 'lounges',
    title: 'Galaxy Lounges',
    kicker: 'Rooms with a view of the ramp',
    hero: 'Nine lounges, one standard: a hot meal, a shower that works, and a chair you can sleep in.',
    img: '/img/lounge.jpg',
    intro:
      'We stopped building lounges as waiting rooms. The Galaxy lounges are designed around the two things a traveller actually needs before a long flight — to eat properly and to be clean — and everything else is a bonus. The Accra flagship grows half its own herbs on the mezzanine, and the barista knows the espresso order of about 200 regulars by number.',
    pillars: [
      { title: 'Real food, all hours', body: 'A chop bar, a rice table, and a proper kitchen until two hours after the last departure. No sad buffet under a heat lamp.', stat: '21 hrs/day', icon: 'utensils' },
      { title: 'Showers you can book', body: 'Individual shower suites with towels, a dryer and amenity kit. At Accra and Nairobi, reserve from the app while you are still airborne.', stat: '12 suites', icon: 'droplets' },
      { title: 'Nap rooms', body: 'Four private cabins with a real bed at Nairobi (24 h) and six at Accra. Two-hour maximum, free for Business and Elite, USD 22 otherwise.', stat: 'USD 22', icon: 'bed' },
      { title: 'Work that is not in a lobby', body: 'Enclosed booths with a door, a 1 Gb wired connection, and printing at the desk. Two conference rooms bookable by the hour.', stat: '1 Gb', icon: 'briefcase' },
      { title: 'Kids who can move', body: 'The Climb zone: a two-storey structure, a reading loft, and a family bathroom with a changing table that folds down.', stat: 'Ages 2–11', icon: 'baby' },
      { title: 'Barista and the beer list', body: 'Two espresso machines a bar, Ghanaian and Kenyan craft lager on tap, and a wine list with nine African bottles that our sommelier chose, not a distributor.', stat: '9 wines', icon: 'wine' },
    ],
    access: [
      { who: 'Nova Business passengers', what: 'Included, plus one guest, at all nine lounges' },
      { who: 'Elite / Elite Plus', what: 'Included with one guest, on any cabin, any airline within the alliance' },
      { who: 'Anyone', what: 'USD 58 day pass from the app, USD 175 family pass for four, subject to capacity' },
      { who: 'Transit over 8 hours', what: 'Free nap-room hour at NBO and ACC, plus a shower booking, on a single ticket' },
    ],
    facts: [
      ['Accra Galaxy T1', 'Open 04:00–01:00 · 1,120 seats · 6 nap rooms'],
      ['Nairobi Concourse C', 'Open 24 hours · 480 seats · 4 nap rooms'],
      ['Johannesburg Terminal A', '05:00–23:00 · 360 seats'],
      ['London T2', '05:00–22:30 · à la carte until 21:00'],
      ['Showers', 'Free, bookable in-app from the air'],
      ['Guest policy', 'One guest at Elite and above; USD 40 otherwise'],
    ],
    faq: [
      { q: 'Can I bring someone?', a: 'Business passengers get one guest. Elite and above get one guest on any cabin. Anyone else adds a guest to a day pass for USD 40 — the app will tell you whether we are at capacity before you pay.' },
      { q: 'What if the lounge is full?', a: 'The app shows live occupancy and wait time. Over 15 minutes we issue a food-and-drink credit instead, automatically, whether or not you asked.' },
      { q: 'Do you have a place to pray?', a: 'Yes, and a contemplation room beside it, both unstaffed and open whenever the terminal is. Qibla direction is marked; water for ablution runs to a floor drain.' },
    ],
    note: 'Capacity is capped at 70% of seats on purpose. A lounge you cannot find a chair in is a corridor with snacks.',
  },
  {
    slug: 'entertainment',
    title: 'Nova Play',
    kicker: 'Screen, headphones, and the quiet channel',
    hero: '380 hours on the seatback, whatever you bring on your own device, and a volume cap that protects row 24.',
    img: '/img/cabin-economy.jpg',
    intro:
      'Entertainment is the part of a long flight you can choose, so we made it deep rather than broad: an African cinema section that is genuinely curated (our programmer is a critic in Lagos), a quiet channel for people who want silence with subtitles, and hardware that does not require you to fight a 40-cm cable.',
    pillars: [
      { title: 'Seatback or your own screen', body: '17.3" 4K HDR in Business and Premium, 10.6" on the A321neo, and everything streamed to your own device on the narrowbody fleet at no charge.', stat: '4K HDR', icon: 'video' },
      { title: 'African cinema, properly', body: '180 features with a curator who is not selling anything: Ghasllywood, Kerafactories, Sahelian new wave, plus the rest of the world.', stat: '180 films', icon: 'film' },
      { title: 'Bluetooth pairing', body: 'Pair your own headphones once; it remembers you across aircraft for 90 days. Headsets are still handed out in Business.', stat: '90 days', icon: 'headphones' },
      { title: 'The quiet channel', body: 'Subtitled content at 60% volume with no audio in the aisle. Turn it on in the first five minutes and the crew know not to offer the drinks trolley twice.', stat: 'One tap', icon: 'volume' },
      { title: 'Kids who are occupied', body: 'A child profile with age-appropriate lists, an activity tray on request, and a “wake me at descent” alarm the crew can set.', stat: 'Ages 2–11', icon: 'baby' },
      { title: 'Podcasts and radio', body: 'Forty licensed podcasts, three live radio streams, and an offline news digest updated before each departure — useful over the Atlantic where nothing else reaches.', stat: '40 feeds', icon: 'mic' },
    ],
    facts: [
      ['Library size', '380+ hours'],
      ['Brightness', 'Auto-dimming with cabin lighting'],
      ['Download before you fly', 'Yes, via the app on the terminal Wi-Fi'],
      ['Headsets', 'Noise-cancelling in Business, standard elsewhere'],
      ['Screen resolution', '4K HDR (widebody) · 1080p (narrowbody stream)'],
      ['Accessibility', 'Audio description, subtitles on everything, colour-contrast modes'],
    ],
    faq: [
      { q: 'Does it cost anything?', a: 'No. Streaming, seatback, and the kids’ content are free on every AeroNova flight, in every cabin. That is a deliberate choice: a paywalled screen on a six-hour flight is a bad way to make people like you.' },
      { q: 'Can I watch my own Netflix?', a: 'You can, on the planes with Nova Connect Pro (all 787s and six of seven A330neo) if you buy the streaming tier. The seatback system will not mirror your device, though.' },
      { q: 'Is the volume too loud for kids’ content?', a: 'The child profile caps output at 75 dB through any headphone. It is a safety limit, not a setting.' },
    ],
  },
  {
    slug: 'dining',
    title: 'Dining & Nova Table',
    kicker: 'Food written for a cabin, not a kitchen',
    hero: 'Our menus are seasoned for 12% humidity and 6,000 ft of cabin altitude, because salt perception drops 30% at cruise.',
    img: '/img/dining.jpg',
    intro:
      'Chef Yaa Mensah writes the menus with a re-thermaliser, not a stove, and the difference shows. Anything fried is fried twice and revived with dry heat. Anything starchy is under-cooked on the ground and finished in the air. And the bowl of groundnut soup with rice balls has been the most-ordered dish on the network for four years running, on every long-haul flight, every day.',
    pillars: [
      { title: 'Dine-anytime in Business', body: 'Order from the full à la carte whenever you want after the climb; the galley holds service until an hour before descent. No tray times.', stat: 'Any hour', icon: 'utensils' },
      { title: 'Nova Table pre-order', body: 'Choose the chef’s four courses up to 24 h before departure, from the app. It is cooked fresh, plated on chinaware, and it is the reason to fly business on a six-hour route.', stat: 'USD 34', icon: 'star' },
      { title: 'Barista coffee at the door', body: 'A real machine, two grinders, and single-origin beans roasted in Addis. On every long-haul flight, in every cabin.', stat: 'Every flight', icon: 'coffee' },
      { title: 'Special meals, free', body: 'Vegetarian, vegan, halal, kosher, diabetic, gluten-free, child, and infant purée — no charge, up to 24 h before departure. Kosher needs 48 hours.', stat: 'Free', icon: 'heart' },
      { title: 'The pantry that is not a trolley', body: 'Buy-on-board on short-haul: a short list done properly — kelewele, a cheese and plantain toastie, fruit from the orchard co-ops we already buy from.', stat: '7 items', icon: 'shopping-basket' },
      { title: 'Wine with a region', body: 'Nine African bottles on the long-haul list, from Swartland to Cape Point to a Rwandan-Rioja blend nobody expected to be good.', stat: '9 by glass', icon: 'wine' },
    ],
    facts: [
      ['Economy', 'Hot meal + snack, drinks from USD 4'],
      ['Premium', 'Two courses on chinaware, free wine'],
      ['Business', 'À la carte anytime, Nova Table optional'],
      ['Special meals', 'Free, 24 h notice (Kosher 48 h)'],
      ['Infants', 'Purée and milk on request, no charge'],
      ['Allergen policy', 'Nuts are not used in any galley recipe since 2019'],
    ],
    faq: [
      { q: 'Can I bring my own food?', a: 'Yes, within the liquid rules for the security point you came through. We will heat it for you if it is in a container we can put in a combi — ask, and the crew will usually find a way.' },
      { q: 'Is there enough food if I have a severe allergy?', a: 'Our galleys are nut-free by recipe, and we carry an epinephrine auto-injector in the medical kit. Declare the allergy at booking; thepurser gets a printed card and a dedicated meal loaded first.' },
      { q: 'Does the pantry take cards?', a: 'Cashless only, on the same device the crew use, with a printed receipt if you want one. Prices are the same as the app.' },
    ],
    note: 'The mint and basil in the Accra lounges and on the long-haul plates are grown on the terminal mezzanine. That is a sustainability story as well as a flavour one, but flavour came first.',
  },
  {
    slug: 'wifi',
    title: 'Nova Connect',
    kicker: 'Internet, at 39,000 feet, that behaves like a network',
    hero: 'Ka-band on the widebody fleet: 300 Mbps shared per aircraft, video calls included, and messaging free on every seat.',
    img: '/img/cabin-business.jpg',
    intro:
      'Wi-Fi on an aeroplane used to be a tax on people who needed to work. We run it as a utility: messaging is free for everyone on every aircraft, one hour of browsing is included from Economy Classic, and the unlimited tier is priced so that a four-hour flight is cheaper than a coffee and a sandwich in an airport.',
    pillars: [
      { title: 'Messaging is free, always', body: 'WhatsApp, Slack, iMessage and email send and receive on any AeroNova flight, no payment page, no caps on text. It is a policy, not a promotion.', stat: 'Free', icon: 'message' },
      { title: 'One hour included', body: 'From Economy Classic upward, an hour of browsing is on the ticket. It starts when you connect, not when the plane levels off.', stat: '1 hour', icon: 'clock' },
      { title: 'Full-flight unlimited', body: 'USD 21 for the sector, streaming and calls included, on the 787 and A330neo with Nova Connect Pro. USD 9 for an extra hour on narrowbodies.', stat: 'USD 21', icon: 'zap' },
      { title: 'It copes with a whole cabin', body: 'Capacity is engineered for 1.4 Mbps per active user at full load, which is what a video call needs. We test it with 180 concurrent streams before each software release.', stat: '1.4 Mbps', icon: 'activity' },
      { title: 'Ground Wi-Fi continues it', body: 'Your session and purchase carry into the Galaxy terminal Wi-Fi, so you finish the upload you started at FL380 without paying twice.', stat: 'Seamless', icon: 'wifi' },
      { title: 'No ads, no tracking', body: 'We do not resell your traffic, inject offers, or log destinations. The captive portal is one page with one price.', stat: '0 trackers', icon: 'shield' },
    ],
    facts: [
      ['Free tier', 'Messaging, all cabins, all aircraft'],
      ['Included', '1 hour from Economy Classic up'],
      ['Unlimited long-haul', 'USD 21 per sector'],
      ['Business & Premium', 'Unlimited included on Pro aircraft'],
      ['Speed per user', 'Up to 12 Mbps peak · 1.4 Mbps at full load'],
      ['Satellite', 'Ka-band, 10 of 12 satellites over the network'],
    ],
    faq: [
      { q: 'Does it work over the ocean?', a: 'On the 787 and A330neo fitted with Pro: yes, on the North Atlantic and the Gulf of Guinea corridors, with brief soft handovers between satellites. Over the central ocean east of Mauritius, expect text-only until we reach the second coverage arc.' },
      { q: 'Can I make a call?', a: 'Voice and video calls are permitted on Pro aircraft, at low volume, and we ask that cameras face away from the aisle. Nobody is going to judge you for taking the 06:00 stand-up.' },
      { q: 'What if it fails?', a: 'If the connection drops for more than 20 minutes on a paid tier, the refund is automatic and lands on the same card within 48 hours. You do not have to ask, and we do not require a screenshot.' },
    ],
  },
  {
    slug: 'comfort',
    title: 'Comfort & sleep',
    kicker: 'The unglamorous engineering of arriving well',
    hero: 'Cabin altitude, humidity, light and noise — the four things that decide whether you sleep, and we changed all four.',
    img: '/img/cabin-premium.jpg',
    intro:
      'A 2025 sleep study on 300 passengers on the London bank, run with the Group Medical Director, found that most of what people call jet lag is really dehydration plus light that arrives at the wrong time. So: we set the cabin 400 ft lower on the composite fleet, we run the humidity up to 15% rather than the usual 4%, and the lights fade over eleven minutes instead of flipping.',
    pillars: [
      { title: 'Bedding worth the weight', body: 'A 650-fill duvet, a memory-foam pillow in two heights, and pyjamas in Business that are actually cotton. Linen is changed at every rotation, not every ten days.', stat: '650 fill', icon: 'bed' },
      { title: 'The eleven-minute dim', body: 'On long-haul, cabin light fades gradually over eleven minutes at the start of the night period. In the study, time-to-sleep fell 41%.', stat: '−41%', icon: 'sunrise' },
      { title: 'Quieter aircraft', body: 'The A320neo and A330neo are, at cruise, 5 to 7 dB below the average of the fleet they replaced. That is the difference between raising your voice and not.', stat: '−6 dB', icon: 'volume' },
      { title: 'Mattress top on request', body: 'In Business, a foam topper and a topper-length extension turn an angled-flat shell into a 1.9 m bed. Ask when you board; it takes 30 seconds.', stat: '1.9 m', icon: 'sparkles' },
      { title: 'Hydration as policy', body: 'Water is offered every 45 minutes on long-haul whether you ask or not, and the galley carries two extra cases per flight for the return leg.', stat: '45 min', icon: 'droplets' },
      { title: 'Noise and light, individually', body: 'A sleep kit (mask, ear plugs, wax ones too) at every seat on night flights — not in a bin behind a curtain, on the seat, before you ask.', stat: 'At seat', icon: 'moon' },
    ],
    facts: [
      ['Cabin altitude', '6,000 ft (787/A350-class), 7,000 ft typical'],
      ['Humidity', 'Up to 15%, versus 4% on older aircraft'],
      ['Seat pitch', '32" economy · 38" premium · flat in business'],
      ['Recline', '5" economy with a 6-way adjustable headrest'],
      ['Legroom options', 'Nova Space rows, +13 cm, from USD 39'],
      ['Crib & bassinet', 'Widebody rows 10 and 20, up to 11 kg'],
    ],
    faq: [
      { q: 'Do you have a nap room on board?', a: 'On the A330neo there is a crew rest area that we open to passengers on flights over seven hours when the crew are resting — a lie-flat seat with a curtain, bookable from the app for USD 45 for two hours.' },
      { q: 'Is the middle seat in economy any better?', a: 'It has a third armrest that does not fight the other two, and the headrest has six wings, so leaning is at least possible. It is still the middle seat. We price it 8% below the window and aisle, honestly.' },
      { q: 'What about anxiety and small cabins?', a: 'Tell us at booking. We will seat you at the front near an exit, brief the purser, and the crew will check in twice without making a thing of it. Our app also has a guided five-minute descent exercise.' },
    ],
  },
];

export const expBySlug = (slug: string) => EXPERIENCES.find((e) => e.slug === slug);

export interface CabinPage {
  slug: string;
  id: 'ECONOMY' | 'PREMIUM' | 'BUSINESS';
  name: string;
  tagline: string;
  hero: string;
  img: string;
  intro: string;
  specs: { label: string; value: string; note: string }[];
  includes: string[];
  excludes: string[];
  perAircraft: { aircraft: string; layout: string; pitch: string; width: string; seats: number; note: string }[];
  faq: { q: string; a: string }[];
}

export const CABINS: CabinPage[] = [
  {
    slug: 'economy',
    id: 'ECONOMY',
    name: 'Economy',
    tagline: 'The cabin most of the world judges an airline by — so we do not treat it as the leftover.',
    hero: 'Slimline shells, 32" of pitch on widebodies, and a hot meal that arrives hot.',
    img: '/img/cabin-economy.jpg',
    intro:
      'Economy on AeroNova is the product. Ninety percent of our seats, and every design decision we make about the cabin — lighting curves, bin shape, lavatory count, the way the galley noise is isolated — is tested here first, because this is where most of you sit. We did not add a “premium lite” tier to make the difference visible. We just stopped buying seats that punish you for being tall.',
    specs: [
      { label: 'Seat pitch', value: '31–32"', note: 'The narrowbody shells are 31" and the widebody 32", with a 6-way headrest' },
      { label: 'Seat width', value: '18"', note: 'Three abreast on the aisle, three-plus-three on the widebody' },
      { label: 'Recline', value: '4–5"', note: 'Two-stage with a thigh support that does not pinch when you recline' },
      { label: 'Screen', value: 'Stream or 10.6"', note: '10.6" seatback on the A321neo; everything else streams to your own device free' },
      { label: 'Power', value: 'USB-C 45–61 W', note: 'Every seat. A 110 V socket at rows with the older shells' },
      { label: 'Baggage', value: '0–2 pieces', note: 'Depends on fare: Light carries none, Classic one, Flex two' },
    ],
    includes: [
      'Free messaging Wi-Fi on every aircraft',
      'Hot meal and barista coffee from Economy Classic',
      'Seat selection included from Classic',
      'Kids’ content, activity trays and bassinets',
      'Cabin air at 15% humidity on the 787 fleet',
    ],
    excludes: ['Lounge access', 'Lie-flat sleeping', 'Priority boarding by default', 'Checked bags on Light'],
    perAircraft: [
      { aircraft: 'Airbus A320neo', layout: '3-3', pitch: '31"', width: '18"', seats: 144, note: 'Our workhorse on West and Central Africa' },
      { aircraft: 'Airbus A321neo', layout: '3-3 slimline', pitch: '31.5"', width: '18"', seats: 152, note: 'Extra-large bins; 10.6" screens at every seat' },
      { aircraft: 'Airbus A330-900neo', layout: '3-3-3 Airspace', pitch: '32"', width: '18"', seats: 211, note: 'Wider shells, taller arch, mood lighting' },
      { aircraft: 'Boeing 787-9', layout: '3-3-3', pitch: '32"', width: '18"', seats: 184, note: 'Lowest cabin altitude and highest humidity in the fleet' },
    ],
    faq: [
      { q: 'Why does Economy Light not include a bag?', a: 'Because the alternative was a higher base fare for people who do not check anything. A bag costs USD 45 pre-paid, and we will tell you at the airport counter what it costs there too: USD 70. The choice is yours, priced honestly.' },
      { q: 'Can I get an exit row without paying?', a: 'No — exit rows carry a real responsibility and a real price (USD 34 to 39). If you need the legroom for a medical reason, our Accessibility Desk will allocate one free of charge with a note from your clinician.' },
      { q: 'Is the middle seat really 8% cheaper?', a: 'Yes, on every flight, automatically. It is priced lower because it is worse, and we would rather say so than pretend the cabin is uniform.' },
    ],
  },
  {
    slug: 'premium-economy',
    id: 'PREMIUM',
    name: 'Premium Economy',
    tagline: 'The row most people would pick if they had sat in it once.',
    hero: '38" of pitch, a 2-3-2 layout with a shell around you, and a footrest you can actually use.',
    img: '/img/cabin-premium.jpg',
    intro:
      'We added Premium Economy on the A321neo and the 787 after a simple piece of research: our passengers who paid for extra-legroom economy and a meal upgrade were, in aggregate, paying more than the premium fare and getting less. So we took the row between, gave it a real shell, a calf rest and a footrest, moved the galley noise behind it, and priced it at roughly twice economy rather than four times.',
    specs: [
      { label: 'Pitch', value: '37–38"', note: 'Seven inches more than economy, with a fixed footrest' },
      { label: 'Layout', value: '2-3-2', note: 'No three-across-and-a-window-nightmare on the widebody' },
      { label: 'Recline', value: '6", 6-way', note: 'Independent headrest wings and calf support' },
      { label: 'Screen', value: '10.6–18.6" 4K', note: 'Seatback on the A321neo and 787; streaming on older A330s' },
      { label: 'Dining', value: 'Two courses', note: 'On chinaware, with a sparkling option and a proper dessert' },
      { label: 'Baggage', value: '2 × 23 kg', note: 'Plus two cabin bags at 12 kg each, and priority tags' },
    ],
    includes: ['Dedicated check-in row', 'Group 1 boarding', 'Amenity kit and memory-foam pillow', 'Unlimited Wi-Fi on Pro aircraft', 'Two free checked bags', 'Refundable, changes free'],
    excludes: ['Lie-flat sleeping', 'Galaxy Lounge access (a day pass is USD 58)', 'À la carte dining'],
    perAircraft: [
      { aircraft: 'Airbus A321neo', layout: '2-3-2', pitch: '37"', width: '18.5"', seats: 24, note: 'Rows 10–14, ahead of the economy bulkhead' },
      { aircraft: 'Airbus A330-900neo', layout: '2-3-2 cocoon', pitch: '38"', width: '18.5"', seats: 21, note: 'Shell seats with a privacy wing on the window pair' },
      { aircraft: 'Boeing 787-9', layout: '2-3-2 side shell', pitch: '38"', width: '19"', seats: 24, note: 'Rows 11–16 with an exit-row bulkhead at 11' },
      { aircraft: 'Airbus A320neo', layout: '—', pitch: '—', width: '—', seats: 0, note: 'Not fitted; two-cabin aircraft only carry economy' },
    ],
    faq: [
      { q: 'Is it worth it on a three-hour flight?', a: 'Honestly: not for the seat. It is worth it if you are two people who do not want to sit in the middle, or if you are travelling with a child and want the row to yourself. On three hours, the fare difference is often only USD 90 and you get the bags and the boarding.' },
      { q: 'Can I upgrade with a certificate?', a: 'Yes — Elite and above can use upgrade certificates on Premium when a seat is open, and they clear 21 days out. Award tickets cannot be upgraded.' },
      { q: 'Do premium passengers get the lounge?', a: 'Not by default, because the fare is priced on the seat, not the terminal. A USD 58 day pass is one tap in the app, and if the flight is delayed more than four hours we give it to you free.' },
    ],
  },
  {
    slug: 'business',
    id: 'BUSINESS',
    name: 'Nova Business',
    tagline: 'A room with a bed, a door and someone who knows your coffee.',
    hero: 'Lie-flat suites, dine-anytime service, showers at the hub, and a car to your door.',
    img: '/img/cabin-business.jpg',
    intro:
      'Business is where an airline tells you what it actually thinks hospitality is. Ours is quiet and precise rather than loud: 1-2-1 direct aisle access on every widebody, a door that closes on rows 1–2 of the A330neo and all nine rows of the 787, a galley that serves you when you ask rather than on a trolley schedule, and a cabin altitude low enough that you land without the hangover feeling. There is no champagne tower. There is a nap room, a shower, and a chef who can make you soup at 04:00.',
    specs: [
      { label: 'Bed', value: '78–80" flat', note: '1.98–2.03 m, with a mattress topper on request' },
      { label: 'Layout', value: '1-2-1', note: 'Direct aisle access from every suite, no climbing over anyone' },
      { label: 'Door', value: 'Rows 1–2 / all rows', note: 'Closing doors on the A330neo forward cabin; all suites on the 787' },
      { label: 'Dining', value: 'À la carte', note: 'Nova Table pre-order, or order whenever you like after the climb' },
      { label: 'Wi-Fi', value: 'Unlimited Pro', note: 'Streaming and calls, included, on every fitted aircraft' },
      { label: 'Baggage', value: '3 × 32 kg', note: 'Plus two cabin bags, sports kit free, priority belt' },
    ],
    includes: ['Galaxy Lounge with showers and nap rooms', 'Fast-track security at both ends', 'Chauffeured transfer at hub stations', 'Lie-flat suite with closing door where fitted', 'Amenity kit, pyjamas, noise-cancelling headsets', 'Fully refundable and changeable', '7,500 points per long-haul sector + 100% tier bonus'],
    excludes: ['Nothing meaningful — the only thing we do not do is guarantee a specific suite number at check-in'],
    perAircraft: [
      { aircraft: 'Airbus A330-900neo', layout: '1-2-1 angled-flat', pitch: 'Lie-flat 78"', width: '21"', seats: 30, note: 'Rows 1–2 have full closing doors and side storage' },
      { aircraft: 'Boeing 787-9', layout: '1-2-1 reverse herringbone', pitch: 'Lie-flat 80"', width: '22"', seats: 36, note: 'Wireless charging pad in the first two rows, drawer, 1.4 m bed' },
      { aircraft: 'Airbus A321neo', layout: '1-1 direct aisle', pitch: '40"', width: '20.6"', seats: 16, note: 'Angled-flat on the high-value thin routes' },
      { aircraft: 'Airbus A320neo', layout: '2-2', pitch: '38"', width: '20.1"', seats: 12, note: 'Deep-recline shells for short-haul business, no flat bed' },
    ],
    faq: [
      { q: 'Can I order dinner at 3am?', a: 'Yes. On flights over six hours the galley serves à la carte from the climb to an hour before descent, and Nova Table pre-orders are plated to order at any hour you pick when you book.' },
      { q: 'Is the transfer really included?', a: 'At Accra, Nairobi and Johannesburg, yes — one journey each way, flight-aware, 60 minutes of free waiting, and a driver holding a sign that is not embarrassing. At other stations it is USD 46 through the app.' },
      { q: 'What if the lie-flat aircraft is swapped?', a: 'We will tell you before departure, in the app, and either rebook you onto another aircraft with suites at our cost or refund the cabin difference plus 10,000 points. This has happened 34 times in two years; 31 people took the rebook.' },
      { q: 'Do you serve alcohol to people who have clearly had too much?', a: 'No. Our crew are trained and authorised to stop service, and the same rule applies in the lounge. It is the least popular policy we have and the one that makes night flights pleasant for the other 240 people.' },
    ],
  },
];

export const cabinBySlug = (slug: string) => CABINS.find((c) => c.slug === slug);
