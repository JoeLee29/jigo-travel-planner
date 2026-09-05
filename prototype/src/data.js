export const me = {
  id: "maya",
  name: "Maya Chen",
  handle: "@maya.escapes",
  city: "Singapore",
  bio: "Planning less. Wandering more.",
  avatar:
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop",
};

export const people = {
  maya: me,
  ken: {
    id: "ken",
    name: "Ken Ito",
    handle: "@ken.ito",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop",
  },
  aisha: {
    id: "aisha",
    name: "Aisha Rahman",
    handle: "@aisha.r",
    avatar:
      "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&h=200&fit=crop",
  },
  jun: {
    id: "jun",
    name: "Jun Park",
    handle: "@junpark",
    avatar:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&h=200&fit=crop",
  },
  lea: {
    id: "lea",
    name: "Lea Tan",
    handle: "@lea.walks",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop",
  },
};

export const friends = ["ken", "aisha", "jun"];

export const pinTypes = [
  { id: "venue", label: "Venue" },
  { id: "toilet", label: "Toilet" },
  { id: "atm", label: "ATM" },
  { id: "changer", label: "Money changer" },
  { id: "clinic", label: "Clinic" },
  { id: "pharmacy", label: "Pharmacy" },
  { id: "store", label: "Convenience store" },
];

export const initialPins = [
  {
    id: "sensoji",
    type: "venue",
    name: "Senso-ji Temple",
    x: 72,
    y: 28,
    lat: 35.7148,
    lng: 139.7967,
    rating: 4.8,
    likes: 214,
    reviews: 12840,
    source: "Google + in-app",
    note: "Go before 9am. Side streets are quieter.",
    customLabel: "",
  },
  {
    id: "tsukiji",
    type: "venue",
    name: "Tsukiji Outer Market",
    x: 48,
    y: 62,
    lat: 35.6654,
    lng: 139.7707,
    rating: 4.6,
    likes: 176,
    reviews: 9021,
    source: "Google + in-app",
    note: "Tamagoyaki line moves fast after 11.",
    customLabel: "Maya: must-eat",
  },
  {
    id: "teamlab",
    type: "venue",
    name: "teamLab Planets",
    x: 80,
    y: 70,
    lat: 35.6496,
    lng: 139.7898,
    rating: 4.7,
    likes: 301,
    reviews: 22110,
    source: "In-app",
    note: "Book the 16:00 slot. Barefoot rooms.",
    customLabel: "",
  },
  {
    id: "shibuya",
    type: "venue",
    name: "Shibuya Crossing",
    x: 22,
    y: 48,
    lat: 35.6595,
    lng: 139.7004,
    rating: 4.5,
    likes: 98,
    reviews: 54002,
    source: "Google",
    note: "Best sunset light from Magnet rooftop.",
    customLabel: "",
  },
  {
    id: "wc1",
    type: "toilet",
    name: "Public restroom · Asakusa",
    x: 66,
    y: 34,
    lat: 35.7115,
    lng: 139.7948,
    rating: 4.2,
    likes: 12,
    reviews: 88,
    source: "In-app",
    note: "Clean, short queue.",
    customLabel: "",
  },
  {
    id: "atm1",
    type: "atm",
    name: "7 Bank ATM",
    x: 30,
    y: 58,
    lat: 35.658,
    lng: 139.7016,
    rating: 4.4,
    likes: 19,
    reviews: 210,
    source: "Google",
    note: "Accepts most foreign cards.",
    customLabel: "",
  },
  {
    id: "fx1",
    type: "changer",
    name: "Travelex Shinjuku",
    x: 18,
    y: 36,
    lat: 35.6896,
    lng: 139.7006,
    rating: 4.1,
    likes: 8,
    reviews: 64,
    source: "Google",
    note: "Better rate after 2pm.",
    customLabel: "",
  },
  {
    id: "clinic1",
    type: "clinic",
    name: "Tokyo Clinic Minato",
    x: 40,
    y: 78,
    lat: 35.6581,
    lng: 139.7514,
    rating: 4.6,
    likes: 15,
    reviews: 140,
    source: "Google",
    note: "English-speaking. Walk-in until 18:00.",
    customLabel: "",
  },
  {
    id: "pharm1",
    type: "pharmacy",
    name: "Matsumoto Kiyoshi",
    x: 58,
    y: 44,
    lat: 35.6702,
    lng: 139.769,
    rating: 4.5,
    likes: 33,
    reviews: 420,
    source: "In-app",
    note: "Tax-free counter upstairs.",
    customLabel: "",
  },
  {
    id: "store1",
    type: "store",
    name: "FamilyMart · Kaminarimon",
    x: 76,
    y: 40,
    lat: 35.7112,
    lng: 139.7964,
    rating: 4.3,
    likes: 41,
    reviews: 77,
    source: "In-app",
    note: "ATM + onigiri + SIM top-up.",
    customLabel: "Late snack stop",
  },
];

