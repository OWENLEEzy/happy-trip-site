window.HAPPY_TRIP_DATA = {
  meta: {
    tripTitle: "Malaysia · Singapore | 9-Day Couple's Journey",
    tripSlug: "my-sg-9day",
    dateRange: "Dec 14 – Dec 22, 2026",
    language: "en",
    hero: {
      url: "https://commons.wikimedia.org/wiki/Special:FilePath/Petronas_Panorama_II.jpg?width=1600",
      alt: "Petronas Twin Towers panoramic view, Kuala Lumpur",
      query: "Petronas Twin Towers KL panorama",
      source_name: "Wikimedia Commons",
      source_url: "https://commons.wikimedia.org/wiki/File:Petronas_Panorama_II.jpg",
      reason: "Wikimedia Commons Petronas Panorama II — defining icon of the Malaysia leg"
    },
    assumptions: [
      "Flights between cities are self-arranged; the itinerary shows ground-day activities only.",
      "Ferry Penang → Langkawi departs Swettenham Pier; book at least one day ahead in December.",
      "Petronas Twin Towers Skybridge requires advance online booking — link included.",
      "Batu Caves is busiest in the morning; aim to arrive before 9 AM.",
      "Day order is Singapore → Penang → Langkawi → KL; adjust if flying direct to Penang."
    ],
    uncertainItems: [
      "Exact hotel names not specified — activity timing assumes central locations.",
      "Langkawi Cable Car may close in bad weather; check on the day."
    ]
  },
  ui: {
    recommended_option_id: "peranakan-jade-sensory",
    confirmed_option_id: "peranakan-jade-sensory",
    confirmed_option: {
      id: "peranakan-jade-sensory",
      name: "Peranakan Jade",
      reason: "Peranakan teal-jade anchors all three destinations: Georgetown's shophouses, Singapore's Emerald Hill, and KL's tile-work heritage. Sensory layout lets hero photos lead each day — perfect for a couple wanting to feel the place before reading the plan.",
      archetype: "sensory",
      layout_profile: "peranakan-tropical-blocks",
      palette: {
        background: "#EFF7F4",
        surface: "#FFFDF9",
        ink: "#0D1E1A",
        muted: "#3D6D65",
        accent: "#1A5C50",
        accent2: "#A0470D",
        line: "rgba(13,30,26,0.14)"
      },
      typography: {
        sans: "\"Noto Sans\", system-ui, sans-serif",
        serif: "\"Lora\", Georgia, serif",
        display: "\"Lora\", Georgia, serif"
      },
      density: "spacious",
      navigation: "topbar-drawer",
      hero_treatment: "split-photo-panel",
      card_treatment: "block-cards",
      link_treatment: "route-first-toolbar",
      map_treatment: "route-panel-first",
      motion_level: "subtle",
      motifs: ["peranakan-tile", "batik-diamond", "tropical-foliage"],
      fit_statement: "A rich, photo-led style rooted in Peranakan heritage — for couples who want each day to feel like turning the page of a bespoke travel magazine.",
      beginner_traits: ["Full-bleed hero photos", "Jade & warm terracotta palette", "Batik tile motif", "Spacious card rhythm", "Lora serif headings"],
      aesthetic: {
        anchorColor: "#1A5C50",
        accentWarm: "#A0470D",
        texture: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='t'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.55' numOctaves='3'/%3E%3CfeColorMatrix values='0 0 0 0 0.10  0 0 0 0 0.36  0 0 0 0 0.31  0 0 0 0.6 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23t)'/%3E%3C/svg%3E",
        textureOpacity: 0.12,
        motif: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Cpath d='M20 4 L36 20 L20 36 L4 20 Z' fill='none' stroke='%231A5C50' stroke-width='.8' opacity='.12'/%3E%3Ccircle cx='20' cy='20' r='3' fill='%231A5C50' opacity='.1'/%3E%3Ccircle cx='0' cy='0' r='2' fill='%231A5C50' opacity='.08'/%3E%3Ccircle cx='40' cy='0' r='2' fill='%231A5C50' opacity='.08'/%3E%3Ccircle cx='0' cy='40' r='2' fill='%231A5C50' opacity='.08'/%3E%3Ccircle cx='40' cy='40' r='2' fill='%231A5C50' opacity='.08'/%3E%3C/svg%3E",
        glyph: { mark: "新马", rotate: -6 },
        fontDisplay: "\"Lora\", Georgia, serif",
        fontBody: "\"Noto Sans\", system-ui, sans-serif",
        fontLink: "https://fonts.googleapis.com/css2?family=Lora:ital,wght@0,500;0,700;1,500&family=Noto+Sans:wght@400;500&display=swap"
      }
    }
  },
  generalResources: {
    title: "Trip Essentials",
    summary: "Transport, money, connectivity, and practical tips across Singapore and Malaysia.",
    links: [
      { type: "web", label: "Grab App", url: "https://grab.com", priority: "primary" },
      { type: "web", label: "EZ-Link Singapore", url: "https://www.ezlink.com.sg", priority: "secondary" },
      { type: "web", label: "Touch 'n Go MY", url: "https://www.touchngo.com.my", priority: "secondary" }
    ],
    sections: [
      {
        kicker: "Getting Around",
        title: "Transport by Country",
        note: "Grab works in both countries and is usually cheaper than metered taxis. In Singapore, the MRT covers all key spots efficiently.",
        points: [
          "Singapore: MRT + EZ-Link card (~SGD 12 to start, top up at any station)",
          "Penang: Grab or RapidPenang bus; walking in Heritage Zone",
          "Langkawi: Rent a car or motorbike — public transport is minimal",
          "KL: MRT/LRT + Touch 'n Go card (buy at any LRT counter, RM 10 deposit)"
        ]
      },
      {
        kicker: "Connectivity",
        title: "SIM & eSIM",
        steps: [
          { title: "Singapore eSIM", body: "Buy a Singtel or Starhub eSIM before departure. 5-day plans from ~SGD 15." },
          { title: "Malaysia SIM", body: "Digi or Maxis prepaid SIM at KLIA2 Arrivals (~RM 30 for 14-day unlimited)." }
        ]
      },
      {
        kicker: "Money",
        title: "Currency & Payments",
        points: [
          "Singapore: SGD — mostly cashless, credit card accepted almost everywhere",
          "Malaysia: MYR — hawker stalls cash only; bring RM 50–100 in small notes",
          "Wise or Revolut cards save on currency conversion",
          "Langkawi duty-free: alcohol, chocolate, cosmetics significantly cheaper"
        ]
      },
      {
        kicker: "Dec Weather",
        title: "What to Expect",
        note: "December is the northeast monsoon. Penang and Langkawi (west coast) are drier. Singapore sees afternoon showers. Pack a light rain jacket.",
        points: [
          "Singapore: 26–32 °C, afternoon showers",
          "Penang: 25–33 °C, mostly sunny",
          "Langkawi: 27–34 °C — drier on the west coast in December",
          "KL: 24–33 °C, short heavy afternoon showers"
        ]
      }
    ]
  },
  days: [
    {
      n: 1,
      date: "12/14",
      city: "Singapore",
      areaLabel: "Marina Bay",
      title: "Arrive in the Lion City",
      themeLabel: "Iconic Skyline",
      hero: {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Marina_Bay_Sands_%28I%29.jpg/3840px-Marina_Bay_Sands_%28I%29.jpg",
        alt: "Marina Bay Sands hotel and skyline, Singapore",
        source_name: "Wikimedia Commons",
        reason: "Wikipedia article Marina Bay Sands lead photo — defining skyline of the Singapore leg"
      },
      routeOverview: {
        title: "Marina Bay Circuit",
        mode: "walk",
        zoom: 14,
        stops: [
          { label: "Changi Airport", query: "Changi Airport Singapore Terminal 3", inferred: false },
          { label: "Marina Bay Sands", query: "Marina Bay Sands Singapore", inferred: false },
          { label: "Merlion Park", query: "Merlion Park Singapore", inferred: false },
          { label: "Gardens by the Bay", query: "Gardens by the Bay Singapore", inferred: false }
        ]
      },
      morning: [
        {
          time: "Morning",
          tag: "transit",
          tagText: "Arrival",
          title: "Arrive at Changi Airport — Jewel Walk",
          subtitle: "JEWEL Changi Airport · Rain Vortex",
          note: "After clearing customs, walk through JEWEL Changi — the world's tallest indoor waterfall (40 m Rain Vortex) is free from the transit hall. Spend 30–45 min in the canopy forest walk before taking the MRT into the city. The MRT Airport line runs every 4–8 min to the city centre (~30 min, SGD 1.90).",
          mapStopLabels: ["Changi Airport"],
          links: [
            { type: "maps", label: "Changi Airport", url: "https://maps.google.com/?q=Changi+Airport+Singapore", priority: "primary" },
            { type: "web", label: "Jewel Changi", url: "https://www.jewelchangiairport.com", priority: "secondary" }
          ]
        },
        {
          time: "Late Morning",
          tag: "rest",
          tagText: "Check-in",
          title: "Hotel Check-in & Marina Bay Lunch",
          subtitle: "Marina Bay / CBD area",
          note: "Check in, freshen up, then head out for lunch near the waterfront. Lau Pa Sat (Shenton Way) is a Victorian cast-iron hawker centre — the most atmospheric lunch spot in the CBD. Satay stalls on the Boon Tat Street extension open from midday. Very local, very affordable.",
          links: [
            { type: "maps", label: "Lau Pa Sat", url: "https://maps.google.com/?q=Lau+Pa+Sat+Singapore", priority: "primary" }
          ]
        },
        {
          time: "Noon",
          tag: "transit",
          tagText: "MRT",
          title: "EZ-Link / Contactless Transit Setup",
          subtitle: "MRT station · Stored-value card check",
          note: "Before the first long city loop, confirm everyone has an EZ-Link card or a contactless Visa/Mastercard ready for MRT gates. Top up at any station machine if the balance is low. This avoids ticket-machine friction later when moving between Marina Bay, Gardens, and Clarke Quay.",
          links: [
            { type: "web", label: "TransitLink", url: "https://www.transitlink.com.sg", priority: "secondary" },
            { type: "maps", label: "Bayfront MRT", url: "https://maps.google.com/?q=Bayfront+MRT+Singapore", priority: "primary" }
          ]
        }
      ],
      afternoon: [
        {
          time: "Afternoon",
          tag: "landmark",
          tagText: "Landmark",
          title: "Marina Bay Sands Observation Deck",
          subtitle: "SkyPark Observation Deck · Level 57",
          note: "Buy tickets in advance online — counter queues can be 45 min. Arrive around 3 PM for the best light before sunset crowds. The 360° view across the city, Sentosa, and southern islands is genuinely one of Southeast Asia's finest.",
          mapStopLabels: ["Marina Bay Sands"],
          image: {
            url: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/c7/Marina_Bay_Sands_%28I%29.jpg/3840px-Marina_Bay_Sands_%28I%29.jpg",
            alt: "Marina Bay Sands hotel exterior",
            source_name: "Wikimedia Commons"
          },
          sections: [
            {
              kicker: "Tickets",
              title: "Booking",
              steps: [
                { title: "Buy online", body: "marinabaysands.com → SkyPark. Adult SGD 32. Skip the walk-up queue." },
                { title: "Best time", body: "3–5 PM for golden-hour glow over the city." }
              ]
            }
          ],
          links: [
            { type: "web", label: "Book Tickets", url: "https://www.marinabaysands.com/museum-and-attractions/skypark.html", priority: "critical" },
            { type: "maps", label: "Google Maps", url: "https://maps.google.com/?q=Marina+Bay+Sands+Observation+Deck", priority: "primary" }
          ]
        },
        {
          time: "Late Afternoon",
          tag: "walk",
          tagText: "Walk",
          title: "Merlion Park & Helix Bridge Promenade",
          subtitle: "One Fullerton · Marina Bay Waterfront",
          note: "Walk across the Helix Bridge to Merlion Park — best photo angle: Merlion in the foreground with Marina Bay Sands behind. The 1.5 km waterfront to Esplanade is a pleasant promenade with coconut stalls and waterfront cafés. The Esplanade Theatres roof terraces (free) offer a second great city vantage point.",
          mapStopLabels: ["Merlion Park"],
          links: [
            { type: "maps", label: "Merlion Park", url: "https://maps.google.com/?q=Merlion+Park+Singapore", priority: "primary" }
          ]
        },
        {
          time: "Golden Hour",
          tag: "rest",
          tagText: "Break",
          title: "Esplanade Roof Terrace Pause",
          subtitle: "Esplanade Theatres · Free city viewpoint",
          note: "Use the free Esplanade roof terrace as a quiet reset between the waterfront walk and the Gardens light show. It has shade, public toilets downstairs, and a clean skyline angle back toward Marina Bay Sands. If rain rolls in, shelter inside the mall concourse until the shower passes.",
          links: [
            { type: "maps", label: "Esplanade Roof", url: "https://maps.google.com/?q=Esplanade+Theatres+Roof+Terrace+Singapore", priority: "primary" },
            { type: "web", label: "Esplanade", url: "https://www.esplanade.com", priority: "secondary" }
          ]
        }
      ],
      evening: [
        {
          time: "Evening",
          tag: "garden",
          tagText: "Garden",
          title: "Gardens by the Bay — Supertree Light Show",
          subtitle: "OCBC Garden Rhapsody · 7:45 PM & 8:45 PM",
          note: "The outdoor Supertree Grove is free to enter. OCBC Garden Rhapsody light-and-music show runs nightly at 7:45 PM and 8:45 PM (15 min each). Arrive by 7:30 PM for a good spot. The Flower Dome and Cloud Forest conservatories need tickets but are worth it on a rainy day.",
          mapStopLabels: ["Gardens by the Bay"],
          sections: [
            {
              kicker: "Show",
              title: "Light Show",
              points: [
                "7:45 PM + 8:45 PM nightly — free outdoor area",
                "Stand between the two clusters for the best overhead view",
                "Cloud Forest conservatory: book online at gardensbythebay.com.sg"
              ]
            }
          ],
          links: [
            { type: "web", label: "Official Site", url: "https://www.gardensbythebay.com.sg", priority: "primary" },
            { type: "maps", label: "Google Maps", url: "https://maps.google.com/?q=Gardens+by+the+Bay+Singapore", priority: "primary" }
          ]
        },
        {
          time: "Late Evening",
          tag: "food",
          tagText: "Dinner",
          title: "Satay by the Bay or Marina Barrage Rooftop",
          subtitle: "Gardens by the Bay Meadow / Marina Barrage",
          note: "Satay by the Bay food market is inside Gardens by the Bay — open-air hawker with satay, BBQ seafood, and cold drinks. Alternatively, walk 10 min to Marina Barrage for the rooftop garden view of the city at night — completely free and uncrowded after 8 PM.",
          links: [
            { type: "maps", label: "Satay by the Bay", url: "https://maps.google.com/?q=Satay+by+the+Bay+Singapore", priority: "primary" }
          ]
        }
      ]
    },
    {
      n: 2,
      date: "12/15",
      city: "Singapore",
      areaLabel: "Chinatown / Sentosa / Clarke Quay",
      title: "Heritage Morning, Island Afternoon",
      themeLabel: "Layers of Singapore",
      hero: {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5d/Supertree_Grove%2C_Gardens_by_the_Bay%2C_Singapore_-_20120712-02.jpg/3840px-Supertree_Grove%2C_Gardens_by_the_Bay%2C_Singapore_-_20120712-02.jpg",
        alt: "Supertree Grove at Gardens by the Bay, Singapore",
        source_name: "Wikimedia Commons",
        reason: "Wikipedia Commons Supertree Grove photograph — iconic Singapore landmark"
      },
      routeOverview: {
        title: "Heritage & Island Day",
        mode: "transit",
        zoom: 12,
        stops: [
          { label: "Maxwell Food Centre", query: "Maxwell Food Centre Tanjong Pagar Singapore", inferred: false },
          { label: "Chinatown Heritage Centre", query: "Chinatown Heritage Centre Singapore", inferred: false },
          { label: "Sentosa Island", query: "Sentosa Island Singapore", inferred: false },
          { label: "Clarke Quay", query: "Clarke Quay Singapore", inferred: false }
        ]
      },
      morning: [
        {
          time: "Morning",
          tag: "food",
          tagText: "Breakfast",
          title: "Maxwell Food Centre — Tian Tian Chicken Rice",
          subtitle: "Maxwell Road · Tanjong Pagar",
          note: "Singapore's most famous breakfast hawker centre. Tian Tian Hainanese Chicken Rice (stall #01-10) was the one Anthony Bourdain queued for — arrive by 8:30 AM or expect a 20-min wait. Also try the Curry Puff (stall #01-68) and fresh coconut water from the side stalls. Cash only at most stalls; change available.",
          mapStopLabels: ["Maxwell Food Centre"],
          sections: [
            {
              kicker: "Order",
              title: "Must-Try Stalls",
              points: [
                "Tian Tian Chicken Rice (#01-10): the benchmark — silky poached chicken, fragrant rice",
                "Original Katong Laksa: coconut-based, rich spice broth",
                "Jin Jin Dessert: cheng tng cold sweet soup for dessert"
              ]
            }
          ],
          links: [
            { type: "maps", label: "Maxwell Food Centre", url: "https://maps.google.com/?q=Maxwell+Food+Centre+Singapore", priority: "primary" }
          ]
        },
        {
          time: "Late Morning",
          tag: "culture",
          tagText: "Heritage",
          title: "Chinatown Heritage Centre",
          subtitle: "48 Pagoda Street · Chinatown MRT",
          note: "This immersive museum recreates the cramped shophouse life of early Chinese immigrants. Allow 90 min. After, wander Pagoda Street for antique shops and the Sri Mariamman Temple (Singapore's oldest Hindu temple, free entry). The neighbouring Tong Chai Medical Institution on Eu Tong Sen St is a beautifully restored free museum.",
          mapStopLabels: ["Chinatown Heritage Centre"],
          sections: [
            {
              kicker: "Tickets",
              title: "Practical",
              points: [
                "SGD 18 adult — book at chinatownheritagecentre.com.sg",
                "Opens 9 AM; quietest before 11 AM",
                "Sri Mariamman Temple: free, remove shoes at entrance"
              ]
            }
          ],
          links: [
            { type: "web", label: "Book Tickets", url: "https://chinatownheritagecentre.com.sg", priority: "critical" },
            { type: "maps", label: "Google Maps", url: "https://maps.google.com/?q=Chinatown+Heritage+Centre+Singapore", priority: "primary" }
          ]
        },
        {
          time: "Noon",
          tag: "walk",
          tagText: "Temple",
          title: "Sri Mariamman Temple & Pagoda Street Loop",
          subtitle: "South Bridge Road · Chinatown",
          note: "Before leaving Chinatown, step into Sri Mariamman Temple, Singapore's oldest Hindu temple. Remove shoes, keep shoulders covered, and look up at the colourful gopuram tower over South Bridge Road. The short loop through Pagoda Street keeps the heritage morning grounded before the Sentosa transit.",
          links: [
            { type: "maps", label: "Sri Mariamman", url: "https://maps.google.com/?q=Sri+Mariamman+Temple+Singapore", priority: "primary" },
            { type: "web", label: "Temple Info", url: "https://www.smt.org.sg", priority: "secondary" }
          ]
        }
      ],
      afternoon: [
        {
          time: "Afternoon",
          tag: "beach",
          tagText: "Island",
          title: "Sentosa Island — Beach & Siloso",
          subtitle: "Siloso Beach / Palawan Beach",
          note: "Take the Sentosa Express monorail from VivoCity Level 3 (Harbourfront MRT, SGD 4 return). Siloso Beach has sun loungers, watersports, and beach bars. Palawan Beach is quieter and has the southernmost point of continental Asia. S.E.A. Aquarium is excellent — book online for the 10 AM–6 PM window.",
          mapStopLabels: ["Sentosa Island"],
          image: {
            url: "https://commons.wikimedia.org/wiki/Special:FilePath/Siloso_Beach,_Sentosa_Island,_Singapore.jpg?width=1600",
            alt: "Siloso Beach, Sentosa Island",
            source_name: "Wikimedia Commons"
          },
          sections: [
            {
              kicker: "Getting There",
              title: "Sentosa Access",
              steps: [
                { title: "Sentosa Express", body: "From VivoCity Level 3, Harbourfront MRT. SGD 4 return. Every 10 min." },
                { title: "Beach Shuttle", body: "Free between Sentosa's beaches every 15 min from Beach Station." }
              ]
            },
            {
              kicker: "Best Spots",
              title: "Choose Your Pace",
              points: [
                "Siloso Beach: sun loungers, Bikini Bar, watersports rental",
                "Palawan Beach: quieter, southernmost point walkway",
                "S.E.A. Aquarium: 40,000 marine creatures, 2–3 h (pre-book)"
              ]
            }
          ],
          links: [
            { type: "web", label: "Sentosa Guide", url: "https://www.sentosa.com.sg", priority: "primary" },
            { type: "maps", label: "Google Maps", url: "https://maps.google.com/?q=Siloso+Beach+Sentosa+Singapore", priority: "primary" }
          ]
        },
        {
          time: "Late Afternoon",
          tag: "walk",
          tagText: "Stroll",
          title: "VivoCity Rooftop & HarbourFront Sunset",
          subtitle: "HarbourFront Centre · Level 2 Roof",
          note: "On the way back from Sentosa, stop at VivoCity's rooftop Level 2 outdoor area — free, with unobstructed views of Sentosa and the strait. A great quiet spot for a sunset drink from the rooftop bar. Keppel Bay marina is visible to the west.",
          links: [
            { type: "maps", label: "VivoCity Rooftop", url: "https://maps.google.com/?q=VivoCity+Singapore", priority: "primary" }
          ]
        },
        {
          time: "Transit",
          tag: "transit",
          tagText: "MRT",
          title: "HarbourFront → Clarke Quay Transfer",
          subtitle: "North East Line · One-seat ride",
          note: "From HarbourFront MRT, take the North East Line directly to Clarke Quay. The ride is about 10 minutes and avoids a Grab wait during evening traffic. Keep this as the clean reset between the island afternoon and the riverside dinner block.",
          links: [
            { type: "maps", label: "HarbourFront MRT", url: "https://maps.google.com/?q=HarbourFront+MRT+Singapore", priority: "primary" },
            { type: "maps", label: "Clarke Quay MRT", url: "https://maps.google.com/?q=Clarke+Quay+MRT+Singapore", priority: "secondary" }
          ]
        }
      ],
      evening: [
        {
          time: "Evening",
          tag: "food",
          tagText: "Dining",
          title: "Clarke Quay — Riverside Dinner",
          subtitle: "River Valley Road · Central",
          note: "Clarke Quay is Singapore's most atmospheric riverside dining and bar district. Skip the immediate waterfront restaurants — instead head one block back to Magazine Road or Boat Quay for better value. Jumbo Seafood is the go-to for chilli crab (SGD 60–80 for two sharing); book ahead online.",
          mapStopLabels: ["Clarke Quay"],
          sections: [
            {
              kicker: "Must Try",
              title: "Chilli Crab",
              points: [
                "Jumbo Seafood: Clarke Quay outlet. Order chilli crab + mantou buns",
                "Budget tip: Lau Pa Sat satay stalls reopen at 7 PM for evening — great cheaper option"
              ]
            }
          ],
          links: [
            { type: "web", label: "Jumbo Seafood", url: "https://www.jumboseafood.com.sg", priority: "primary" },
            { type: "maps", label: "Clarke Quay", url: "https://maps.google.com/?q=Clarke+Quay+Singapore", priority: "primary" }
          ]
        },
        {
          time: "Late Evening",
          tag: "walk",
          tagText: "Nightlife",
          title: "Boat Quay Bar Hop",
          subtitle: "Circular Road / Boat Quay riverside",
          note: "After dinner, walk along Boat Quay — the crescent of old shophouses directly on the river is Singapore's most photogenic bar strip. Grab a Tiger beer from Penny Black or one of the open-front bars, sit riverside, and watch the city light up. No cover charge; walk-in welcome.",
          links: [
            { type: "maps", label: "Boat Quay", url: "https://maps.google.com/?q=Boat+Quay+Singapore", priority: "primary" }
          ]
        }
      ]
    },
    {
      n: 3,
      date: "12/16",
      city: "Georgetown, Penang",
      areaLabel: "George Town Heritage Zone",
      title: "Street Art & Peranakan Soul",
      themeLabel: "Old Town Charm",
      hero: {
        url: "https://commons.wikimedia.org/wiki/Special:FilePath/Penang_-_Boy_on_a_Bike.JPG?width=1600",
        alt: "Famous 'Boy on a Bike' wire sculpture mural, Georgetown Penang",
        source_name: "Wikimedia Commons",
        reason: "Commons file Penang - Boy on a Bike.JPG — most recognisable street art mural in Georgetown"
      },
      routeOverview: {
        title: "Georgetown Heritage Walk",
        mode: "walk",
        zoom: 15,
        stops: [
          { label: "Changi Airport", query: "Changi Airport Singapore Terminal 3", inferred: false },
          { label: "Georgetown Heritage Zone", query: "Georgetown Heritage Zone Penang Malaysia", inferred: false },
          { label: "Khoo Kongsi", query: "Khoo Kongsi Clan Temple Georgetown Penang", inferred: false },
          { label: "Clan Jetties", query: "Clan Jetties Penang Malaysia", inferred: false }
        ]
      },
      morning: [
        {
          time: "Morning",
          tag: "transit",
          tagText: "Transit",
          title: "Fly Singapore → Penang (Changi T3)",
          subtitle: "Changi T3 → Penang International Airport",
          note: "Flight is ~1 h 10 min. Take the earliest available AirAsia or Scoot departure. Penang airport is in Bayan Lepas — take a Grab to Georgetown (~30 min, ~RM 25). Check in and drop bags before heading out.",
          mapStopLabels: ["Changi Airport"],
          links: [
            { type: "maps", label: "Penang Airport", url: "https://maps.google.com/?q=Penang+International+Airport+Malaysia", priority: "primary" }
          ]
        },
        {
          time: "Arrival",
          tag: "transit",
          tagText: "Grab",
          title: "Penang Airport → Georgetown Grab",
          subtitle: "Bayan Lepas · 30 min airport transfer",
          note: "Book Grab only after bags arrive; airport pickup points can shift between domestic and international exits. The ride to the Heritage Zone is normally 30 minutes, but allow 45 minutes if traffic backs up near Bayan Baru. Save the hotel name in Grab before leaving Singapore so you are not typing at the curb.",
          links: [
            { type: "maps", label: "Penang Airport", url: "https://maps.google.com/?q=Penang+International+Airport+Bayan+Lepas", priority: "primary" },
            { type: "web", label: "Grab", url: "https://www.grab.com/my", priority: "secondary" }
          ]
        },
        {
          time: "Late Morning",
          tag: "rest",
          tagText: "Check-in",
          title: "Georgetown Hotel Check-in & Roti Canai",
          subtitle: "Heritage Zone · Chulia Street area",
          note: "Drop bags at the hotel (the Heritage Zone is walkable from most accommodation). For brunch, head to Hameediyah Restaurant on Campbell Street — open since 1907, the oldest nasi kandar restaurant in Penang. The roti canai and mutton curry here are famous. Cash only; queue moves fast.",
          links: [
            { type: "maps", label: "Hameediyah Restaurant", url: "https://maps.google.com/?q=Hameediyah+Restaurant+Penang+Malaysia", priority: "primary" }
          ]
        }
      ],
      afternoon: [
        {
          time: "Afternoon",
          tag: "walk",
          tagText: "Street Art",
          title: "Georgetown Street Art Mural Walk",
          subtitle: "Armenian Street · Lebuh Cannon · Lorong Love",
          note: "The world-famous murals by Lithuanian artist Ernest Zacharevic are scattered across Georgetown's heritage shophouse district. 'Boy on a Bike' (Armenian St / Ah Quee St) and 'Children on a Bicycle' are the most photographed. Download the 'Penang Street Art' map from the George Town World Heritage Inc website. The walk covers about 2.5 km.",
          mapStopLabels: ["Georgetown Heritage Zone"],
          image: {
            url: "https://commons.wikimedia.org/wiki/Special:FilePath/Penang_-_Boy_on_a_Bike.JPG?width=1600",
            alt: "Boy on a Bike mural, Georgetown Penang",
            source_name: "Wikimedia Commons"
          },
          sections: [
            {
              kicker: "Key Murals",
              title: "Must-See",
              points: [
                "Boy on a Bike — Armenian St / Ah Quee St (Zacharevic)",
                "Children on a Bicycle — Muntri St (Zacharevic)",
                "Siblings on a Swing — Cannon Street",
                "The Satirical Steel-Wire Caricatures — scattered on heritage buildings"
              ]
            }
          ],
          links: [
            { type: "web", label: "Art Map", url: "https://gtwhi.com.my", priority: "primary" },
            { type: "maps", label: "Armenian Street", url: "https://maps.google.com/?q=Armenian+Street+Georgetown+Penang", priority: "primary" }
          ]
        },
        {
          time: "Mid-Afternoon",
          tag: "culture",
          tagText: "Heritage",
          title: "Khoo Kongsi Clan Temple",
          subtitle: "Cannon Square · Georgetown",
          note: "Tucked inside a hidden alley off Armenian Street, Khoo Kongsi is one of the most ornate clan temple complexes in Southeast Asia. The main hall's carved roof ridges, gilded panels, and guardian statues took over a decade to complete. Entry RM 10. Spend 30 min exploring the adjacent clan museum. Completely uncrowded after 3 PM.",
          mapStopLabels: ["Khoo Kongsi"],
          sections: [
            {
              kicker: "Highlight",
              title: "Dragon Architecture",
              points: [
                "The roof ridge: two dragons flanking a flaming pearl — best viewed from the courtyard",
                "Open Monday–Friday 9 AM–5 PM, weekends 9 AM–1 PM",
                "Small free museum upstairs shows the clan's immigration history"
              ]
            }
          ],
          links: [
            { type: "maps", label: "Khoo Kongsi", url: "https://maps.google.com/?q=Khoo+Kongsi+Penang+Malaysia", priority: "primary" },
            { type: "web", label: "Official Site", url: "https://www.khookongsi.com.my", priority: "secondary" }
          ]
        },
        {
          time: "Tea Break",
          tag: "culture",
          tagText: "Mansion",
          title: "Cheong Fatt Tze Blue Mansion Exterior Stop",
          subtitle: "Leith Street · Indigo courtyard facade",
          note: "If museum timing works, book the guided Blue Mansion tour; otherwise use it as a short exterior stop while crossing back toward the hotel. The indigo walls and timber shutters show the Straits Eclectic style that makes George Town feel different from Singapore and KL.",
          sections: [
            {
              kicker: "Timing",
              title: "Tour or Exterior",
              points: [
                "Guided tours sell out on busy days; check same-day slots online",
                "Exterior photo stop still works in 10 minutes",
                "Pair with a coffee break on nearby Muntri Street"
              ]
            }
          ],
          links: [
            { type: "web", label: "Blue Mansion", url: "https://www.cheongfatttzemansion.com", priority: "secondary" },
            { type: "maps", label: "Blue Mansion", url: "https://maps.google.com/?q=Cheong+Fatt+Tze+Blue+Mansion+Penang", priority: "primary" }
          ]
        }
      ],
      evening: [
        {
          time: "Evening",
          tag: "food",
          tagText: "Hawker",
          title: "Clan Jetties Sunset & Char Kway Teow",
          subtitle: "Weld Quay · Chew Jetty",
          note: "Walk to the Clan Jetties — wooden walkway settlements over the sea, built by Chinese clan associations in the 19th century. Watch the sunset over the Straits of Malacca. Afterwards, head to Lorong Selamat for the most famous Char Kway Teow in Penang: Sooi Sooi CKT. Cash only, opens ~5 PM, 20–30 min queue is normal.",
          mapStopLabels: ["Clan Jetties"],
          sections: [
            {
              kicker: "Must Eat",
              title: "Penang CKT",
              points: [
                "Sooi Sooi (Lorong Selamat, 5–10 min walk from Clan Jetties)",
                "Order: original CKT with cockles, pork lard, and extra egg",
                "Cash only; queue starts from about 5 PM"
              ]
            }
          ],
          links: [
            { type: "maps", label: "Clan Jetties", url: "https://maps.google.com/?q=Clan+Jetties+Penang", priority: "primary" },
            { type: "maps", label: "Lorong Selamat CKT", url: "https://maps.google.com/?q=Lorong+Selamat+Char+Kway+Teow+Penang", priority: "primary" }
          ]
        },
        {
          time: "Late Evening",
          tag: "food",
          tagText: "Dessert",
          title: "Cendol & Penang Road Famous Teochew Cendol",
          subtitle: "Penang Road · Kedai Kopi Swee Kong",
          note: "Penang Road Famous Teochew Cendol is the definitive cendol in Penang — shaved ice with green jelly, red beans, coconut milk, and thick palm sugar syrup. A single bowl is RM 3.50. They close when they sell out (usually by 9 PM). Alternatively, try the ABC (ais batu campur — shaved ice with toppings) at any nearby stall.",
          links: [
            { type: "maps", label: "Penang Cendol", url: "https://maps.google.com/?q=Penang+Road+Famous+Teochew+Cendol+Malaysia", priority: "primary" }
          ]
        }
      ]
    },
    {
      n: 4,
      date: "12/17",
      city: "Penang",
      areaLabel: "Ayer Itam / Penang Hill",
      title: "Temple at Dusk, Summit at Noon",
      themeLabel: "Faith & Views",
      hero: {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Kek_Lok_Si_at_dusk.jpg/3840px-Kek_Lok_Si_at_dusk.jpg",
        alt: "Kek Lok Si Temple illuminated at dusk, Penang",
        source_name: "Wikimedia Commons",
        reason: "Wikipedia article Kek Lok Si lead photo — dusk illumination of the largest Buddhist temple complex in SE Asia"
      },
      routeOverview: {
        title: "Penang Heights Circuit",
        mode: "car",
        zoom: 13,
        stops: [
          { label: "Kek Lok Si Temple", query: "Kek Lok Si Temple Penang Malaysia", inferred: false },
          { label: "Penang Hill Summit", query: "Penang Hill Bukit Bendera Malaysia", inferred: false },
          { label: "Gurney Drive", query: "Gurney Drive Hawker Centre Penang", inferred: false }
        ]
      },
      morning: [
        {
          time: "Early Morning",
          tag: "food",
          tagText: "Breakfast",
          title: "Georgetown Kopi Breakfast",
          subtitle: "Joo Hooi Café · Penang Road",
          note: "Joo Hooi is one of Georgetown's old-school kopi shops — dark, strong Penang kopi (coffee brewed through a sock filter), kaya toast, and half-boiled eggs. Order the asam laksa here too if they have it early. Tables are shared and turnover is fast. Open from 7 AM. A few doors down, Sin Guat Keong has excellent Lor Mee (thick gravy noodles).",
          links: [
            { type: "maps", label: "Joo Hooi Café", url: "https://maps.google.com/?q=Joo+Hooi+Cafe+Penang+Malaysia", priority: "primary" }
          ]
        },
        {
          time: "Pre-Temple",
          tag: "food",
          tagText: "Market",
          title: "Ayer Itam Market Snack Stop",
          subtitle: "Below Kek Lok Si · Laksa and sugarcane",
          note: "Before climbing into Kek Lok Si, stop at Ayer Itam Market for the famous Penang assam laksa or a cold sugarcane juice. It is practical as well as tasty: toilets, drinks, and shade are easier here than inside the temple complex.",
          links: [
            { type: "maps", label: "Ayer Itam Market", url: "https://maps.google.com/?q=Ayer+Itam+Market+Penang", priority: "primary" }
          ]
        },
        {
          time: "Morning",
          tag: "culture",
          tagText: "Temple",
          title: "Kek Lok Si Temple (极乐寺)",
          subtitle: "Ayer Itam · Largest Buddhist Temple in SE Asia",
          note: "Arrive before 9 AM to beat the midday heat. Climb through the seven-storey Pagoda of Ten Thousand Buddhas (Ban Po Thar), then take the funicular up to the 30 m bronze Goddess of Mercy statue at the summit. The temple is especially beautiful just after dawn and at dusk when the lanterns light up.",
          mapStopLabels: ["Kek Lok Si Temple"],
          image: {
            url: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Kek_Lok_Si_at_dusk.jpg/3840px-Kek_Lok_Si_at_dusk.jpg",
            alt: "Kek Lok Si Temple at dusk",
            source_name: "Wikimedia Commons"
          },
          sections: [
            {
              kicker: "Highlights",
              title: "Don't Miss",
              points: [
                "7-storey pagoda: mixed Chinese, Thai & Burmese architecture",
                "Funicular to bronze Kuan Yin statue (RM 2)",
                "Tortoise sanctuary — release a turtle for good luck (RM 2)"
              ]
            },
            {
              kicker: "Practical",
              title: "Getting There",
              points: [
                "Grab from Georgetown ~15–20 min, RM 15–20",
                "Dress modestly — sarongs available free at entrance",
                "Free entry to most areas; small charge for elevator & funicular"
              ]
            }
          ],
          links: [
            { type: "maps", label: "Google Maps", url: "https://maps.google.com/?q=Kek+Lok+Si+Temple+Penang", priority: "primary" },
            { type: "web", label: "Official Site", url: "https://www.kekloksitemple.com", priority: "secondary" }
          ]
        }
      ],
      afternoon: [
        {
          time: "Afternoon",
          tag: "landmark",
          tagText: "Summit",
          title: "Penang Hill Funicular & Summit",
          subtitle: "Bukit Bendera · 833 m",
          note: "The funicular takes 5 minutes to the summit at 833 m — temperature drops to ~24 °C, a welcome escape from coastal heat. Walk the loop trail past colonial bungalows, the Bellevue Hotel (1920s), and the mossy forest fringe. Heritage Trail viewpoints look north over Butterworth and the Straits.",
          mapStopLabels: ["Penang Hill Summit"],
          image: {
            url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/Penang_Hil%2C_George_Town%2C_Penang_2023.jpg/3840px-Penang_Hil%2C_George_Town%2C_Penang_2023.jpg",
            alt: "Penang Hill panorama looking over George Town",
            source_name: "Wikimedia Commons"
          },
          sections: [
            {
              kicker: "Funicular",
              title: "Tickets & Times",
              steps: [
                { title: "Book online", body: "penanghill.gov.my → e-Ticketing. RM 30 adult return. Pre-booking avoids weekend queues." },
                { title: "Duration", body: "5 min ride each way. Summit loop ~45 min. Last funicular up: 10 PM; down: 11 PM." }
              ]
            }
          ],
          links: [
            { type: "web", label: "Book Tickets", url: "https://www.penanghill.gov.my", priority: "critical" },
            { type: "maps", label: "Google Maps", url: "https://maps.google.com/?q=Penang+Hill+Funicular+Station+Malaysia", priority: "primary" }
          ]
        },
        {
          time: "Mid-Afternoon",
          tag: "garden",
          tagText: "Canopy",
          title: "The Habitat Penang Hill Canopy Walk",
          subtitle: "Curtis Crest · Rainforest canopy",
          note: "If the weather is clear, add The Habitat's canopy walk before descending Penang Hill. Curtis Crest gives a wider island panorama than the main station lookout, and the shaded rainforest trail is a cooler counterpoint to the morning temple climb.",
          sections: [
            {
              kicker: "Decision",
              title: "When to Add It",
              points: [
                "Add if clouds are high and visibility is good",
                "Skip if rain starts; paths get slippery",
                "Allow 60–90 minutes including photo stops"
              ]
            }
          ],
          links: [
            { type: "web", label: "The Habitat", url: "https://thehabitat.my", priority: "secondary" },
            { type: "maps", label: "The Habitat", url: "https://maps.google.com/?q=The+Habitat+Penang+Hill", priority: "primary" }
          ]
        },
        {
          time: "Late Afternoon",
          tag: "walk",
          tagText: "Gallery",
          title: "Pinang Peranakan Mansion",
          subtitle: "Church Street · Georgetown",
          note: "One of the most ornate Peranakan museums in Malaysia — every room is a treasure chest of Victorian tiles, Baba-Nyonya porcelain, and gilded furniture. The mansion belonged to Chung Keng Quee, a 19th-century Penang tycoon. Entry RM 20. Spend 45–60 min inside before heading for dinner.",
          sections: [
            {
              kicker: "Highlights",
              title: "Key Rooms",
              points: [
                "The grand hall: stained glass, gilded pillars, Baba wedding chaises",
                "Kitchen: original coal stoves and Nyonya lacquerware",
                "Bedroom suites: Victorian canopy beds with Peranakan embroidery"
              ]
            }
          ],
          links: [
            { type: "web", label: "Pinang Mansion", url: "https://www.pinangperanakanmansion.com.my", priority: "primary" },
            { type: "maps", label: "Google Maps", url: "https://maps.google.com/?q=Pinang+Peranakan+Mansion+Penang", priority: "primary" }
          ]
        }
      ],
      evening: [
        {
          time: "Evening",
          tag: "food",
          tagText: "Hawker",
          title: "Gurney Drive Hawker Centre",
          subtitle: "Persiaran Gurney · Seafront Promenade",
          note: "One of Penang's most celebrated hawker centres, right on the seafront. Open from 5 PM. Order a wandering course: Asam Laksa (tamarind-sour fish broth — unlike any laksa you've had in KL), Curry Mee, Hokkien Mee, and a cendol for dessert. Tables fill fast — locals share freely.",
          mapStopLabels: ["Gurney Drive"],
          sections: [
            {
              kicker: "Order",
              title: "What to Eat",
              points: [
                "Asam Laksa — Penang's signature (tamarind fish broth, NOT coconut)",
                "Hokkien Mee (Prawn Mee) — thick dark prawn-and-pork ribs broth",
                "Char Koay Kak — fried carrot cake cubes",
                "Cendol — shaved ice + green jelly + red beans + gula melaka"
              ]
            }
          ],
          links: [
            { type: "maps", label: "Gurney Drive", url: "https://maps.google.com/?q=Gurney+Drive+Hawker+Centre+Penang", priority: "primary" }
          ]
        },
        {
          time: "Late Evening",
          tag: "walk",
          tagText: "Night Walk",
          title: "Georgetown Waterfront Night Stroll",
          subtitle: "Weld Quay · Straits of Malacca",
          note: "After dinner, walk back along Weld Quay toward the ferry terminal — at night the Straits are glassy and the old godowns (warehouses) are lit up. The Esplanade park (Padang Kota Lama) has benches facing the sea. A quiet end to a full Penang day.",
          links: [
            { type: "maps", label: "Padang Kota Lama", url: "https://maps.google.com/?q=Padang+Kota+Lama+Penang+Malaysia", priority: "primary" }
          ]
        }
      ]
    },
    {
      n: 5,
      date: "12/18",
      city: "Langkawi",
      areaLabel: "Kuah / Mat Cincang",
      title: "Island Arrival & Sky Walk",
      themeLabel: "Cable Car & Duty-Free",
      hero: {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6c/Eagle_square_at_Kuah_Langkawi.jpg/3840px-Eagle_square_at_Kuah_Langkawi.jpg",
        alt: "Eagle Square (Dataran Lang), Langkawi's landmark giant eagle sculpture",
        source_name: "Wikimedia Commons",
        reason: "Wikipedia article Langkawi lead image — Eagle Square at Kuah Jetty, first landmark when arriving by sea"
      },
      routeOverview: {
        title: "Langkawi Arrival & Hills",
        mode: "car",
        zoom: 11,
        stops: [
          { label: "Penang Ferry Terminal", query: "Swettenham Pier Ferry Terminal Penang Malaysia", inferred: false },
          { label: "Langkawi Jetty", query: "Kuah Jetty Langkawi Malaysia", inferred: false },
          { label: "Langkawi Cable Car", query: "Langkawi SkyCab Oriental Village Gunung Mat Cincang", inferred: false }
        ]
      },
      morning: [
        {
          time: "Morning",
          tag: "transit",
          tagText: "Ferry",
          title: "Ferry Penang → Langkawi",
          subtitle: "Swettenham Pier, Georgetown — 2.5 h crossing",
          note: "Ferries depart from Swettenham Pier at ~8:15 AM and 1:30 PM. The morning departure reaches Langkawi by 11 AM. Book tickets at least a day ahead in December (peak season). Bring a jacket for the air-conditioned lower deck. The upper deck has views of the Straits and, occasionally, dolphins.",
          mapStopLabels: ["Penang Ferry Terminal"],
          links: [
            { type: "web", label: "Langkawi Ferry", url: "https://www.langkawi-ferry.com", priority: "critical" },
            { type: "maps", label: "Swettenham Pier", url: "https://maps.google.com/?q=Swettenham+Pier+Ferry+Terminal+Penang", priority: "primary" }
          ]
        },
        {
          time: "Late Morning",
          tag: "rest",
          tagText: "Arrival",
          title: "Langkawi Arrival & Hotel Check-in",
          subtitle: "Kuah Jetty · Eagle Square",
          note: "Grab from Kuah Jetty to your hotel (~RM 20–35 depending on area). Eagle Square (Dataran Lang) is right by the jetty — a 5-min detour to see the giant eagle statue before heading to the hotel. Stock up on water and snacks at 7-Eleven near the jetty for the afternoon.",
          mapStopLabels: ["Langkawi Jetty"],
          links: [
            { type: "maps", label: "Kuah Jetty", url: "https://maps.google.com/?q=Kuah+Jetty+Langkawi+Malaysia", priority: "primary" }
          ]
        },
        {
          time: "Noon",
          tag: "landmark",
          tagText: "Photo",
          title: "Eagle Square Arrival Photo",
          subtitle: "Dataran Lang · Kuah waterfront",
          note: "Because Eagle Square sits beside Kuah Jetty, do the photo stop before the hotel transfer if bags are manageable. The giant reddish-brown eagle is Langkawi's arrival landmark and works as a quick orientation point before crossing the island toward Cenang or the cable car.",
          sections: [
            {
              kicker: "Quick Stop",
              title: "How Long",
              points: [
                "10–15 minutes is enough for photos",
                "Best light is morning to early afternoon",
                "Skip only if luggage is heavy or rain is starting"
              ]
            }
          ],
          links: [
            { type: "maps", label: "Eagle Square", url: "https://maps.google.com/?q=Eagle+Square+Langkawi", priority: "primary" }
          ]
        }
      ],
      afternoon: [
        {
          time: "Afternoon",
          tag: "landmark",
          tagText: "Sky Walk",
          title: "Langkawi SkyCab Cable Car & SkyBridge",
          subtitle: "Gunung Mat Cincang · Oriental Village",
          note: "One of the steepest cable car rides in the world, rising 700 m to the top of Gunung Mat Cincang. Book online to skip the queue. The SkyBridge — a curved suspension bridge 700 m up — requires a separate short gondola from the top station. Views on a clear day extend across the Andaman Sea to Thailand. Takes 2–3 h total.",
          mapStopLabels: ["Langkawi Cable Car"],
          sections: [
            {
              kicker: "Booking",
              title: "Tickets",
              steps: [
                { title: "SkyCab + SkyBridge", body: "langkawiskycab.com. RM 55 adult cable car; SkyBridge gondola extra RM 10. Online ticket skips the queue." },
                { title: "Best Time", body: "2–3 PM for afternoon light. Clouds often form after 4 PM." }
              ]
            }
          ],
          links: [
            { type: "web", label: "Book SkyCab", url: "https://www.langkawiskycab.com", priority: "critical" },
            { type: "maps", label: "Oriental Village", url: "https://maps.google.com/?q=Oriental+Village+Langkawi+Malaysia", priority: "primary" }
          ]
        },
        {
          time: "Late Afternoon",
          tag: "walk",
          tagText: "Village",
          title: "Oriental Village Browse",
          subtitle: "At the base of the SkyCab",
          note: "The Oriental Village at the cable car base has a small lake, handicraft shops, and the Underwater World Langkawi aquarium nearby. After the cable car, grab a coconut ice cream and walk the short lake loop. It's touristy but pleasant for 30–45 min before dinner.",
          links: [
            { type: "maps", label: "Oriental Village", url: "https://maps.google.com/?q=Oriental+Village+Langkawi", priority: "primary" }
          ]
        },
        {
          time: "Optional",
          tag: "garden",
          tagText: "Waterfall",
          title: "Seven Wells Waterfall Detour",
          subtitle: "Telaga Tujuh · Near SkyCab",
          note: "If legs still feel good after the SkyCab, take the short drive to Seven Wells Waterfall. The lower falls are easy; the upper natural pools require a steep stair climb. Bring sandals with grip and skip the upper pools if the rocks are wet.",
          links: [
            { type: "maps", label: "Seven Wells", url: "https://maps.google.com/?q=Seven+Wells+Waterfall+Langkawi", priority: "primary" }
          ]
        }
      ],
      evening: [
        {
          time: "Evening",
          tag: "food",
          tagText: "Seafood",
          title: "Seafood Dinner at Cenang Beach",
          subtitle: "Pantai Cenang strip",
          note: "Cenang Beach's waterfront restaurants are perfect for a relaxed first-night-on-the-island dinner. Yellow Cafe (Jalan Pantai Cenang) is a reliable, well-priced seafood spot with great butter prawns. Alternatively, explore the small night market stalls along the strip for grilled corn, coconut pancakes, and fresh juice.",
          links: [
            { type: "maps", label: "Pantai Cenang", url: "https://maps.google.com/?q=Pantai+Cenang+Langkawi+Malaysia", priority: "primary" }
          ]
        },
        {
          time: "Late Evening",
          tag: "walk",
          tagText: "Duty-Free",
          title: "Langkawi Duty-Free Shopping",
          subtitle: "Cenang Mall / Billion Supermarket",
          note: "Langkawi is a duty-free island — alcohol, chocolate, and cosmetics are dramatically cheaper than the mainland. Cenang Mall has a good selection of spirits, wine, and confectionery. Toblerone, Cadbury, and Tiger Beer all at mainland-beating prices. Stock up for the rest of the trip.",
          sections: [
            {
              kicker: "Best Buys",
              title: "Duty-Free Picks",
              points: [
                "Whisky / gin: 30–40% cheaper than KL",
                "Toblerone & Cadbury in bulk packs",
                "Perfume & cosmetics at Langkawi Parade or Billion"
              ]
            }
          ],
          links: [
            { type: "maps", label: "Cenang Mall", url: "https://maps.google.com/?q=Cenang+Mall+Langkawi+Malaysia", priority: "primary" }
          ]
        }
      ]
    },
    {
      n: 6,
      date: "12/19",
      city: "Langkawi",
      areaLabel: "Kilim / Tanjung Rhu / Cenang",
      title: "Mangroves, Eagles & the Perfect Beach",
      themeLabel: "Nature Day",
      hero: {
        url: "https://commons.wikimedia.org/wiki/Special:FilePath/Langkawi_Mangrove_Forest.jpg?width=1600",
        alt: "Langkawi mangrove forest, Kilim Karst Geoforest Park",
        source_name: "Wikimedia Commons",
        reason: "Commons file Langkawi Mangrove Forest.jpg — representative image of Kilim Geoforest mangroves"
      },
      routeOverview: {
        title: "North Langkawi Nature Loop",
        mode: "car",
        zoom: 11,
        stops: [
          { label: "Kilim Geoforest Park", query: "Kilim Karst Geoforest Park Langkawi Malaysia", inferred: false },
          { label: "Tanjung Rhu Beach", query: "Tanjung Rhu Beach Langkawi Malaysia", inferred: false },
          { label: "Pantai Cenang", query: "Pantai Cenang Beach Langkawi Malaysia", inferred: false }
        ]
      },
      morning: [
        {
          time: "Early Morning",
          tag: "food",
          tagText: "Breakfast",
          title: "Beach Breakfast at Cenang",
          subtitle: "La Sal or Bon Ton Resort",
          note: "Start with breakfast on the beach. La Sal at Casa del Mar hotel (Jalan Pantai Cenang) has open-air beachfront tables; order the full Malaysian breakfast with nasi lemak. Or pick up fresh coconut and roti from the small open stalls on the beach road that open from 7 AM. A light breakfast is wise before the mangrove boat tour.",
          links: [
            { type: "maps", label: "Cenang Beach", url: "https://maps.google.com/?q=Pantai+Cenang+Langkawi", priority: "primary" }
          ]
        },
        {
          time: "Transfer",
          tag: "transit",
          tagText: "Drive",
          title: "Cenang → Kilim Jetty Drive",
          subtitle: "Cross-island transfer · 35–45 min",
          note: "Pre-book a Grab or driver for the morning because Kilim is far from Cenang and return cars can be sparse after tours. Leave the hotel with water already packed; convenience stores are less common near the jetty than on the beach strip.",
          links: [
            { type: "maps", label: "Kilim Jetty Route", url: "https://maps.google.com/?q=Kilim+Jetty+from+Pantai+Cenang+Langkawi", priority: "primary" }
          ]
        },
        {
          time: "Morning",
          tag: "garden",
          tagText: "Geoforest",
          title: "Kilim Karst Geoforest Boat Tour",
          subtitle: "Kilim Jetty · North Langkawi",
          note: "A private or small-group mangrove boat tour (2–3 h) from Kilim Jetty. You'll see White-bellied Sea Eagles swooping for fish, monitor lizards on tree roots, and ancient mangrove cave systems under the limestone karst. Fish farms and a floating restaurant are on the route. Bring insect repellent and a dry bag.",
          mapStopLabels: ["Kilim Geoforest Park"],
          image: {
            url: "https://commons.wikimedia.org/wiki/Special:FilePath/Langkawi_Mangrove_Forest.jpg?width=1600",
            alt: "Langkawi mangrove forest",
            source_name: "Wikimedia Commons"
          },
          sections: [
            {
              kicker: "Book",
              title: "Tour Options",
              steps: [
                { title: "Private Boat", body: "~RM 200–280 for 2–4 pax, 2–3 h. Arrange via hotel or GetYourGuide." },
                { title: "Bring", body: "Water, sunscreen, insect repellent, dry bag — the boat can splash." }
              ]
            },
            {
              kicker: "Wildlife",
              title: "What to Look For",
              points: [
                "White-bellied Sea Eagles — guide throws fish for dramatic dives",
                "Monitor lizards (Biawak) sunning on mangrove roots",
                "Bats roosting inside limestone cave passages"
              ]
            }
          ],
          links: [
            { type: "web", label: "GetYourGuide", url: "https://www.getyourguide.com/langkawi-l4099/", priority: "primary" },
            { type: "maps", label: "Kilim Jetty", url: "https://maps.google.com/?q=Kilim+Jetty+Langkawi+Malaysia", priority: "primary" }
          ]
        }
      ],
      afternoon: [
        {
          time: "Afternoon",
          tag: "beach",
          tagText: "Beach",
          title: "Tanjung Rhu Beach",
          subtitle: "Northernmost tip of Langkawi",
          note: "Langkawi's most dramatic beach — a long, deserted arc of white sand backed by ancient limestone cliffs and ironwood trees, with views across to uninhabited islands. The water is crystal clear and the beach is essentially empty on weekdays. Bring your own food and water — the nearest shop is 10 min away. Rental car or pre-arranged Grab is needed.",
          mapStopLabels: ["Tanjung Rhu Beach"],
          links: [
            { type: "maps", label: "Tanjung Rhu", url: "https://maps.google.com/?q=Tanjung+Rhu+Beach+Langkawi+Malaysia", priority: "primary" }
          ]
        },
        {
          time: "Late Afternoon",
          tag: "walk",
          tagText: "Coast",
          title: "Black Sand Beach Viewpoint",
          subtitle: "Pantai Pasir Hitam · North coast",
          note: "On the drive back from Tanjung Rhu, stop briefly at Black Sand Beach. The dark mineral-streaked sand is more of a viewpoint than a swimming beach, but it breaks up the long return drive and adds a different texture to the island day.",
          links: [
            { type: "maps", label: "Black Sand Beach", url: "https://maps.google.com/?q=Black+Sand+Beach+Langkawi", priority: "primary" }
          ]
        },
        {
          time: "Late Afternoon",
          tag: "rest",
          tagText: "Unwind",
          title: "Return & Hotel Swim / Rest",
          subtitle: "Hotel pool or Cenang Beach",
          note: "Return to the hotel for a pool afternoon — save energy for the sunset seafood dinner. If your hotel is on Cenang Beach, the beach itself is a perfect afternoon wind-down spot. Aim to be in position for the sunset around 6:30 PM.",
          links: [
            { type: "maps", label: "Pantai Cenang", url: "https://maps.google.com/?q=Pantai+Cenang+Langkawi+Malaysia", priority: "primary" }
          ]
        }
      ],
      evening: [
        {
          time: "Evening",
          tag: "food",
          tagText: "Sunset",
          title: "Pantai Cenang Sunset & Seafood",
          subtitle: "Cenang Beach strip",
          note: "Arrive in time for the sunset (~6:30 PM in December). Warung Tepi Laut and Orkid Ria Seafood are popular spots for grilled fish, butter prawn, and seafood platters at the waterfront table. Order by weight — negotiate the 'market price' before choosing your fish. Expect RM 60–90 for two with drinks.",
          mapStopLabels: ["Pantai Cenang"],
          sections: [
            {
              kicker: "Order",
              title: "Cenang Seafood Picks",
              points: [
                "Grilled stingray (Ikan Pari) in banana leaf — Langkawi signature",
                "Butter prawn — golden-fried in salted butter and curry leaves",
                "Kangkung belacan — morning glory stir-fried with shrimp paste"
              ]
            }
          ],
          links: [
            { type: "maps", label: "Pantai Cenang", url: "https://maps.google.com/?q=Pantai+Cenang+Langkawi+Malaysia", priority: "primary" }
          ]
        },
        {
          time: "Late Evening",
          tag: "rest",
          tagText: "Night Cap",
          title: "Sunset Cocktail at Cenang Beachfront",
          subtitle: "Pantai Cenang bars",
          note: "Cenang's beachfront bars are best in the last light — bare feet in sand, cold drink in hand. Try a coconut mojito or gin-and-tonic made with your duty-free Langkawi gin. No dress code, very relaxed.",
          links: [
            { type: "maps", label: "Cenang Beach Bars", url: "https://maps.google.com/?q=Pantai+Cenang+Beach+Bar+Langkawi", priority: "primary" }
          ]
        }
      ]
    },
    {
      n: 7,
      date: "12/20",
      city: "Kuala Lumpur",
      areaLabel: "KLCC / Bukit Bintang",
      title: "The Twin Towers at Golden Hour",
      themeLabel: "City Arrival",
      hero: {
        url: "https://commons.wikimedia.org/wiki/Special:FilePath/Petronas_Towers_at_Night_-_from_the_base_upwards.jpg?width=1600",
        alt: "Petronas Twin Towers illuminated at night, viewed looking upwards from base",
        source_name: "Wikimedia Commons",
        reason: "Commons file Petronas Towers at Night — dramatic upward perspective of the Twin Towers"
      },
      routeOverview: {
        title: "KLCC to Bukit Bintang",
        mode: "walk",
        zoom: 14,
        stops: [
          { label: "Langkawi Airport", query: "Langkawi International Airport Malaysia", inferred: false },
          { label: "Petronas Twin Towers", query: "Petronas Twin Towers KLCC Kuala Lumpur", inferred: false },
          { label: "KLCC Park", query: "KLCC Park Suria Kuala Lumpur Malaysia", inferred: false },
          { label: "Bukit Bintang", query: "Bukit Bintang Pavilion KL Malaysia", inferred: false }
        ]
      },
      morning: [
        {
          time: "Morning",
          tag: "transit",
          tagText: "Transit",
          title: "Fly Langkawi → Kuala Lumpur",
          subtitle: "Langkawi International → KLIA2",
          note: "AirAsia operates frequent departures. Most land at KLIA2 (~60 km from city). Take the KLIA Ekspres ERL train to KL Sentral (~35 min, RM 55) or a Grab (~RM 70–90). Avoid airport taxi touts who demand fixed high rates.",
          mapStopLabels: ["Langkawi Airport"],
          links: [
            { type: "web", label: "ERL Train", url: "https://www.kliaekspres.com", priority: "primary" },
            { type: "maps", label: "KLIA2 Airport", url: "https://maps.google.com/?q=KLIA2+Terminal+Sepang+Malaysia", priority: "primary" }
          ]
        },
        {
          time: "Arrival",
          tag: "transit",
          tagText: "ERL",
          title: "KLIA2 → KL Sentral Transfer",
          subtitle: "Airport rail or Grab decision",
          note: "Choose KLIA Ekspres if bags are light and traffic is heavy; choose Grab if the hotel is not near an MRT/LRT stop. The airport rail is predictable at 35 minutes to KL Sentral, while a car into Bukit Bintang can take 45–90 minutes depending on rain and traffic.",
          links: [
            { type: "web", label: "KLIA Ekspres", url: "https://www.kliaekspres.com", priority: "primary" },
            { type: "maps", label: "KL Sentral", url: "https://maps.google.com/?q=KL+Sentral+Station+Kuala+Lumpur", priority: "primary" }
          ]
        },
        {
          time: "Late Morning",
          tag: "rest",
          tagText: "Check-in",
          title: "KL Hotel Check-in & Nasi Lemak",
          subtitle: "Bukit Bintang / KLCC area",
          note: "Check in and drop your bags. For lunch, Nasi Lemak is the essential KL midday meal — coconut rice with sambal, peanuts, anchovies, boiled egg, and cucumber. Village Park Restaurant (Damansara Uptown) is the most famous, but for convenience try Nasi Lemak Wanjo in Kampung Baru (~15 min Grab from KLCC), the oldest nasi lemak in KL.",
          links: [
            { type: "maps", label: "Nasi Lemak Wanjo", url: "https://maps.google.com/?q=Nasi+Lemak+Wanjo+Kampung+Baru+Kuala+Lumpur", priority: "primary" }
          ]
        }
      ],
      afternoon: [
        {
          time: "Afternoon",
          tag: "landmark",
          tagText: "Tower",
          title: "Petronas Twin Towers — Skybridge & Observation Deck",
          subtitle: "KLCC · Level 41 Skybridge · Level 86 Deck",
          note: "Buy tickets online — same-day tickets sell out before noon. The Skybridge at Level 41 connects the two towers. The Level 86 observation deck at 370 m has clear-day views to Genting Highlands. After, walk through KLCC Park (free) and loop around Aquaria KLCC.",
          mapStopLabels: ["Petronas Twin Towers"],
          image: {
            url: "https://commons.wikimedia.org/wiki/Special:FilePath/Petronas_Panorama_II.jpg?width=1600",
            alt: "Petronas Twin Towers panoramic view",
            source_name: "Wikimedia Commons"
          },
          sections: [
            {
              kicker: "Booking",
              title: "Tickets",
              steps: [
                { title: "Buy online", body: "petronastwintowers.com.my → Book Tickets. RM 80 adult. Time-slot entry." },
                { title: "Best slot", body: "3–5 PM for daylight views; 6–8 PM for dusk and city lights." }
              ]
            }
          ],
          links: [
            { type: "web", label: "Book Tickets", url: "https://www.petronastwintowers.com.my/visit/tickets", priority: "critical" },
            { type: "maps", label: "Google Maps", url: "https://maps.google.com/?q=Petronas+Twin+Towers+Kuala+Lumpur", priority: "primary" }
          ]
        },
        {
          time: "Late Afternoon",
          tag: "garden",
          tagText: "Park",
          title: "KLCC Park — Lake & Fountain",
          subtitle: "Beneath the Twin Towers",
          note: "The free park beneath the Twin Towers has a jogging path, Symphony Lake (fountains), a children's water park, and the best ground-level angle for the towers. Sit by the lake around 5–6 PM as the towers begin to light up. The Suria KLCC mall is immediately adjacent for air-conditioned respite.",
          mapStopLabels: ["KLCC Park"],
          links: [
            { type: "maps", label: "KLCC Park", url: "https://maps.google.com/?q=KLCC+Park+Kuala+Lumpur+Malaysia", priority: "primary" }
          ]
        },
        {
          time: "Indoor Backup",
          tag: "museum",
          tagText: "Aquaria",
          title: "Aquaria KLCC Rain Backup",
          subtitle: "Convention Centre tunnel · Air-conditioned",
          note: "If afternoon rain hits, Aquaria KLCC is the cleanest backup because it connects to Suria KLCC via covered walkways. It takes about 60–90 minutes, enough to bridge the gap before the evening Bukit Bintang walk without losing the KLCC area.",
          links: [
            { type: "web", label: "Aquaria", url: "https://aquariaklcc.com", priority: "secondary" },
            { type: "maps", label: "Aquaria KLCC", url: "https://maps.google.com/?q=Aquaria+KLCC+Kuala+Lumpur", priority: "primary" }
          ]
        }
      ],
      evening: [
        {
          time: "Evening",
          tag: "food",
          tagText: "Night Market",
          title: "Bukit Bintang Night Walk & Jalan Alor Preview",
          subtitle: "Jalan Bukit Bintang · Pavilion KL",
          note: "Bukit Bintang is KL's neon-lit entertainment and shopping district. Pavilion Mall for high-end; Fahrenheit 88 and Sungei Wang for budget fashion. Walk through to Jalan Alor (parallel street, 5 min) for a preview — return properly tomorrow for a full meal. Tonight, Lot 10 Hutong food court basement is a curated, air-conditioned hawker hall that's worth checking.",
          mapStopLabels: ["Bukit Bintang"],
          links: [
            { type: "maps", label: "Bukit Bintang", url: "https://maps.google.com/?q=Bukit+Bintang+Kuala+Lumpur+Malaysia", priority: "primary" },
            { type: "maps", label: "Lot 10 Hutong", url: "https://maps.google.com/?q=Lot+10+Hutong+Food+Court+Kuala+Lumpur", priority: "secondary" }
          ]
        },
        {
          time: "Late Evening",
          tag: "food",
          tagText: "Dessert",
          title: "Jalan Alor Preview & Coconut Shake",
          subtitle: "Jalan Alor · Bukit Bintang",
          note: "Walk through Jalan Alor tonight for a preview — grab a coconut shake or ABC (ais batu campur shaved ice) to cool down after dinner. You'll be back tomorrow night for the full feast. The stalls are at full swing from 7 PM with grills blazing and red lanterns swaying.",
          links: [
            { type: "maps", label: "Jalan Alor", url: "https://maps.google.com/?q=Jalan+Alor+Kuala+Lumpur+Malaysia", priority: "primary" }
          ]
        }
      ]
    },
    {
      n: 8,
      date: "12/21",
      city: "Kuala Lumpur",
      areaLabel: "Batu Caves / Chinatown / Jalan Alor",
      title: "Golden Stairs & Street Feast",
      themeLabel: "Sacred Sites & Local Food",
      hero: {
        url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Batu_Caves_stairs_2022-05.jpg/3840px-Batu_Caves_stairs_2022-05.jpg",
        alt: "Batu Caves 272 golden stairs with Murugan statue, Kuala Lumpur",
        source_name: "Wikimedia Commons",
        reason: "Wikipedia article Batu Caves lead photo — the 272 golden steps are the defining image of this limestone temple complex"
      },
      routeOverview: {
        title: "KL Sacred & Street Circuit",
        mode: "transit",
        zoom: 12,
        stops: [
          { label: "Batu Caves", query: "Batu Caves Temple Station Gombak Kuala Lumpur", inferred: false },
          { label: "Merdeka Square", query: "Dataran Merdeka Kuala Lumpur Malaysia", inferred: false },
          { label: "Petaling Street", query: "Petaling Street Chinatown Kuala Lumpur", inferred: false },
          { label: "Jalan Alor Food Street", query: "Jalan Alor Food Street Bukit Bintang KL", inferred: false }
        ]
      },
      morning: [
        {
          time: "Early Morning",
          tag: "transit",
          tagText: "KTM Train",
          title: "Early Train to Batu Caves (KTM Komuter)",
          subtitle: "KL Sentral → Batu Caves Station",
          note: "Take the KTM Komuter Batu Caves line from KL Sentral (~30 min, RM 2.60 each way). Trains run every 30 min; the first train is around 6 AM. Aim to arrive at Batu Caves by 8–8:30 AM before the heat builds and crowds peak. Grab a roti canai and teh tarik at the small stalls near the station.",
          links: [
            { type: "maps", label: "KL Sentral KTM", url: "https://maps.google.com/?q=KL+Sentral+Station+Kuala+Lumpur", priority: "primary" }
          ]
        },
        {
          time: "Morning",
          tag: "culture",
          tagText: "Temple",
          title: "Batu Caves — 272 Golden Stairs",
          subtitle: "Gombak · Murugan Statue · Temple Cavern",
          note: "The 272 golden steps lead to a vast limestone cavern sheltering Hindu temples. The 43 m rainbow-painted Lord Murugan statue is the tallest in the world. Temple Cave inside is sacred — remove shoes, dress modestly. Wild macaques are everywhere; secure your bags and do not carry visible food.",
          mapStopLabels: ["Batu Caves"],
          image: {
            url: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/8f/Batu_Caves_stairs_2022-05.jpg/3840px-Batu_Caves_stairs_2022-05.jpg",
            alt: "Batu Caves golden stairs and Murugan statue",
            source_name: "Wikimedia Commons"
          },
          sections: [
            {
              kicker: "Practical",
              title: "At the Temple",
              points: [
                "Free entry — just climb the stairs",
                "Remove shoes inside Temple Cave",
                "Sarongs available at entrance for those in shorts"
              ]
            },
            {
              kicker: "Monkeys",
              title: "Macaque Safety",
              points: [
                "Do not carry food in open bags — they will snatch it",
                "Do not make eye contact or show teeth",
                "They are protected; do not feed or provoke"
              ]
            }
          ],
          links: [
            { type: "maps", label: "Batu Caves Station", url: "https://maps.google.com/?q=Batu+Caves+KTM+Station+Malaysia", priority: "primary" }
          ]
        },
        {
          time: "Late Morning",
          tag: "rest",
          tagText: "Cool Down",
          title: "Coconut Break Below Batu Caves",
          subtitle: "Temple base stalls",
          note: "After descending the stairs, take 20 minutes for a coconut water and shade break before returning to the city. This is the practical reset point: reapply sunscreen, check bags after the monkey zone, and avoid jumping straight into the KTM ride overheated.",
          links: [
            { type: "maps", label: "Batu Caves Stalls", url: "https://maps.google.com/?q=Batu+Caves+food+stalls+Malaysia", priority: "primary" }
          ]
        }
      ],
      afternoon: [
        {
          time: "Afternoon",
          tag: "landmark",
          tagText: "Heritage",
          title: "Merdeka Square & Sultan Abdul Samad Building",
          subtitle: "Dataran Merdeka · Jalan Raja",
          note: "Dataran Merdeka (Independence Square) is where Malaysia's independence was declared in 1957 — the 95 m flagpole stands in front of the colonial Selangor Club (1884). The Sultan Abdul Samad Building opposite is a gorgeous Moorish-colonial landmark best photographed from across the square. 10 min walk to Masjid Jamek, KL's oldest mosque (free entry, remove shoes).",
          mapStopLabels: ["Merdeka Square"],
          sections: [
            {
              kicker: "Nearby",
              title: "Heritage Cluster",
              points: [
                "Sultan Abdul Samad Building: Moorish clock tower, open square for photos",
                "Masjid Jamek: oldest mosque in KL, free, remove shoes",
                "Central Market (Pasar Seni): handicrafts in a restored 1930s Art Deco market hall"
              ]
            }
          ],
          links: [
            { type: "maps", label: "Merdeka Square", url: "https://maps.google.com/?q=Dataran+Merdeka+Kuala+Lumpur+Malaysia", priority: "primary" },
            { type: "maps", label: "Central Market", url: "https://maps.google.com/?q=Central+Market+Kuala+Lumpur+Malaysia", priority: "secondary" }
          ]
        },
        {
          time: "Late Afternoon",
          tag: "walk",
          tagText: "Chinatown",
          title: "Petaling Street Market",
          subtitle: "KL Chinatown · Jalan Petaling",
          note: "KL's most energetic market street — bargain for souvenirs, batik scarves, and sports goods. Do not buy counterfeit watches. The back lanes of Petaling Street (Jalan Balai Polis) have better local food stalls than the main strip. Try the fresh fruit juice (watermelon + carrot, RM 3) and the fresh coconut stalls.",
          mapStopLabels: ["Petaling Street"],
          links: [
            { type: "maps", label: "Petaling Street", url: "https://maps.google.com/?q=Petaling+Street+Kuala+Lumpur+Malaysia", priority: "primary" }
          ]
        },
        {
          time: "Late Afternoon",
          tag: "culture",
          tagText: "Market",
          title: "Central Market & REXKL Pause",
          subtitle: "Pasar Seni · Bookstore and craft stop",
          note: "Use Central Market for air-conditioning and easier souvenir browsing than Petaling Street. If you want a more contemporary stop, walk to REXKL for the bookstore, coffee, and repurposed cinema interior. This makes Chinatown feel layered rather than only market-stall shopping.",
          sections: [
            {
              kicker: "Choose",
              title: "Two Easy Stops",
              points: [
                "Central Market: batik, postcards, pewter, packed local snacks",
                "REXKL: bookstore, coffee, creative market feel",
                "Both are walkable from Pasar Seni MRT"
              ]
            }
          ],
          links: [
            { type: "maps", label: "Central Market", url: "https://maps.google.com/?q=Central+Market+Kuala+Lumpur", priority: "primary" },
            { type: "maps", label: "REXKL", url: "https://maps.google.com/?q=REXKL+Kuala+Lumpur", priority: "secondary" }
          ]
        }
      ],
      evening: [
        {
          time: "Evening",
          tag: "food",
          tagText: "Hawker",
          title: "Jalan Alor — KL's Greatest Hawker Street",
          subtitle: "Jalan Alor · off Bukit Bintang",
          note: "Jalan Alor comes alive after 6 PM — dozens of open-air hawker stalls under red lanterns. The stalls on the left side walking in from Jalan Bukit Bintang are generally better. Must-orders: BBQ chicken wings from Wong Ah Wah, butter prawn, satay, and iced cendol for dessert. Expect RM 50–80 for two with drinks.",
          mapStopLabels: ["Jalan Alor Food Street"],
          sections: [
            {
              kicker: "Must Order",
              title: "Jalan Alor Classics",
              points: [
                "BBQ chicken wings — Wong Ah Wah stall, the most famous",
                "Butter prawn — golden-fried in salted butter and curry leaves",
                "Satay skewers — beef and chicken, with peanut sauce",
                "Cendol — shaved ice + red beans + gula melaka palm sugar"
              ]
            }
          ],
          links: [
            { type: "maps", label: "Jalan Alor", url: "https://maps.google.com/?q=Jalan+Alor+Kuala+Lumpur+Malaysia", priority: "primary" }
          ]
        },
        {
          time: "Late Evening",
          tag: "walk",
          tagText: "Night Walk",
          title: "Bintang Walk & Night Coffee",
          subtitle: "Jalan Bukit Bintang promenade",
          note: "End the night on Jalan Bukit Bintang's pedestrian-friendly stretch — lit-up boutiques, buskers, and street vendors. Catch a last cup of Malaysian kopi at any of the 24-hour mamak stalls (like Marrybrown or the roadside teh tarik trolleys). A roti canai at midnight from a streetside mamak is a quintessential KL experience.",
          links: [
            { type: "maps", label: "Bukit Bintang Walk", url: "https://maps.google.com/?q=Jalan+Bukit+Bintang+Kuala+Lumpur", priority: "primary" }
          ]
        }
      ]
    },
    {
      n: 9,
      date: "12/22",
      city: "Kuala Lumpur",
      areaLabel: "KLCC / Departure",
      title: "Last Morning Stroll & Farewell",
      themeLabel: "Gentle Goodbye",
      hero: {
        url: "https://commons.wikimedia.org/wiki/Special:FilePath/The_Twins_SE_Asia_2019_(49171985716).jpg?width=1600",
        alt: "Petronas Twin Towers seen from KLCC Park, final morning in KL",
        source_name: "Wikimedia Commons",
        reason: "Commons file The Twins SE Asia 2019 — Petronas Twin Towers from KLCC Park, ideal farewell shot"
      },
      routeOverview: {
        title: "Final Morning Circuit",
        mode: "walk",
        zoom: 14,
        stops: [
          { label: "KLCC Park", query: "KLCC Park Suria Kuala Lumpur Malaysia", inferred: false },
          { label: "Suria KLCC", query: "Suria KLCC Mall Kuala Lumpur Malaysia", inferred: false },
          { label: "KL Departure", query: "KLIA2 Kuala Lumpur International Airport Terminal 2", inferred: false }
        ]
      },
      morning: [
        {
          time: "Early Morning",
          tag: "food",
          tagText: "Breakfast",
          title: "Last Teh Tarik — Pelita Nasi Kandar",
          subtitle: "Jalan P Ramlee · Near KLCC",
          note: "Pelita Nasi Kandar on Jalan P Ramlee is open 24 hours — a legendary spot for roti canai, teh tarik, and nasi kandar. Order the roti canai with dhal and a glass of teh tarik (pulled tea with condensed milk, RM 2). Sit outside on the pavement — the last Malaysian breakfast of the trip.",
          links: [
            { type: "maps", label: "Pelita Nasi Kandar", url: "https://maps.google.com/?q=Pelita+Nasi+Kandar+Jalan+P+Ramlee+Kuala+Lumpur", priority: "primary" }
          ]
        },
        {
          time: "Morning",
          tag: "garden",
          tagText: "Park Walk",
          title: "KLCC Park Morning Stroll",
          subtitle: "Symphony Lake · Twin Towers view",
          note: "The park is completely free and magical in the early morning — joggers, families, and just-lit towers. Symphony Lake fountain runs from 8 AM. Walk the full loop (about 20 min) and find the bench directly facing both towers for the final photo. The light is best before 9 AM before haze builds.",
          mapStopLabels: ["KLCC Park"],
          image: {
            url: "https://commons.wikimedia.org/wiki/Special:FilePath/The_Twins_SE_Asia_2019_(49171985716).jpg?width=1600",
            alt: "Petronas Twin Towers from KLCC Park",
            source_name: "Wikimedia Commons"
          },
          links: [
            { type: "maps", label: "KLCC Park", url: "https://maps.google.com/?q=KLCC+Park+Kuala+Lumpur+Malaysia", priority: "primary" }
          ]
        },
        {
          time: "Late Morning",
          tag: "walk",
          tagText: "Shopping",
          title: "Suria KLCC — Last Souvenir Run",
          subtitle: "Suria KLCC Basement / Ground Floor",
          note: "Suria KLCC mall opens at 10 AM. The basement and ground floor have good souvenir options: Metrojaya supermarket (B1) has vacuum-packed nasi lemak spice packets, bak kwa (pork jerky), and local teas at better prices than the airport. Kiehl's and The Body Shop on the ground floor if you need a last cosmetic pick-up.",
          mapStopLabels: ["Suria KLCC"],
          links: [
            { type: "maps", label: "Suria KLCC", url: "https://maps.google.com/?q=Suria+KLCC+Kuala+Lumpur+Malaysia", priority: "primary" }
          ]
        },
        {
          time: "Pre-Checkout",
          tag: "rest",
          tagText: "Pack",
          title: "Hotel Luggage Repack & Checkout Buffer",
          subtitle: "Hotel lobby · receipts and liquids check",
          note: "Before the airport run, repack duty-free liquids, chocolates, and snacks into checked luggage if needed. Keep passports, boarding passes, power banks, and one change of clothes in hand carry. This buffer prevents the last morning from turning into a rushed checkout.",
          links: [
            { type: "maps", label: "KLCC Hotels", url: "https://maps.google.com/?q=KLCC+hotel+Kuala+Lumpur", priority: "primary" }
          ]
        }
      ],
      afternoon: [
        {
          time: "Midday",
          tag: "transit",
          tagText: "Departure",
          title: "Hotel Checkout & KLIA2 Departure",
          subtitle: "ERL Express from KL Sentral → KLIA2",
          note: "Allow 2.5 h before your flight: hotel checkout → KL Sentral by MRT or Grab (~20 min) → KLIA Ekspres to KLIA2 (~35 min, RM 55). Do a last duty-free sweep at KLIA2 — competitive prices on cosmetics, spirits, and chocolates. One last teh tarik at the terminal before boarding.",
          mapStopLabels: ["KL Departure"],
          links: [
            { type: "web", label: "KLIA Ekspres", url: "https://www.kliaekspres.com", priority: "critical" },
            { type: "maps", label: "KLIA2 Terminal", url: "https://maps.google.com/?q=KLIA2+Terminal+Sepang+Malaysia", priority: "primary" }
          ]
        },
        {
          time: "Transfer",
          tag: "transit",
          tagText: "Station",
          title: "KL Sentral Ticket and Platform Buffer",
          subtitle: "ERL gates · 10 min safety margin",
          note: "At KL Sentral, buy or scan ERL tickets before entering the platform area and keep a 10-minute buffer for platform changes. If the KLIA Ekspres is delayed, switch to a Grab only if there are still more than three hours before departure.",
          links: [
            { type: "web", label: "ERL Schedule", url: "https://www.kliaekspres.com/schedule", priority: "secondary" },
            { type: "maps", label: "KL Sentral ERL", url: "https://maps.google.com/?q=KL+Sentral+ERL+Kuala+Lumpur", priority: "primary" }
          ]
        },
        {
          time: "Afternoon",
          tag: "rest",
          tagText: "Lounge",
          title: "KLIA2 Terminal Duty-Free & Lounge",
          subtitle: "Gateway@KLIA2 · Departure Hall",
          note: "KLIA2's Gateway@KLIA2 mall inside the terminal has duty-free worth checking — the gin and whisky selection often beats Cenang. The food court (Level 2) has decent local food at reasonable prices. If you have a Priority Pass or credit card lounge access, the Plaza Premium Lounge on Level 3 is a comfortable retreat before the flight.",
          links: [
            { type: "maps", label: "KLIA2 Terminal", url: "https://maps.google.com/?q=KLIA2+Departure+Hall+Malaysia", priority: "primary" }
          ]
        },
        {
          time: "Departure",
          tag: "transit",
          tagText: "Fly Home",
          title: "Boarding — Until Next Time",
          subtitle: "Gate · KLIA2 Departure Hall",
          note: "Security at KLIA2 is quick with a pre-downloaded boarding pass. One last scan at the duty-free if you have time. Malaysia and Singapore will be waiting next time. Safe flight.",
          links: [
            { type: "maps", label: "KLIA2 Gates", url: "https://maps.google.com/?q=KLIA2+Terminal+Malaysia", priority: "primary" }
          ]
        }
      ],
      evening: []
    }
  ]
};
