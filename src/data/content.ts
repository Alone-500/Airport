export interface InfoBlock {
  heading: string;
  body?: string;
  bullets?: string[];
  table?: { head: string[]; rows: string[][] };
  note?: { kind: 'info' | 'warn' | 'good'; text: string };
}
export interface TravelSection {
  id: string;
  title: string;
  kicker: string;
  summary: string;
  readMin: number;
  updated: string;
  blocks: InfoBlock[];
  related: string[];
}

export const TRAVEL_SECTIONS: TravelSection[] = [
  {
    id: 'baggage',
    title: 'Baggage',
    kicker: 'What you can bring, and what it costs',
    summary:
      'Allowances are per ticket, not per trip. Weights are checked once — at the first departure point, including on codeshare sectors.',
    readMin: 4,
    updated: '12 Aug 2026',
    related: ['lost-baggage', 'check-in', 'special-assistance'],
    blocks: [
      {
        heading: 'Free allowances by fare',
        body: 'Economy Light carries a personal item only. Everything from Economy Classic upwards includes at least one 23 kg bag, and Nova Business includes three.',
        table: {
          head: ['Fare', 'Cabin bag', 'Checked', 'Max size'],
          rows: [
            ['Economy Light', '1 personal item', '—', '40 × 30 × 20 cm'],
            ['Economy Classic', '1 × 8 kg', '1 × 23 kg', '158 cm total'],
            ['Economy Flex', '2 × 12 kg', '2 × 23 kg', '158 cm total'],
            ['Premium Economy', '2 × 12 kg', '2 × 23 kg', '158 cm total'],
            ['Nova Business', '2 × 12 kg', '3 × 32 kg', '158 cm total'],
            ['Explorer / Voyager / Elite', 'as fare', '+1 bag', '—'],
          ],
        },
        note: { kind: 'info', text: 'Elite and above receive one additional checked bag on every AeroNova-operated sector, automatically.' },
      },
      {
        heading: 'Pre-purchase beats airport',
        body: 'Buying a bag in “Manage Booking” up to 3 h before departure costs 35% less than at the counter, and it moves your bag to the priority belt on arrival.',
        bullets: [
          'First extra bag, intra-Africa: USD 45 online · USD 70 at the counter',
          'First extra bag, long-haul: USD 75 online · USD 120 at the counter',
          'Heavy (24–32 kg): USD 40 · overweight (33–45 kg): USD 95 and re-packing may be required',
          'Sports equipment up to 23 kg counts as one bag; bikes must be in a box with pedals removed',
        ],
      },
      {
        heading: 'Not allowed, and things to keep with you',
        body: 'Lithium batteries above 100 Wh, power banks above 160 Wh, e-cigarettes in checked bags, and aerosols over 500 ml will be removed at screening.',
        bullets: [
          'Medication, infant food for the first 24 h, and one laptop must travel in the cabin',
          'Musical instruments under 8 kg may replace your cabin bag — tell us at booking',
          'Sharp objects, tools and sporting implements over 6 cm must be checked',
          'Fragile items travel at your own risk; we will tag them FRAGILE but not accept liability',
        ],
        note: { kind: 'warn', text: 'Dry ice is limited to 2.5 kg per passenger and must be vented — declare it at check-in.' },
      },
    ],
  },
  {
    id: 'check-in',
    title: 'Check-in',
    kicker: 'When it opens, where to stand',
    summary: 'Online check-in opens 48 hours before departure and closes 1 hour out. At the airport, counters close 60 minutes before on short-haul, 75 on long-haul.',
    readMin: 3,
    updated: '2 Sep 2026',
    related: ['travel-documents', 'special-assistance', 'airports'],
    blocks: [
      {
        heading: 'The simplest path',
        bullets: [
          '48 h before: check in online, confirm seats, add bags, pay excess in one place',
          '24 h before: boarding pass is saved to your phone wallet automatically',
          'At the airport: bag drop is 12 minutes maximum at ACC Galaxy T1 rows A–D',
          'At the gate: your pass re-scans, no re-printing needed if your phone dies — staff can look it up',
        ],
        note: { kind: 'good', text: '92% of AeroNova passengers reach the gate without joining any queue longer than 10 minutes.' },
      },
      {
        heading: 'Counter times',
        table: {
          head: ['Route type', 'Opens', 'Closes', 'Bag drop closes'],
          rows: [
            ['Intra-Africa (A320/A321)', '3 h before', '60 min', '50 min'],
            ['Long-haul (A330/787)', '4 h before', '75 min', '60 min'],
            ['US pre-clearance at ACC', '4 h before', '90 min', '70 min'],
            ['Group & sports (10+)', '4 h before', '90 min', '75 min'],
          ],
        },
      },
      {
        heading: 'If you miss it',
        body: 'We hold the last five seats for passengers who were in the queue when it closed. Show your queue photo or boarding-pass timestamp and the duty supervisor will re-protect you on the next flight at no cost.',
        note: { kind: 'info', text: 'Elite Plus and Elite members are protected onto the next flight automatically, without asking.' },
      },
    ],
  },
  {
    id: 'travel-documents',
    title: 'Travel documents',
    kicker: 'Passports, visas, and the 6-month rule',
    summary: 'You are responsible for the documents your route requires. We will deny boarding without them — the app can check your route in about 20 seconds.',
    readMin: 5,
    updated: '24 Jul 2026',
    related: ['visa-information', 'check-in', 'unaccompanied-minors'],
    blocks: [
      {
        heading: 'Validity requirements',
        bullets: [
          'Six months beyond your date of return for almost every destination we serve',
          'Two blank pages side by side for visa stamps (four for China and Nigeria)',
          'Children need their own passport on all routes — a shared entry is no longer accepted',
          'Damaged laminates, re-glued data pages or chewed corners will be refused at screening',
        ],
        note: { kind: 'warn', text: 'Expired or damaged passports are the single most common cause of denied boarding on our network — 4,120 cases in 2025.' },
      },
      {
        heading: 'Transit without a visa',
        body: 'Through check-in on a single ticket means you normally never clear immigration: at ACC, NBO, JNB, DOH, DXB and IST you stay in the transit area up to 24 hours. Exceptions: the United States, Canada and the United Kingdom require entry formalities at the first point.',
        table: {
          head: ['Airport', 'Airside transit', 'Max stay', 'Notes'],
          rows: [
            ['ACC', 'Yes', '24 h', 'Transit lounge rows 8–9, showers free'],
            ['NBO', 'Yes', '24 h', 'Concourse C; no re-check for Galaxy baggage'],
            ['JNB', 'Yes', '24 h', 'Terminal A to B is airside; follow the green walkway'],
            ['LHR T2', 'No', '—', 'UK direct airside transit rule (DATV) applies to 17 nationalities'],
            ['IAD / JFK', 'No', '—', 'All US arrivals clear immigration and re-check bags'],
            ['IST', 'Yes', '20 h', 'Transit hotel inside security, book at the AeroNova desk'],
          ],
        },
      },
    ],
  },
  {
    id: 'visa-information',
    title: 'Visa information',
    kicker: 'Who needs what, and how long it takes',
    summary: 'Indicative requirements for AeroNova routes. Always confirm with the destination mission — rules change, and our agents can check your file.',
    readMin: 6,
    updated: '9 Sep 2026',
    related: ['travel-documents', 'airports'],
    blocks: [
      {
        heading: 'Africa at a glance',
        table: {
          head: ['Destination', 'West African passport', 'EU / UK / US', 'Processing'],
          rows: [
            ['Ghana (ACC)', 'Visa-free 92 days', 'Visa on arrival, USD 60', 'e-visa 3–7 days'],
            ['Nigeria (LOS)', 'Visa required', 'Visa required, apply 6 wks ahead', '4–8 weeks'],
            ['Kenya (NBO)', 'eTA required', 'eTA required', '72 h typical'],
            ['South Africa (JNB)', 'Visa-free for 5', 'Visa-free 90 days', '—'],
            ['Rwanda (KGL)', 'East Africa Tourist Visa', 'Visa on arrival', 'Instant at KGL'],
            ['Tanzania (ZNZ)', 'Visa required', 'Visa on arrival USD 50', 'e-visa 10 days'],
            ['Egypt (CAI)', 'Visa required', 'Visa on arrival USD 25', 'Instant'],
            ['Morocco (CMN)', 'Visa-free 90 days', 'Visa-free 90 days', '—'],
          ],
        },
        note: { kind: 'info', text: 'AeroNova holds a visa-letter service for business travellers at USD 35 — our agents file the invitation letter same-day.' },
      },
      {
        heading: 'Health certificates',
        bullets: [
          'Yellow fever: required if arriving from an endemic country, including in transit over 12 h',
          'Polio: six-monthly vaccination certificate may be requested from 10 African states',
          'Malaria prophylaxis is recommended for every destination below 2,000 m — including Nairobi in the wet months',
          'Cholera oral vaccine: 10 days before arrival for Guinea, Cameroon and Zimbabwe in the rainy season',
        ],
      },
    ],
  },
  {
    id: 'airports',
    title: 'Airport information',
    kicker: 'Where to stand, how long it takes',
    summary: 'Counter rows, security timings, lounge locations and the quiet corner of each terminal we actually use.',
    readMin: 4,
    updated: '30 Aug 2026',
    related: ['check-in', 'baggage', 'special-assistance'],
    blocks: [
      {
        heading: 'Average times, measured not estimated',
        body: 'These are rolling 30-day medians from our own station teams. We publish them because we can.',
        table: {
          head: ['Station', 'Check-in', 'Security', 'To furthest gate', 'Best entry door'],
          rows: [
            ['ACC Galaxy T1', '6 min', '6 min', '9 min', 'Door 4 (fast track left)'],
            ['NBO Concourse C', '11 min', '14 min', '12 min', 'Mezzanine lift bank'],
            ['JNB Terminal A', '14 min', '9 min', '15 min', 'Row D only'],
            ['LOS International', '19 min', '17 min', '10 min', 'Dedicated AeroNova lane, row 12'],
            ['LHR T2', '8 min', '11 min', '13 min', 'Security lane 6 at off-peak'],
            ['DXB T3', '12 min', '7 min', '18 min', 'Concourse B transit walkway'],
          ],
        },
      },
      {
        heading: 'Things worth knowing',
        bullets: [
          'ACC: the hydroponic garden on the mezzanine supplies two of the three lounges; it is open to all passengers',
          'NBO: overnight transit passengers get a free 4-hour nap room pod from 23:00',
          'JNB: follow the green walkway, not the signs, between A and B — the signs are being rewritten',
          'LHR T2: the Galaxy Lounge is above check-in rows 380–412, take the far escalator',
        ],
      },
    ],
  },
  {
    id: 'special-assistance',
    title: 'Special assistance',
    kicker: 'Help at every step, booked 48 h ahead',
    summary: 'Wheelchair, medical, hidden-disability lanyards, assistance dogs, and someone to actually walk with you to the gate — free on every ticket.',
    readMin: 4,
    updated: '18 Jun 2026',
    related: ['accessibility', 'traveling-with-children', 'health-safety'],
    blocks: [
      {
        heading: 'What you can request',
        bullets: [
          'Ramp or aisle wheelchair (WCHR/WCHS/WCHC) including lift-to-seat carry on aircraft without boarding bridge',
          'Assistance dog travel in cabin, no charge, handler documentation at the desk',
          'Sunflower lanyard for hidden conditions — collected at any AeroNova counter, no explanation needed',
          'Oxygen, CPAP and powered mobility (dry-cell or spillable lithium within limits) with 72 h medical clearance',
          'Sensory-friendly boarding: pre-board, quiet lane, and a crew member briefed in advance',
          'Cocoon transfer: door-to-door between two terminals at ACC with no re-screening',
        ],
        note: { kind: 'good', text: 'Our assistance completion rate is 99.2% within the promised time. If we miss it, we pay you USD 100 into your wallet automatically.' },
      },
      {
        heading: 'How to arrange it',
        body: 'Add it in “Manage Booking” under Assistance, call the Accessibility Desk on +233 302 200 200 (24/7), or ask at the counter. The sooner the better — but we can do it at the gate, and we will.',
        note: { kind: 'info', text: 'We never require a medical certificate for a wheelchair. We ask only for powered devices and in-flight oxygen.' },
      },
    ],
  },
  {
    id: 'children',
    title: 'Travelling with children',
    kicker: 'Kids fly at half fare, and get the aisle window',
    summary: 'Child fares, bassinets, priority boarding, and the Climb zones that make an eight-hour connection survivable.',
    readMin: 4,
    updated: '2 Jul 2026',
    related: ['unaccompanied-minors', 'baggage', 'special-assistance'],
    blocks: [
      {
        heading: 'Fares and seats',
        table: {
          head: ['Age', 'Fare', 'Seat', 'Baggage'],
          rows: [
            ['Under 2 (infant on lap)', '10% of adult fare + taxes', 'Lap or bassinet row', '1 × 23 kg + stroller free'],
            ['2–11 (child)', '50% of the published fare', 'Own seat, always adjacent to adult', 'Full age-appropriate allowance'],
            ['12+', 'Standard', 'Standard', 'Standard'],
          ],
        },
      },
      {
        heading: 'On board',
        bullets: [
          'Bassinet rows 10 and 20 on widebodies, 10 on A321neo — request at booking, first come',
          'Child meal with an activity tray, from USD 8, up to 24 h before departure',
          'Two films, one quiet channel and volume-limited kid headphones at the door',
          'Formula, baby food and water for the infant are exempt from the liquid limit — present them separately at screening',
          'Family boarding group 2 at all African stations; kids get to the tray tables first',
        ],
      },
      {
        heading: 'At the airport',
        body: 'Climb zones at ACC (T1 mezzanine, open 04:30–23:30), NBO (Concourse C, 24 h) and JNB (Terminal A, gates 14–22). Family security lane at ACC door 4 with a stroller ramp, and a nursing room with a lock and a sink on every Galaxy lounge.',
      },
    ],
  },
  {
    id: 'pets',
    title: 'Travelling with pets',
    kicker: 'In the cabin, in the hold, or as cargo',
    summary: 'Cats and dogs up to 8 kg combined with their soft carrier fly with you in the cabin on all African and European routes.',
    readMin: 5,
    updated: '15 May 2026',
    related: ['travel-documents', 'baggage'],
    blocks: [
      {
        heading: 'Three ways to travel',
        table: {
          head: ['Option', 'Limit', 'Fee', 'Routes'],
          rows: [
            ['In cabin, under the seat', '8 kg incl. carrier', 'USD 120 per sector', 'Africa, Europe, Middle East'],
            ['Checked baggage (AVIH)', '32 kg incl. crate', 'USD 150–300', 'All except the US'],
            ['Cargo via Nova Freight', 'No limit', 'Quoted', 'All stations with a cargo dock'],
          ],
        },
      },
      {
        heading: 'Documentation',
        bullets: [
          'Health certificate issued within 10 days of departure, in English or French',
          'Rabies vaccination at least 30 days, not more than 12 months before travel',
          'Microchip ISO 11784/85 fitted before the rabie vaccination, or the certificate is void',
          'Kenya, Tanzania, South Africa and Egypt require an import permit in advance — 15 to 40 working days',
          'Brachycephalic breeds (pugs, bulldogs) travel in the cabin or as climate-controlled cargo only',
        ],
        note: { kind: 'warn', text: 'We do not accept animals in the hold when the forecast temperature at either airport is above 29 °C or below 7 °C.' },
      },
    ],
  },
  {
    id: 'unaccompanied-minors',
    title: 'Unaccompanied minors',
    kicker: 'A named person at both ends, and no exceptions',
    summary: 'Children aged 5–15 travelling alone are escorted gate-to-gate by a trained guardian agent and cannot connect through a hub overnight.',
    readMin: 5,
    updated: '8 Apr 2026',
    related: ['children', 'travel-documents', 'check-in'],
    blocks: [
      {
        heading: 'Rules that matter',
        bullets: [
          'Ages 5–11 must use the service; 12–15 may travel as an unaccompanied minor on request; under 5 cannot travel alone',
          'Fee USD 65 per sector each way, collected with the fare',
          'Non-stop only, except ACC ⇄ NBO  JNB where we hand over at the gate ourselves',
          'No overnight connections and no final-leg-of-the-day bookings',
          'Both adults must show ID, sign the manifest, and stay until the aircraft pushes back',
        ],
      },
      {
        heading: 'What actually happens',
        body: 'The guardian agent meets the dropping-off adult at the check-in desk, walks the child through the family lane, gives them the pouch with the manifest, seat card and a pre-paid meal voucher, seats them at the front of the cabin, and hands them to the crew. On arrival, no one leaves the aircraft until the collecting adult’s ID matches the pouch. If it does not, we call the emergency contact, then the second, then we put the child back on the next flight home with an agent.',
        note: { kind: 'info', text: 'Every guardian agent carries a radio, has paediatric first-aid certification, and is the same person for the whole journey.' },
      },
    ],
  },
  {
    id: 'health-safety',
    title: 'Health and safety',
    kicker: 'How safe, and how we prove it',
    summary: 'IOSA since 2015 with no findings in the last two audits. ICAO Category 1 for Ghana since 2023. Every crew member retrained every 24 months.',
    readMin: 4,
    updated: '21 Sep 2026',
    related: ['special-assistance', 'check-in'],
    blocks: [
      {
        heading: 'On board',
        bullets: [
          'Seat belt sign means sit down; our crew are trained to de-escalate, not to argue',
          'Medical kit including AED and two doctors’ bags per widebody, refreshed every 6 months',
          'One trained first-responder minimum per four rows; on long-haul two are physicians or paramedics',
          'Airborne HEPA filtration changes cabin air 20–30 times per hour; surface disinfection between rotations',
        ],
      },
      {
        heading: 'If someone is ill',
        body: 'We carry a 24/7 link to MedAire Nairobi and London. Crew can consult with the on-board medical kit and a physician on the ground within 4 minutes, and we can divert to any of 31 pre-agreed airports with medical support on the ramp.',
        note: { kind: 'good', text: '97% of in-flight medical consultations on our network are resolved without a diversion.' },
      },
    ],
  },
  {
    id: 'lost-baggage',
    title: 'Lost and delayed baggage',
    kicker: 'Report in 21 days, get paid in 48 hours',
    summary: 'Delayed bags get an interim expense payment the same day. Lost bags are valued at USD 65 per kg after 21 days.',
    readMin: 4,
    updated: '11 Jul 2026',
    related: ['delayed-baggage', 'baggage'],
    blocks: [
      {
        heading: 'The first 24 hours',
        bullets: [
          'Report at the Baggage Service Office before you leave the arrivals hall, or in the app within 24 h',
          'We pay USD 120 interim expenses immediately at ACC, NBO and JNB; other stations pay within 6 h to your card',
          'Essential purchase list: toiletries, underwear, a shirt, business shoes — keep every receipt',
          'Track PIR status in “Manage Booking → Bags”; every scan updates within 20 minutes',
        ],
      },
      {
        heading: 'Delivery and beyond',
        body: '94% of delayed bags are back with the owner within 30 hours, delivered to your address or hotel by our own drivers, not a courier. After 21 days without recovery, the bag is declared lost and valued at USD 65 per kilogram, capped at USD 1,780 under the Montreal Convention — plus reimbursement of what you had to buy.',
        note: { kind: 'info', text: 'Nova Cover Plus adds USD 3,000 of contents cover with no wear-and-tear deduction.' },
      },
    ],
  },
  {
    id: 'delayed-baggage',
    title: 'Delayed baggage',
    kicker: 'When we say 24 hours, we mean it',
    summary: 'A bag that misses the connection is not lost — it is on the next flight, with someone responsible for it by name.',
    readMin: 3,
    updated: '11 Jul 2026',
    related: ['lost-baggage', 'baggage'],
    blocks: [
      {
        heading: 'How it works',
        bullets: [
          'Every short-shipped bag is tagged HANDOVER and assigned a duty agent at the destination',
          'You receive the flight number carrying your bag and its estimated delivery time in the app',
          'We cover reasonable interim purchases from USD 120 up to USD 400 depending on length of stay',
          'If the delay was caused by a weather closure, Nova Cover Plus pays a flat USD 90 automatically',
        ],
      },
      {
        heading: 'What we cannot do',
        body: 'We cannot open a customs-sealed bag at an intermediate station, and we cannot deliver to a hotel after the guest has checked out without re-routing the bag to your onward address — tell the desk early and it costs nothing.',
      },
    ],
  },
  {
    id: 'dangerous-goods',
    title: 'Dangerous goods',
    kicker: 'The list people get caught by',
    summary: 'Some items are forbidden on every flight; some are allowed in the cabin and banned in the hold. The difference is life or death, not convenience.',
    readMin: 6,
    updated: '5 Mar 2026',
    related: ['baggage', 'pets'],
    blocks: [
      {
        heading: 'Never, in either direction',
        bullets: [
          'Explosives, flares, fireworks, blasting caps, and any replica that looks like one',
          'Compressed gases: butane refills, camping cylinders, aerosol pepper spray, scuba cylinders with air left',
          'Flammable liquids and solids: petrol, lighter fluid, paint, matches, firelighters, magnesium',
          'Oxidisers and organic peroxides, pool chemicals, bleach above 35% concentration',
          'Toxic and infectious substances: Category A biological samples, dry ice over 2.5 kg, mercury thermometers in checked bags',
          'Corrosives: wet-cell car batteries, acid batteries for mobility devices unless disconnected and taped',
          'Magnetised material above the IATA limit, and anything the operator refuses',
        ],
      },
      {
        heading: 'Batteries — the rules that actually catch people',
        table: {
          head: ['Item', 'Cabin', 'Checked', 'Limit'],
          rows: [
            ['Laptop / camera up to 100 Wh', 'Yes', 'Device only, protected', '≤ 100 Wh'],
            ['Power bank', 'Yes, always', 'Never', '≤ 100 Wh; 101–160 Wh with approval'],
            ['E-scooter / hoverboard', 'Only with approval', 'Forbidden', '≤ 160 Wh, removable battery'],
            ['Vape / e-cigarette', 'On your person', 'Forbidden', 'No charging in flight'],
            ['Spare lithium cells', 'In a protective case', 'Forbidden', 'Personal-use quantity'],
            ['Mobility scooter (dry cell)', '—', 'Accepted, terminals taped', 'Notify 48 h ahead'],
          ],
        },
        note: { kind: 'warn', text: 'A lithium battery that has swollen, been dropped, or overheated cannot fly at all — even in the cabin.' },
      },
      {
        heading: 'Declared and approved exceptions',
        body: 'Medical oxygen (one unit, from an approved supplier), dry ice up to 2.5 kg for perishables, alcohol between 24–70% in retail packaging up to 5 L per passenger, and safety matches in a single box on your person.',
      },
    ],
  },
  {
    id: 'accessibility',
    title: 'Accessibility',
    kicker: 'Built-in, not bolted-on',
    summary: 'Step-free from kerb to seat on every aircraft in the fleet, with aisle chairs on all widebodies and two on every narrowbody rotation.',
    readMin: 4,
    updated: '26 Aug 2026',
    related: ['special-assistance', 'airports', 'check-in'],
    blocks: [
      {
        heading: 'What you will find',
        bullets: [
          'Wheelchair-sized lavatory with fold-out support rail on all A330neo and 787 aircraft, plus one per narrowbody',
          'Onboard wheelchair and aisle chair available on every sector — 48 h notice preferred, not required',
          'Hearing loops at every AeroNova counter, and at the gate desk in the five hubs',
          'Brague and large-print safety cards; crew trained in basic deaf sign and in describing the cabin verbally',
          'Companion travels free on the same fare when a medical need for a personal assistant is declared',
          'Our website passes WCAG 2.2 AA: keyboard-only booking works end to end, and the seat map is navigable by arrow keys',
        ],
      },
      {
        heading: 'Tell us once',
        body: 'Save your assistance profile in your account and it is attached to every booking automatically, including third-party and corporate fares. We will never ask you to explain the same thing twice at a counter.',
        note: { kind: 'good', text: 'Our Accessibility Panel — nine passengers, five of them employees — reviews every cabin and app change before release.' },
      },
    ],
  },
];