export const pinDetails = {
  sensoji: {
    address: "2-3-1 Asakusa, Taito City, Tokyo",
    hours: "Open now · 6:00–17:00",
    phone: "+81 3-3842-0181",
    reviews: [
      { name: "Aisha Rahman", source: "In-app", rating: 5, time: "2d ago", text: "Empty at 7:40am. Side gate is the move." },
      { name: "Hiro Tanaka", source: "Google", rating: 5, time: "1w ago", text: "Go early. Nakamise gets loud after 10." },
      { name: "Ken Ito", source: "In-app", rating: 4, time: "2w ago", text: "Worth the detour if you skip the main lantern crowd." },
    ],
  },
  tsukiji: {
    address: "4-16-2 Tsukiji, Chuo City, Tokyo",
    hours: "Open now · 5:00–14:00",
    phone: "+81 3-3542-1111",
    reviews: [
      { name: "Ken Ito", source: "In-app", rating: 5, time: "5h ago", text: "Tamagoyaki + scallop. Skip the main lane." },
      { name: "Maya Chen", source: "In-app", rating: 5, time: "Yesterday", text: "Copied this into Day 2 lunch. Line moved fast." },
      { name: "Yuki Sato", source: "Google", rating: 4, time: "3d ago", text: "Cash helps. Outer market is friendlier than the old inner stalls." },
    ],
  },
  teamlab: {
    address: "6-1-16 Toyosu, Koto City, Tokyo",
    hours: "Open now · 9:00–22:00",
    phone: "+81 3-6374-3758",
    reviews: [
      { name: "Jun Park", source: "In-app", rating: 5, time: "Yesterday", text: "Last afternoon slot. Water rooms feel slower." },
      { name: "Aisha Rahman", source: "In-app", rating: 4, time: "4d ago", text: "Book ahead. Lockers are tight if you carry a cabin bag." },
      { name: "Emily Cho", source: "Google", rating: 5, time: "1w ago", text: "Barefoot rooms are the highlight. Towel rental at the door." },
    ],
  },
  shibuya: {
    address: "2-2 Shibuya, Shibuya City, Tokyo",
    hours: "Open 24 hours",
    phone: "",
    reviews: [
      { name: "Jun Park", source: "In-app", rating: 4, time: "3d ago", text: "Magnet rooftop for sunset. Street level is just noise." },
      { name: "Lea Tan", source: "Google", rating: 5, time: "5d ago", text: "Best scramble view from the Starbucks window." },
    ],
  },
  wc1: {
    address: "Kaminarimon-dori, Asakusa, Tokyo",
    hours: "Open now · 7:00–21:00",
    phone: "",
    reviews: [
      { name: "Maya Chen", source: "In-app", rating: 4, time: "1d ago", text: "Clean, short queue. Right off the temple side street." },
      { name: "Local guide", source: "Google", rating: 4, time: "1w ago", text: "Better than the station toilets. Accessible stall at the end." },
    ],
  },
  atm1: {
    address: "Shibuya Center-gai, Tokyo",
    hours: "Open 24 hours",
    phone: "",
    reviews: [
      { name: "Ken Ito", source: "In-app", rating: 5, time: "2d ago", text: "Visa worked. Fee was lower than the airport machines." },
      { name: "Sofia Lim", source: "Google", rating: 4, time: "6d ago", text: "Inside 7-Eleven. English on the screen." },
    ],
  },
  fx1: {
    address: "3-28-12 Shinjuku, Tokyo",
    hours: "Open now · 10:00–19:00",
    phone: "+81 3-5363-3281",
    reviews: [
      { name: "Aisha Rahman", source: "In-app", rating: 4, time: "1w ago", text: "Rate improved after 2pm. Bring your passport." },
      { name: "Mark Ong", source: "Google", rating: 3, time: "2w ago", text: "Fine for small amounts. Compare with 7 Bank first." },
    ],
  },
  clinic1: {
    address: "Minato City, Tokyo",
    hours: "Open now · 9:00–18:00",
    phone: "+81 3-3451-2345",
    reviews: [
      { name: "Maya Chen", source: "In-app", rating: 5, time: "3w ago", text: "English-speaking doctor. Walk-in until 18:00." },
      { name: "Google reviewer", source: "Google", rating: 5, time: "1mo ago", text: "Cash and card. Short wait on a weekday morning." },
    ],
  },
  pharm1: {
    address: "Ginza / Asakusa street level, Tokyo",
    hours: "Open now · 10:00–21:00",
    phone: "",
    reviews: [
      { name: "Jun Park", source: "In-app", rating: 5, time: "4d ago", text: "Tax-free counter upstairs. Staff found a cold patch fast." },
      { name: "Hana Kim", source: "Google", rating: 4, time: "1w ago", text: "Busy but organized. English on most boxes." },
    ],
  },
  store1: {
    address: "Kaminarimon, Asakusa, Tokyo",
    hours: "Open 24 hours",
    phone: "",
    reviews: [
      { name: "Ken Ito", source: "In-app", rating: 4, time: "2d ago", text: "ATM + onigiri + SIM top-up. Late snack stop." },
      { name: "Maya Chen", source: "In-app", rating: 5, time: "5d ago", text: "Open after temple close. Hot can coffee machine works." },
    ],
  },
};

export function detailsFor(pin) {
  return (
    pinDetails[pin.id] || {
      address: pin.name,
      hours: "Hours not listed",
      phone: "",
      reviews: pin.note
        ? [{ name: "You", source: "In-app", rating: pin.rating || 4, time: "Just added", text: pin.note }]
        : [],
    }
  );
}

export const searchHints = [
  "quiet cafe near Senso-ji",
  "ATM that takes Visa",
  "late night convenience store",
  "pharmacy open now",
  "public toilet Asakusa",
  "onsen under ¥2000",
  "rainy day indoor plan",
];

export const initialPosts = [
  {
    id: "p1",
    author: "aisha",
    place: "Senso-ji Temple",
    pinId: "sensoji",
    time: "2h ago",
    photo:
      "https://images.unsplash.com/photo-1526481280693-3bfa7568e0f3?w=900&h=1100&fit=crop",
    text: "Empty lantern street at 7:40am. If you only copy one stop into the Tokyo plan, make it this hour.",
    likes: 128,
    liked: false,
    comments: [
      { id: "c1", author: "ken", text: "Saving this. Can we do sunrise day 1?" },
      { id: "c2", author: "jun", text: "Pinned. Also grab ningyo-yaki after." },
    ],
  },
  {
    id: "p2",
    author: "ken",
    place: "Tsukiji Outer Market",
    pinId: "tsukiji",
    time: "5h ago",
    photo:
      "https://images.unsplash.com/photo-1553621042-f6e147245754?w=900&h=1100&fit=crop",
    text: "Tamagoyaki + grilled scallop. ¥1,800 for two if you skip the main lane.",
    likes: 86,
    liked: true,
    comments: [{ id: "c3", author: "maya", text: "Copying this into Day 2 lunch." }],
  },
  {
    id: "p3",
    author: "jun",
    place: "teamLab Planets",
    pinId: "teamlab",
    time: "Yesterday",
    photo:
      "https://images.unsplash.com/photo-1542051841857-5f90071b3753?w=900&h=1100&fit=crop",
    text: "Book the last afternoon slot. Crowds thin and the water rooms feel slower.",
    likes: 201,
    liked: false,
    comments: [],
  },
];

export const initialTrips = [
  {
    id: "tokyo",
    name: "Tokyo Spring 2026",
    city: "Tokyo",
    dates: "18–24 Apr",
    cover:
      "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=800&h=500&fit=crop",
    members: ["maya", "ken", "aisha", "jun"],
    days: ["18 Apr", "19 Apr", "20 Apr", "21 Apr"],
  },
  {
    id: "bali",
    name: "Solo Bali reset",
    city: "Ubud",
    dates: "Aug · draft",
    cover:
      "https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&h=500&fit=crop",
    members: ["maya"],
    days: ["Day 1", "Day 2", "Day 3"],
  },
];

export const initialPlan = {
  tokyo: {
    "18 Apr": [
      {
        id: "q1",
        time: "08:30",
        title: "Senso-ji Temple",
        pinId: "sensoji",
        rating: 4.8,
        note: "Enter from the side street",
      },
      {
        id: "q2",
        time: "10:15",
        title: "Nakamise snacks",
        pinId: "store1",
        rating: 4.3,
        note: "Ningyo-yaki only",
      },
      {
        id: "q3",
        time: "12:30",
        title: "Tsukiji Outer Market",
        pinId: "tsukiji",
        rating: 4.6,
        note: "Split lunch",
      },
      {
        id: "q4",
        time: "16:00",
        title: "teamLab Planets",
        pinId: "teamlab",
        rating: 4.7,
        note: "Tickets already held",
      },
    ],
    "19 Apr": [
      {
        id: "q5",
        time: "09:00",
        title: "Shibuya Crossing",
        pinId: "shibuya",
        rating: 4.5,
        note: "Magnet rooftop first",
      },
    ],
    "20 Apr": [],
    "21 Apr": [],
  },
  bali: {
    "Day 1": [
      {
        id: "b1",
        time: "11:00",
        title: "Tegalalang rice terrace",
        pinId: null,
        rating: 4.6,
        note: "Go early",
      },
    ],
    "Day 2": [],
    "Day 3": [],
  },
};