export const travelSection = (id: string) => TRAVEL_SECTIONS.find((s) => s.id === id);

/* ---------------------------- help centre ---------------------------- */
export interface HelpQ {
  q: string;
  a: string;
  tags: string[];
}
export interface HelpCategory {
  id: string;
  title: string;
  blurb: string;
  icon: string;
  items: HelpQ[];
}

export const HELP_CATEGORIES: HelpCategory[] = [
  {
    id: 'booking',
    title: 'Booking',
    blurb: 'Holds, payment windows, name corrections and mixed fares.',
    icon: 'ticket',
    items: [
      { q: 'How long can I hold a fare before paying?', a: 'Twenty-four hours, free, on any AeroNova-operated flight. The hold is visible in Manage Booking and the price is protected — even if it rises. For flights departing in under 12 hours, the hold is 60 minutes.', tags: ['hold', 'price', 'fare'] },
      { q: 'Can I correct a misspelled name?', a: 'Yes, up to three characters can be fixed at no charge through the app or the Reservations line. Beyond that it is a re-issue and we look at the case on its merits — bring proof of identity to the airport and we will almost always fix it at the counter for free.', tags: ['name', 'change'] },
      { q: 'Why did my search price change at payment?', a: 'Prices are live seat-inventory buckets. When a bucket (say, nine seats at $179) sells out mid-session, the next bucket is shown. We always complete the transaction at the lower price if you reached the payment page before the change.', tags: ['price', 'inventory'] },
      { q: 'Can I book two different cabins on one ticket?', a: 'Not on a single PNR — but you can book outbound and return in different cabins, and cabin-mixed pairings are automatically priced as the cheapest legal combination at payment.', tags: ['cabin', 'mix'] },
      { q: 'Do you sell at the airport cheaper than online?', a: 'Never. Airport fares carry a USD 25 service fee. Our desk will, however, price-match a published fare on your screen and add the bag you could not fit online.', tags: ['airport', 'price'] },
    ],
  },
  {
    id: 'payments',
    title: 'Payments',
    blurb: 'Cards, mobile money, multi-currency, invoices.',
    icon: 'credit-card',
    items: [
      { q: 'Which payment methods do you accept?', a: 'Visa, Mastercard, Amex, Apple Pay, Google Pay, mobile money (MTN MoMo, Airtel Money, M-Pesa, Vodafone Cash) and bank transfer for corporate accounts. We hold your card until ticketing and usually capture within 30 minutes.', tags: ['card', 'momo', 'wallet'] },
      { q: 'I was charged twice. What now?', a: 'Duplicate authorisations fall off within 3–5 working days automatically; if you see two completed transactions, open a Payment case in the app — refunds from a verified double charge are paid back within 48 hours, with a 2,000-point goodwill credit.', tags: ['duplicate', 'refund'] },
      { q: 'Can I pay in a currency other than my card?', a: 'Yes. Choose the currency in the header before you pay. Note the FX and any non-USD surcharge your issuer adds — paying in your card’s own currency is normally cheapest.', tags: ['currency', 'fx'] },
      { q: 'Do you accept company purchase orders?', a: 'Registered corporate accounts (Nova for Business) can book on 30-day invoice with an agreed credit line, and receive consolidated monthly billing with cost-centre codes.', tags: ['corporate', 'invoice'] },
    ],
  },
  {
    id: 'baggage-help',
    title: 'Baggage',
    blurb: 'Missing, damaged, delayed, or just too heavy.',
    icon: 'luggage',
    items: [
      { q: 'My bag is damaged. What do I do?', a: 'Report within 7 days of arrival, ideally at the Baggage Service Office before you leave. We cover repair up to USD 350 and, for unrepairable bags, depreciated value — plus a new cabin bag on the spot in most hubs.', tags: ['damage', 'report'] },
      { q: 'Can I ship a bag as cargo instead?', a: 'Yes, through Nova Freight: from USD 1.45 per kg to most African stations with customs paperwork handled. It is slower, and the bag is not on your flight — that is often exactly what you want for an relocation.', tags: ['cargo', 'freight'] },
      { q: 'What counts as sports equipment?', a: 'One item of sports kit up to 23 kg can replace your checked bag on Classic and above, at no charge — bikes must have pedals removed and be boxed, and we will not carry kitesurfing boards over 2.1 m on the A320neo.', tags: ['sports', 'bike'] },
    ],
  },
  {
    id: 'checkin-help',
    title: 'Check-in & boarding',
    blurb: 'Seats, passes, gates, and being late.',
    icon: 'scan',
    items: [
      { q: 'When does online check-in open?', a: '48 hours before departure, closing 1 hour out on short-haul and 1h15 on long-haul. Bags can still be dropped up to 10 minutes after the counter nominally closes if you were in the queue.', tags: ['time', 'counter'] },
      { q: 'I lost my boarding pass. Do I pay again?', a: 'No. Have your booking reference at the gate — the agent re-issues in under a minute. Same for a dead phone.', tags: ['pass', 'gate'] },
      { q: 'Why is my seat not where I chose it?', a: 'Equipment changes — an A330 replacing a 787 shifts the layout. We re-assign you to an equivalent or better seat and tell you what changed in the app. If you paid for a specific seat, the difference is refunded automatically.', tags: ['seat', 'change'] },
    ],
  },
  {
    id: 'flights-help',
    title: 'Flights & irregular ops',
    blurb: 'Delays, cancellations, rerouting and duty of care.',
    icon: 'plane',
    items: [
      { q: 'My flight was cancelled. What am I owed?', a: 'Re-routing on the next available AeroNova or partner service at no cost, plus duty-of-care: hotel with transfers when the wait crosses the night, meals at 4+ hours, and two calls or a data credit. Cash compensation applies under EC 261 on departures from London, Paris and Frankfurt.', tags: ['cancel', 'compensation'] },
      { q: 'Do you pay delay compensation for weather?', a: 'No, extraordinary circumstances are exempt under every applicable regime. We still cover the hotel and the food, and Nova Cover Plus pays USD 90 flat on any delay over 4 hours regardless of cause.', tags: ['delay', 'weather'] },
      { q: 'Can I be moved to another airline?', a: 'Yes — interline endorements are automatic when our next own-operated flight is more than 6 hours later. Our systems will show you the option before you have to ask for it.', tags: ['interline', 'rebook'] },
    ],
  },
  {
    id: 'refunds',
    title: 'Refunds & cancellations',
    blurb: 'What is refundable, and how fast.',
    icon: 'rotate',
    items: [
      { q: 'How quickly are refunds paid?', a: 'Travel-wallet refunds are instant. Card refunds are issued within 24 hours of approval and typically appear in 5–10 working days depending on the issuer. We never hold a refund for our own cash-flow; median approval is 1.7 days.', tags: ['refund', 'time'] },
      { q: 'What is the 24-hour rule?', a: 'Cancel within 24 hours of booking for a full refund, on any fare, for travel starting more than 7 days away. No reason required.', tags: ['24h', 'flex'] },
      { q: 'My Flex fare says refundable to wallet. Why?', a: 'Economy Flex refunds to the travel wallet, which never expires and can be shared with a family member in the same household. A card refund is available at a 10% administration charge.', tags: ['flex', 'wallet'] },
    ],
  },
  {
    id: 'loyalty-help',
    title: 'AeroNova Rewards',
    blurb: 'Points, tiers, upgrades, and expiries.',
    icon: 'star',
    items: [
      { q: 'When do points expire?', a: '36 months after they are earned, and any qualifying earning flight extends the entire balance by another 36 months. Elite members never expire.', tags: ['expiry', 'points'] },
      { q: 'Can I use points for someone else?', a: 'Yes — up to five beneficiaries in your Family Pool, with one shared balance and one household delivery address.', tags: ['pool', 'gift'] },
      { q: 'How do upgrade certificates work?', a: 'Elite and above receive four (Elite) or six (Elite Plus) per year. They clear 21 days before departure if a Business seat is open. Award tickets and the cheapest Economy Light bucket cannot be upgraded.', tags: ['upgrade', 'cert'] },
    ],
  },
  {
    id: 'documents-help',
    title: 'Travel documents',
    blurb: 'Passports, visas, and being turned away.',
    icon: 'passport',
    items: [
      { q: 'What happens if I am denied boarding for documents?', a: 'We fly you back on the next service at our cost when the fault was our information — and we pay for the hotel in the meantime. If the requirement was published and correctly shown in the app before you paid, the return is charged at your fare.', tags: ['denied', 'visa'] },
      { q: 'Do you store my passport details?', a: 'Only for your active bookings, encrypted, and we delete the document number 30 days after your last flight unless you enable Passport Vault in your account settings.', tags: ['privacy', 'store'] },
    ],
  },
  {
    id: 'accessibility-help',
    title: 'Accessibility',
    blurb: 'Assistance, equipment, and complaints.',
    icon: 'accessibility',
    items: [
      { q: 'How do I book assistance?', a: 'In Manage Booking under Assistance, on the Accessibility Desk (+233 302 200 200, 24/7), or at any counter. We accept requests at the gate and will always find a way.', tags: ['assistance', 'wheelchair'] },
      { q: 'My wheelchair was damaged. Who pays?', a: 'We do, at repair or replacement value, with no depreciation on mobility equipment. Report within 7 days and we will send a loan chair the same week if the repair takes longer than 5 days.', tags: ['chair', 'damage'] },
    ],
  },
];