export const initialBudgets = {
  tokyo: {
    maya: { ideal: 1200, actual: 486 },
    ken: { ideal: 900, actual: 310 },
    aisha: { ideal: 1100, actual: 255 },
    jun: { ideal: 800, actual: 190 },
  },
  bali: {
    maya: { ideal: 700, actual: 0 },
  },
};

export const initialExpenses = [
  {
    id: "e1",
    tripId: "tokyo",
    title: "Narita Express",
    amount: 96,
    payer: "maya",
    split: ["maya", "ken", "aisha", "jun"],
    time: "Just now",
    live: true,
  },
  {
    id: "e2",
    tripId: "tokyo",
    title: "Asakusa breakfast",
    amount: 42,
    payer: "ken",
    split: ["maya", "ken"],
    time: "08:55",
    live: false,
  },
  {
    id: "e3",
    tripId: "tokyo",
    title: "teamLab tickets",
    amount: 128,
    payer: "aisha",
    split: ["maya", "ken", "aisha", "jun"],
    time: "Yesterday",
    live: false,
  },
];

export const initialMessages = {
  tokyo: [
    {
      id: "m1",
      author: "aisha",
      text: "Flight NH812 is showing +2h. Should we push teamLab?",
      time: "21:14",
      kind: "text",
    },
    {
      id: "m2",
      author: "ken",
      text: "I can move lunch. Sharing my pin from the station.",
      time: "21:16",
      kind: "location",
      place: "Keisei Ueno Station",
    },
    {
      id: "m3",
      author: "jun",
      text: "Album started: Day 0 arrivals.",
      time: "21:18",
      kind: "album",
      album: "Day 0 arrivals",
    },
    {
      id: "m4",
      author: "maya",
      text: "Keep Senso-ji. I’ll ask JIGo to slide the afternoon.",
      time: "21:20",
      kind: "text",
    },
    {
      id: "m5",
      author: "aisha",
      text: "Tickets still hold if we take the 18:30 last entry.",
      time: "21:22",
      kind: "text",
    },
    {
      id: "m6",
      author: "ken",
      text: "Photo from the platform. Train is packed but moving.",
      time: "21:25",
      kind: "photo",
    },
    {
      id: "m7",
      author: "jun",
      text: "Dropping JR pass.pdf here so nobody hunts for it tomorrow.",
      time: "21:27",
      kind: "doc",
    },
  ],
  bali: [
    {
      id: "b1",
      author: "maya",
      text: "Solo notes for Ubud. Keep this thread quiet — just for me.",
      time: "Draft",
      kind: "text",
    },
    {
      id: "b2",
      author: "maya",
      text: "Rice terrace first. Then a slow lunch, no group votes.",
      time: "Draft",
      kind: "text",
    },
  ],
};

export const initialAlbums = [
  {
    id: "al1",
    name: "Day 0 arrivals",
    count: 12,
    cover:
      "https://images.unsplash.com/photo-1493976040374-69d76b17df46?w=400&h=400&fit=crop",
  },
  {
    id: "al2",
    name: "Food we actually liked",
    count: 8,
    cover:
      "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400&h=400&fit=crop",
  },
];

export const aiReplies = [
  {
    match: /delay|replan|flight|nh812/i,
    text: "NH812 is +2h. I slid Day 1: keep Senso-ji (it stays open), move Tsukiji to 14:00, and shift teamLab to the 18:30 last entry. Budget impact: +¥0 if we keep the same tickets. Want me to write this into the plan queue?",
  },
  {
    match: /budget|cheap|under/i,
    text: "3 days in Tokyo at about USD 800/person: 1 signature ticket (teamLab), 2 market meals, 1 neighbourhood walk day, convenience-store breakfasts. I can draft that into Solo Bali style if you want a cheaper template.",
  },
  {
    match: /split|bill|cost/i,
    text: "Open Budget → Split bill. Equal split is fastest for transit and tickets. Use shares when someone sits out drinks. Actuals update the moment you confirm — everyone sees it in the live feed.",
  },
  {
    match: /prefer|group|sync/i,
    text: "Ken wants food-first, Aisha wants museums, Jun wants nightlife, you want slow mornings. Overlap: Asakusa morning + one paid indoor + one free night walk. I can lock that as the group spine.",
  },
];