export const helpSearch = (term: string): { item: HelpQ; cat: HelpCategory }[] => {
  const t = term.toLowerCase().trim();
  if (!t) return [];
  const words = t.split(/\s+/).filter(Boolean);
  const hits = HELP_CATEGORIES.flatMap((cat) =>
    cat.items
      .map((item) => {
        const hay = `${item.q} ${item.a} ${item.tags.join(' ')} ${cat.title}`.toLowerCase();
        const score = words.reduce((s, w) => s + (hay.includes(w) ? (item.q.toLowerCase().includes(w) ? 3 : 1) : 0), 0);
        return { item, cat, score };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score),
  );
  return hits.slice(0, 14).map(({ item, cat }) => ({ item, cat }));
};

/* ---------------------------- editorial stories ---------------------------- */
export interface Story {
  id: string;
  eyebrow: string;
  title: string;
  standfirst: string;
  author: string;
  minutes: number;
  date: string;
  img: string;
  body: string[];
  pull?: string;
  city: string;
}

export const STORIES: Story[] = [
  {
    id: 'galaxy-terminal',
    eyebrow: 'Design',
    title: 'The terminal that was built around shade',
    standfirst:
      'Two architects, one harmattan, and a brief that said “no one should ever stand in the sun at Accra airport.” Three years later, the Galaxy terminal does exactly that.',
    author: 'Nana Adjoa Boateng',
    minutes: 9,
    date: '2026-08-14',
    img: '/img/airport-night.jpg',
    city: 'Accra',
    body: [
      'The first sketch was not a terminal at all. It was a section drawing of a courtyard house in Osu — deep eaves, cross-ventilation, and the particular way light falls through a gap in a roof. Adjetey & Koomson were asked to design a building that could handle eleven million passengers and still feel like a room. They began with the walk from the car park.',
      'In Accra the worst heat is not midday; it is the four minutes between a shaded doorway and an exposed kerb. So the terminal’s whole geometry is a negotiation with that gap: a continuous canopy from door 1 to door 9, planted with frangipani, and a facade set back far enough that luggage never sits in direct sun. Ground temperature at the entrance averages six degrees cooler than the old pier.',
      'Inside, the material palette is deliberately unglamorous: pale polished terrazzo that reflects rather than absorbs, timber slats that were milled in Sunyani, and a great deal of nothing at all — the mezzanine was left open when the airline realised the queue for the viewing terrace was the most-used facility in the building.',
      'The part everyone photographs is the hydroponic garden. It grows lettuce, mint and basil for three lounges and two restaurants, and it is a closed loop: greywater from the washrooms, filtered, fed, harvested, and it takes 68 fewer truck-loads of produce a year off the road. The airline will tell you about the carbon. The crews will tell you that the basil on the fish at the Galaxy Lounge is the point.',
      'The last detail is the one that cost the most arguments: there are no announcements in the terminal. Not no information — no voice. Everything is on boards, on your phone, and at the gate desk staffed by people. The reasoning was measured: at 07:15 on a Monday the old pier had forty overlapping announcements, and comprehension dropped to under half. Silence, plus good signs plus humans, tested at 94% comprehension.',
    ],
    pull: '“We stopped designing for the photograph and started designing for the four minutes in the sun.”',
  },
  {
    id: 'seven-hour-north',
    eyebrow: 'Long haul',
    title: 'Seven hours north, and the light does not stop',
    standfirst: 'The Accra–London bank is our most written-about route and our least romantic. Here is what it is actually like, at 23:45, in row 12.',
    author: 'Tobi Adeyemi',
    minutes: 7,
    date: '2026-07-02',
    img: '/img/fleet.jpg',
    city: 'London',
    body: [
      'There is a particular quality to the light on the west African coast at 19:20 that nobody on a flight has time for. It lasts forty minutes. You are either watching it from the right-hand window on the climb out of Kotoka, or you are in a lounge and you will see it in a month.',
      'AN 204 departs at 23:45, which is the correct decision for three reasons: the arrival slot at Heathrow Terminal 2 is before the 11:00 bank, the aircraft turns around in 95 minutes in the morning sun instead of the midday heat, and the passengers get a full night. The trade-off is that nobody gets that light.',
      'What you get instead is a cabin that goes quiet 40 minutes after takeoff, and a service model that stops pretending. In Business the pods close; the galley lights to 15%; the crew eat at 02:30 in a rest seat with a curtain drawn. In Economy the lights do something unusual — they dim in a long, slow, deliberate gradient over eleven minutes rather than the usual flip, which sounds trivial and works on almost everyone.',
      'North of the Sahara there is a stretch where the sky turns the colour of a television left on a blue channel, and the aircraft is over nothing you could point at. It is the best hour. Two people in every row are awake for it, and it is never the same two people.',
      'Landing at 06:05 means you are at Bank by 07:30, and you have not had a full sleep and will not have one until tonight. That is the arithmetic of the route, and the airline has stopped trying to fix it with a pillow. The thing that actually helps is the shower at 04:40.',
    ],
    pull: 'The best hour is over a place you cannot see.',
  },
  {
    id: 'the-table',
    eyebrow: 'Food',
    title: 'A chef, a galley, and the problem of altitude',
    standfirst:
      'Dumpling the kontomire with coconut milk works extraordinarily well at 37,000 feet. It works badly at sea level. Chef Yaa Mensah explains why the menu is written for a cabin, not a kitchen.',
    author: 'Yaa Mensah, Executive Chef',
    minutes: 6,
    date: '2026-06-18',
    img: '/img/dining.jpg',
    city: 'Accra',
    body: [
      'The two things that change in a pressurised cabin at 6,000 feet equivalent are salt perception, down about 30%, and aroma volatility, down because the air is 12% humidity. Your tongue is not broken on a plane; it is working in a dryer, colder room than the one you trained in.',
      'So we season to the room, not to the recipe. Our Business menu uses finishing liquids — a smoked pepper oil, a fermented locust-beam jus, a lime-and-grass-oil syrup — that are added at the table rather than in the galley. Volatility is restored by heat from the re-thermaliser at the seat, and the diner’s own hands do the last 15% of the work.',
      'Texture is the second problem. Anything fried dies. Anything starchy over-cooks by two minutes in the oven and turns to glue. We par-cook to 80%, blast chill, and finish on board with a combi at 96°C and then a dry blast for the last 90 seconds. Our plantain for the Business starter is fried twice on the ground, then rested, then revived with a dry heat — never steamed with the rest of the tray.',
      'The most requested dish on our network, for four years running, is a bowl of groundnut soup with rice balls and a soft egg. It travels absurdly well: high fat, high salt, high aroma, no texture to lose. It is on the menu every day, on every long-haul flight, and 3,400 people eat it a week.',
      'We grow the mint and the basil in the terminal. That is not a sustainability line, although it is that too. It is because an aeroplane kitchen has no reason to serve a herb that has been in a lorry for two days.',
    ],
    pull: 'We season for the cabin, not the kitchen.',
  },
  {
    id: 'cargo-to-connection',
    eyebrow: 'Operations',
    title: 'Ninety-five minutes in Nairobi',
    standfirst: 'The tightest turnaround in our fleet, on an aircraft that carries 244 people and 41 bags. We put a stopwatch on it, and found a football team in the galley.',
    author: 'Wanjiru Kariuki',
    minutes: 8,
    date: '2026-05-27',
    img: '/img/cabin-economy.jpg',
    city: 'Nairobi',
    body: [
      'The clock starts at chocks-on, not at parking. On the 787 at Nairobi Terminal 1E, the whole sequence is 95 minutes, and roughly the first seven of them are the least visible: three separate vehicles — belt loader, potables, lav service — cannot move until the door at L2 is open, so the gate agent decides the pace of an entire operation by how fast they confirm the aircraft is depressurised.',
      'Unloading runs simultaneously with the first cabin clean and with a fuelling rig that arrives before the last row has emptied, which is exactly as nervous-making as it sounds and completely routine because of the earthing strap and a crew member whose only job is to watch that strap. Sixty-one bags on a short rotation; the belt is emptied in 19 minutes.',
      'The interesting part is the galley. Loading for the onward leg is a choreographed race: three carts per galley, each pre-loaded in a bonded kitchen, each with a numbered placard, loaded by an operator who cannot see the placards but memorises the sequence, and then cross-checked by the cabin manager against a manifest that includes special meals by seat number. If a single placard is wrong, the person with the Kosher meal is on the wrong aircraft, and we find that out at the seat, not at the gate.',
      'We ran a version of the turnaround with the cabin clean and the lav service swapped 20 minutes earlier, and it cost four minutes overall because everyone got in each other’s way. This is what most of aviation is: not a clever idea, but the discovery, in the wet, of exactly which order to do the obvious things.',
    ],
    pull: 'The gate agent sets the pace of an entire operation.',
  },
];

/* ---------------------------- about / corporate ---------------------------- */
export const ABOUT = {
  founded: 2009,
  hqs: ['Accra (Group)', 'Nairobi (East Africa)', 'Johannesburg (Southern Africa)'],
  story: [
    'AeroNova Airways began as a grievance. In 2009 a group of Ghanaian and Kenyan engineers, charter pilots and a logistics executive kept meeting in a hotel in Kumasi because they could not get themselves — or their cargo — to each other on a Tuesday. Every route ran through a European hub. Every connection cost a day, and a passport queue, and an argument with an airline that did not care.',
    'The first aircraft was a leased A319 with 24 Business seats where the flat beds were not flat. The first route was Accra to Lagos, five times a week, with a load factor of 61% in month one and 88% in month four. The second aircraft was bought because a customer — a cocoa cooperative — pre-purchased a year of seats in exchange for us financing it.',
    'Fifteen years later the group flies 46 aircraft to 41 destinations, is profitable in 12 of those 15 years, and still runs more capacity between African cities than any other carrier on the continent. The livery has not changed much: navy for the deep Atlantic at Cape Three Points, teal for the continental shelf, and a gold sunburst on the tail that every engineer in the Kumasi meeting agreed on before they agreed on anything else.',
  ],
  mission:
    'To make moving around and out of Africa as reliable, comfortable and dignified as moving within it has never been — and to do it on African capital, African crews and African standards.',
  vision:
    'By 2035, three of every four intra-African air journeys begin on an AeroNova flight, and no African passport holder has to route through somebody else’s hub to reach another African city.',
  values: [
    { title: 'Punctuality is respect', body: 'A plane on time is a promise kept to 200 strangers at once. We measure ourselves by the 15-minute rule and we have never accepted a schedule we cannot hit.' },
    { title: 'Quiet competence', body: 'The best service is invisible: the bag that arrives, the gate that is close, the announcement that was not needed. We hire for judgement, not for scripts.' },
    { title: 'Build it here', body: 'Our line maintenance, our catering, our lounge design, our training academy, our engineering apprenticeships. 91% of spend stays on the continent.' },
    { title: 'Say the number', body: 'Load factors, punctuality, complaints per thousand, incidents reported. We publish monthly, including the months that are bad.' },
  ],
  leadership: [
    { name: 'Dr. Ama Kyei-Bonsu', role: 'Group Chief Executive', since: 2019, bio: 'Founded the airline’s cargo arm; formerly Director of Air Transport at the Ghanaian Ministry of Aviation and the first woman to chair IATA’s Africa, Indian Ocean and Middle East board.', img: '/img/people-1.jpg' },
    { name: 'Kwame Ofori-Atta', role: 'President, Commercial', since: 2021, bio: 'Built the network from 12 to 41 destinations. Previously ran revenue management at two European carriers and says he left because “the pricing games were about winning, not about flying.”', img: '/img/people-2.jpg' },
    { name: 'Zanele Mthembu', role: 'Chief Operating Officer', since: 2018, bio: 'Line-check captain on the A330 fleet with 14,200 hours. Owns the turnaround standard, the 95-minute Nairobi clock, and a legendary patience with gate agents.', img: '/img/people-3.jpg' },
    { name: 'Idris Bakare', role: 'Chief Financial Officer', since: 2020, bio: 'Kept the airline profitable through a pandemic, a currency crisis and two fleet delays. Architect of the pre-purchased seat financing that still funds our narrowbody orders.', img: '/img/people-4.jpg' },
    { name: 'Dr. Fatou Ndiaye', role: 'Group Medical Director & Safety', since: 2017, bio: 'Aviation medicine specialist. Redesigned the cabin humidity and lighting programme after a 300-passenger sleep study on the London bank.', img: '/img/people-5.jpg' },
    { name: 'Samuel Ochieng', role: 'Chief Customer Officer', since: 2022, bio: 'Joined from a telecoms turnaround. Rebuilt the app, deleted 140 forms, and introduced the “say the number” reporting that made the airline a harder place to hide a bad month.', img: '/img/people-6.jpg' },
  ],
  stats: [
    { label: 'Aircraft', value: '46', note: 'average age 4.7 years' },
    { label: 'Destinations', value: '41', note: '27 African · 14 international' },
    { label: 'Employees', value: '11,400', note: '94% on the continent' },
    { label: 'Passengers / year', value: '18.6M', note: 'FY2025' },
    { label: 'On-time (15 min)', value: '87.9%', note: 'rolling 12 months' },
    { label: 'Profitable years', value: '12 of 15', note: 'since 2011' },
  ],
  sustainability: {
    headline: 'Not a pledge. A spreadsheet with a deadline.',
    points: [
      { label: 'Sustainable fuel', value: '14%', note: 'of total uplift in 2026, from the Tema hydrotreated plant — the largest single SAF offtake in West Africa' },
      { label: 'Emissions per passenger-km', value: '−19.4%', note: 'versus the 2019 fleet baseline, on capacity that grew 31%' },
      { label: 'Single-use plastic removed', value: '612 t', note: 'catering packaging, since 2022, with a returnable trolley system on 100% of African rotations' },
      { label: 'Crew ground transport', value: '78%', note: 'shuttled or on NovaRail at hub stations, cutting 4,100 car trips a week' },
      { label: 'Fleet renewal', value: '2031', note: 'no aircraft over 12 years on a scheduled route by then; nine A320neos are already on order' },
      { label: 'Carbon charge taken up', value: '31%', note: 'of passengers opt in; every cedi goes to the Kilombero and Kariba cookstove programmes, published quarterly' },
    ],
    note:
      'Our 2030 target is a 32% reduction against 2019 on an absolute basis, and we have said publicly — including to investors — that we will miss it on current technology if long-haul SAF does not come down to USD 1.6× fossil pricing before 2028.',
  },
  safety: {
    headline: 'Two IOSA audits with no findings. Three voluntary disclosures we could have kept quiet.',
    body: [
      'We publish our safety reporting culture on purpose. In 2025 crews filed 8,412 voluntary reports — up 26% year on year, which is the number we want to go up, because it means people are talking. We disciplined nobody for reporting.',
      'Every aircraft has two independent weather-linked route reviews before long-haul dispatch; fuel policy carries a fixed 40-minute additional reserve over IATA minimums; and since 2023 the captain may decline any schedule pressure without an explanation and has done so 61 times.',
      'Our maintenance is 91% in-house, across three line bases and one heavy facility in Tema, with the same engineers on the same airframes for a rotation rather than a shift — a small change that cut repeat defects 18%.',
    ],
    metrics: [
      { label: 'IOSA renewals since 2015', value: '5 · no findings' },
      { label: 'ICAO effective implementation (Ghana)', value: '89.4%' },
      { label: 'Serious incidents, 10 years', value: '0' },
      { label: 'Voluntary reports per 1,000 sectors', value: '41' },
    ],
  },
  responsibility: [
    { title: 'Nova Academy', body: '340 sponsored engineering and cabin-crew places a year, 68% of which go to candidates outside Accra and Nairobi. Tuition, housing and a wage, and no bond after graduation — 71% stay because the work is good.' },
    { title: 'Girls in Aviation, Kumasi', body: 'Running since 2016 with two senior schools. 1,900 alumni; 120 of them are now licensed engineers, pilots, dispatchers or aircraft designers on our roster, and 84 are elsewhere on the continent.' },
    { title: 'Conservation levies', body: 'A fixed USD 1.10 per passenger on every flight to VFA, JRO, ZNZ, KGL and MRU funds anti-poaching units and community conservancies — USD 4.9M since 2019, independently audited.' },
    { title: 'Emergency lift', body: 'When a state needs cargo capacity in a crisis we publish the offer and fly it at cost. Eleven operations since 2020, including 640 tonnes of medical freight and 4,100 passengers repatriated.' },
  ],
};

/* ---------------------------- newsroom ---------------------------- */
export interface NewsItem {
  id: string;
  kind: 'Press release' | 'Announcement' | 'Result' | 'Feature';
  title: string;
  date: string;
  place: string;
  summary: string;
  body?: string[];
}

export const NEWS: NewsItem[] = [
  { id: 'n1', kind: 'Announcement', title: 'AeroNova orders eight more 787-9s with an option for six, opening the Pacific rim plan', date: '2026-09-09', place: 'Accra', summary: 'The aircraft enter the fleet from Q4 2029 and are the first step in a stated intention to reach Sydney, Auckland and Seoul from 2030, with a Nairobi–Perth sector.' },
  { id: 'n2', kind: 'Result', title: 'Half-year results: revenue USD 3.42bn, EBITDAR margin 21.6%, load factor 83.4%', date: '2026-08-28', place: 'Accra', summary: 'Cargo yielded 14% ahead of budget; the North Atlantic returned to a full-season profit for the first time, and the group declared a maiden special dividend of USD 0.14 per share.' },
  { id: 'n3', kind: 'Press release', title: 'Kumasi gains a third daily rotation to London, and the reason is cocoa', date: '2026-08-12', place: 'Kumasi', summary: 'From 1 November, AN 204 carries a dedicated perishables belly load for the Cocobod export window, funded by a five-year forward agreement with three cooperatives.' },
  { id: 'n4', kind: 'Feature', title: 'Inside the 95-minute turnaround in Nairobi: a stopwatch, a galley and an earthing strap', date: '2026-07-30', place: 'Nairobi', summary: 'Our operations desk let two writers follow a 787 rotation end to end. What it shows is that aviation is mostly sequencing.' },
  { id: 'n5', kind: 'Press release', title: 'Galaxy Terminal at Accra adds a seventh pier and moves domestic check-in to row E', date: '2026-07-02', place: 'Accra', summary: 'The GH₵ 1.2bn expansion brings capacity to 16M passengers a year and completes the step-free kerb-to-gate programme across every gate position.' },
  { id: 'n6', kind: 'Announcement', title: 'AeroNova and Blue Ibis Air sign a full interline and loyalty agreement', date: '2026-06-14', place: 'Victoria Falls', summary: 'Through-checked baggage on 340 city pairs, joint upgrades, and reciprocal tier recognition from Elite and above, effective 1 September.' },
  { id: 'n7', kind: 'Result', title: 'June punctuality 89.1% — best month since 2021, and we know why', date: '2026-07-05', place: 'Accra', summary: 'The improvement is attributable to the overnight bank reshuffle and the decision to stop scheduling 55-minute turnarounds, which cost us two aircraft of utilisation and bought back 4.2 points of OTP.' },
  { id: 'n8', kind: 'Announcement', title: '14% SAF uplift reached a year early; Tema plant expansion announced', date: '2026-05-19', place: 'Tema', summary: 'The plant triples output by Q2 2028. AeroNova takes 30% at a capped price, which is why our 2030 target moved from 27% to 32%.' },
  { id: 'n9', kind: 'Feature', title: 'Our cargo aircraft now flies a weekly livestock run that ends an argument', date: '2026-04-22', place: 'Douala', summary: 'Two rotations between Douala, Libreville and Luanda have cut live-animal road transit from nine days to four hours and the associated loss rate from 6% to 0.4%.' },
  { id: 'n10', kind: 'Press release', title: 'Statement on the Lagos ramp incident of 3 March', date: '2026-03-06', place: 'Lagos', summary: 'A tow-bar failure injured one handler. Both engines were shut down correctly, no aircraft damage, and the investigation report — including the recommendation we had declined twice — has been published in full.' },
];

export const GALLERY = [
  { src: '/img/hero.jpg', caption: 'AN 5Y-AIN, A330-900neo, Galaxy T1 at first light' },
  { src: '/img/cabin-business.jpg', caption: 'Business suites on the 787-9, rows 1–2 with doors' },
  { src: '/img/lounge.jpg', caption: 'Galaxy Lounge, Accra — the mezzanine bar at 05:40' },
  { src: '/img/fleet.jpg', caption: 'Climb out of Nairobi, over the rift' },
  { src: '/img/cabin-economy.jpg', caption: 'Economy on the A330neo, mood lighting at 12%' },
  { src: '/img/dining.jpg', caption: 'Nova Table: the business breakfast over the Atlantic' },
  { src: '/img/airport-night.jpg', caption: 'Nairobi Terminal 1E, 23:10, four aircraft turning' },
  { src: '/img/city-lagos.jpg', caption: 'Short final into Murtala Muhammed' },
];

export const INVESTOR = [
  { label: 'FY2025 revenue', value: 'USD 6.31bn', delta: '+9.4%' },
  { label: 'EBITDAR margin', value: '22.1%', delta: '+1.8 pts' },
  { label: 'Net profit after tax', value: 'USD 604m', delta: '+14.0%' },
  { label: 'Load factor', value: '82.7%', delta: '+0.9 pts' },
  { label: 'Net debt / EBITDAR', value: '1.3×', delta: '−0.2×' },
  { label: 'Return on capital', value: '13.9%', delta: '+0.6 pts' },
];

export const CALENDAR = [
  { date: '2026-11-19', label: 'Q3 FY2026 results & call', kind: 'Results' },
  { date: '2026-12-04', label: 'Investor day: 2030 fleet & network plan', kind: 'Event' },
  { date: '2027-02-25', label: 'AGM, Accra International Conference Centre', kind: 'Governance' },
  { date: '2027-03-11', label: 'Full-year results', kind: 'Results' },
];

/* ---------------------------- careers ---------------------------- */
export const DEPARTMENTS = [
  { id: 'flight-ops', name: 'Flight Operations', people: 1840, note: 'Dispatch, crew scheduling, standards', open: 26 },
  { id: 'cabin', name: 'Cabin Crew', people: 4260, note: '3 intakes a year, based at any hub', open: 118 },
  { id: 'engineering', name: 'Engineering & Maintenance', people: 1610, note: 'Tema heavy facility, line bases at ACC/NBO/JNB', open: 41 },
  { id: 'commercial', name: 'Commercial & Network', people: 385, note: 'Revenue management, sales, loyalty', open: 19 },
  { id: 'digital', name: 'Digital & Data', people: 312, note: 'App, platform engineering, forecasting', open: 24 },
  { id: 'customer', name: 'Customer Experience', people: 1980, note: 'Airport services, contact centre, special assistance', open: 63 },
  { id: 'safety', name: 'Safety & Quality', people: 128, note: 'SMS, audit, human factors', open: 7 },
  { id: 'corporate', name: 'Finance, Legal, People', people: 485, note: 'Shared services in Accra and Nairobi', open: 12 },
];

export interface Job {
  id: string;
  title: string;
  dept: string;
  location: string;
  type: string;
  level: string;
  salary: string;
  posted: string;
  blurb: string;
  responsibilities: string[];
  requirements: string[];
}

export const JOBS: Job[] = [
  {
    id: 'j1',
    title: 'Captain, A330neo',
    dept: 'Flight Operations',
    location: 'Accra (ACC)',
    type: 'Full-time',
    level: 'Commander',
    salary: 'Base + flying pay, from USD 148k total',
    posted: '2026-09-02',
    blurb: 'Type-rated A330 commanders with an African operating background. Six rotations a month, four nights in any destination of your choice on the long network.',
    responsibilities: ['Pilot-in-command on long-haul rotations to Europe, North America and the Middle East', 'Standardisation and check duties as assigned by Standards', 'Participation in the FOQA review board (two per year)'],
    requirements: ['ATPL with a minimum 6,000 hours, 1,500 on widebody', 'Current Class 1 medical, valid ICAO ELP 5+', 'No more than one adverse LOSA finding in 36 months'],
  },
  {
    id: 'j2',
    title: 'Cabin Crew (Initial Training Intake 27)',
    dept: 'Cabin Crew',
    location: 'Accra · Nairobi · Johannesburg',
    type: 'Full-time',
    level: 'Entry',
    salary: 'USD 1,120/month + per diem',
    posted: '2026-09-07',
    blurb: 'We hire for judgement and teach the rest. Training is 8 weeks, paid, with accommodation in Accra provided.',
    responsibilities: ['Safety duties first, service second — we mean that literally in the syllabus', 'Special-assistance and unaccompanied-minor procedures', 'First aid and AED currency every 24 months'],
    requirements: ['18+, fluent English plus one other language is an advantage', 'Reach 212 cm to touch, no other height rule', 'No tattoos visible on a short-sleeve uniform — the ban is lifted below the elbow'],
  },
  {
    id: 'j3',
    title: 'Line Maintenance Engineer (B1)',
    dept: 'Engineering & Maintenance',
    location: 'Nairobi (NBO)',
    type: 'Full-time',
    level: 'Licensed',
    salary: 'KES 4.2M–5.6M + shift allowance',
    posted: '2026-08-27',
    blurb: 'Own an airframe. Our line engineers stay with one aircraft through a rotation, and it is why our repeat-defect rate is 18% below the industry norm.',
    responsibilities: ['Line checks, defect rectification and deferrals within MEL limits', 'Reliability input to the monthly review', 'Mentoring of two apprentices per quarter'],
    requirements: ['KCAA/ GCAA B1.1 licence with A330/787 endorsement (or willing to type-switch)', 'Human Factors and EWIS current', 'A clean 5-year safety record we can verify'],
  },
  {
    id: 'j4',
    title: 'Senior Revenue Manager — Africa Network',
    dept: 'Commercial & Network',
    location: 'Accra (hybrid)',
    type: 'Full-time',
    level: 'Senior',
    salary: 'USD 74k–92k + bonus',
    posted: '2026-09-05',
    blurb: 'Own pricing for 27 African cities against a competitor set that includes two of the world’s most aggressive Gulf carriers.',
    responsibilities: ['Fare, inventory and overbooking policy for the African network', 'Weekly demand review with the cargo desk (yes, jointly)', 'Prototype elasticity models with the data team'],
    requirements: ['5+ years revenue management, aviation or a comparable perishable-per-seat industry', 'Strong SQL and a willingness to argue with a forecast', 'Fluency in French is a genuine advantage, not a nice-to-have'],
  },
  {
    id: 'j5',
    title: 'Product Engineer (Booking & Ancillaries)',
    dept: 'Digital & Data',
    location: 'Accra / Remote (Africa)',
    type: 'Full-time',
    level: 'Mid–Senior',
    salary: 'USD 58k–76k',
    posted: '2026-09-01',
    blurb: 'You will work on the seat map, the ancillaries engine and the check-in flow. Our booking funnel converts at 9.2% and you will be accountable for it.',
    responsibilities: ['Design, build and measure booking-flow features end to end', 'Accessibility is part of the definition of done — WCAG 2.2 AA', 'Own the mobile performance budget (2.1 s LCP on a 3G Lagos connection)'],
    requirements: ['TypeScript and React at a production level, 4+ years', 'Comfort with a payments and PNR domain', 'Shipped something you can show us, and something that broke'],
  },
  {
    id: 'j6',
    title: 'Special Assistance Coordinator',
    dept: 'Customer Experience',
    location: 'Accra (ACC)',
    type: 'Full-time',
    level: 'Team lead',
    salary: 'USD 26k–33k + shift',
    posted: '2026-08-29',
    blurb: 'You own the promise that nobody waits more than five minutes, and you have the authority to spend money to keep it.',
    responsibilities: ['Rota and training of 38 agents across the Galaxy terminal', 'Own the 99.2% completion metric and every miss on it', 'Chair the monthly Passenger Panel review'],
    requirements: ['Supervisory experience in a regulated service environment', 'Actual confidence with disability etiquette and assistive equipment', 'Fluent English; Twi or French useful'],
  },
  {
    id: 'j7',
    title: 'Graduate Programme — Operations & Engineering (2027 intake)',
    dept: 'Graduate Programme',
    location: 'Accra, with rotations to Tema and Nairobi',
    type: 'Two-year scheme',
    level: 'Graduate',
    salary: 'USD 24k + full benefits, housing support',
    posted: '2026-09-10',
    blurb: 'Eight rotations, one project each, and a real engineering or operations outcome at the end of it. Twelve places. No prior aviation background needed.',
    responsibilities: ['Rotations in dispatch, line maintenance, turnaround control, network planning', 'One improvement project sponsored by a Director', 'Two weeks at the Tema heavy facility on the tools'],
    requirements: ['A first degree in any engineering, maths, physics or logistics field, 2:1 or above', 'Within 24 months of graduation', 'Willingness to work nights during the operations rotations'],
  },
  {
    id: 'j8',
    title: 'Safety Analyst (FOQA / ASRS)',
    dept: 'Safety & Quality',
    location: 'Accra (ACC)',
    type: 'Full-time',
    level: 'Analyst',
    salary: 'USD 38k–49k',
    posted: '2026-08-21',
    blurb: 'Find the pattern in 8,400 voluntary reports a year before it becomes an occurrence.',
    responsibilities: ['Flight-data trend analysis and weekly review with flight ops', 'Just Culture custodian — you will refuse to name people, and be supported for it', 'Feed the 2 monthly safety bulletin'],
    requirements: ['Statistics or engineering background; Python or R fluency', 'Understanding of SMS and human factors', 'Thick skin and a good memory for detail'],
  },
];

export const CAREER_STAGES = [
  { title: 'Apply in 12 minutes', body: 'One form, no cover letter. We read the answers, not the formatting.' },
  { title: 'Two weeks, one decision', body: 'Every application gets a human answer inside 14 days. We publish our average.' },
  { title: 'Assessment day in Accra or Nairobi', body: 'Group exercise, role-specific test, and a conversation with the team you would join.' },
  { title: 'Offer in 72 hours', body: 'Written within three days of the assessment. No ghosting, no “we’ll be in touch.”' },
  { title: 'Paid training, real pay from day one', body: 'Cabin crew, engineers and graduates are on payroll from the first training morning.' },
];

export const LIFE_AT_AERONOVA = [
  { title: 'The roster is a life, not a lottery', body: 'Bid lines are published nine weeks ahead and 78% of crew fly their bid as filed. Every crew member gets four destination-of-choice nights a year, no justification.' },
  { title: 'Three hubs, one standard', body: 'A cup of coffee at Nairobi should not be worse than one in Accra. We move people between bases every 18 months so that is not folklore.' },
  { title: 'We publish the bad months', body: 'Punctuality, complaints, incidents and load factor, monthly, to all 11,400 of us. Nobody is surprised by a number at a review.' },
  { title: 'Training you keep', body: 'Type ratings, licences and CADT qualifications are ours to pay for and yours to keep, and we have never bonded a graduate.' },
];
