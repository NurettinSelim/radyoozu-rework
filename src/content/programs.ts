export type Program = {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  day: "Pazartesi" | "Salı" | "Çarşamba" | "Perşembe" | "Cuma" | "Cumartesi" | "Pazar";
  startHour: number;
  endHour: number;
  hosts: string[];
  accent: string;
};

export const programs: Program[] = [
  {
    slug: "b-side",
    title: "B-Side",
    tagline: "Benzersiz bir müzik sohbeti.",
    description:
      "Pazartesi akşamlarını müziğin arka yüzüne çeviren yayın. Plakların B yüzleri, unutulmuş parçalar ve keşifler Arda Birkal'ın moderatörlüğünde.",
    day: "Pazartesi",
    startHour: 19,
    endHour: 20,
    hosts: ["Arda Birkal"],
    accent: "from-sky-400/80 to-cyan-400/70",
  },
  {
    slug: "pazartesi-sendromu-old-school",
    title: "Pazartesi Sendromu Old School",
    tagline: "Yılların eskitemediği efsane.",
    description:
      "Doyamadığınız sohbetlerle pazartesi sendromunu dağıtan kadrolu yayın. Eski okul tadında, samimi ve uzun.",
    day: "Pazartesi",
    startHour: 20,
    endHour: 22,
    hosts: [
      "Uğurcan Ayık",
      "Altuğ Karataş",
      "Bilge Kaan Tekin",
      "Mehmet Ali Bahur",
    ],
    accent: "from-amber-400/80 to-orange-500/70",
  },
  {
    slug: "hayali-arkadas",
    title: "Hayali Arkadaş",
    tagline: "Yeni en yakın arkadaşınla tanış.",
    description:
      "Başınızdan geçenleri bir bir anlatacağınız, gerçek yaşam hikayelerinin kapılarını aralayan bir evren. Salı akşamlarının taze sohbeti.",
    day: "Salı",
    startHour: 18,
    endHour: 19,
    hosts: ["Ayselif Kaya", "Betül Bozkurt"],
    accent: "from-violet-400/80 to-fuchsia-500/70",
  },
  {
    slug: "romantik-komedi",
    title: "Romantik Komedi",
    tagline: "Salı akşamlarının vazgeçilmezi.",
    description:
      "Salı akşamlarına gümbür gümbür giren Romantik Komedi, ikinci sezonunda “Yeni Baştan” adıyla sürüyor.",
    day: "Salı",
    startHour: 19,
    endHour: 20,
    hosts: ["Elif Dicle Yılmaz", "Sera Letisya Ustabaşı"],
    accent: "from-rose-400/80 to-pink-500/70",
  },
  {
    slug: "jacket-radio",
    title: "Jacket Radio",
    tagline: "Oyun tutkunlarını bir araya getiren eşsiz konsept.",
    description:
      "Her çarşamba oyun dünyasından haberler, incelemeler ve tartışmalar. Kontrolcüyü eline al, yayın başlıyor.",
    day: "Çarşamba",
    startHour: 19,
    endHour: 20,
    hosts: ["Ali Naci Feyzioğlu"],
    accent: "from-indigo-400/80 to-blue-500/70",
  },
  {
    slug: "neler-oluyor-hayatta",
    title: "Neler Oluyor Hayatta",
    tagline: "Bağımlısı olduğunuz sohbet.",
    description:
      "Gündemden popüler kültüre, kampüs hayatından absürt fikirlere uzanan uzun soluklu çarşamba sohbeti.",
    day: "Çarşamba",
    startHour: 20,
    endHour: 22,
    hosts: ["Simo Açar", "Toprak Avcı", "Ege Dönmez"],
    accent: "from-yellow-400/80 to-amber-500/70",
  },
  {
    slug: "developer-log",
    title: "Developer Log",
    tagline: "Teknoloji tutkunlarını bir araya getiren en yeni yayın.",
    description:
      "Yazılım, donanım, yapay zekâ ve kampüsteki teknik projeler üzerine haftalık notlar. Radyo ÖzÜ'nün taze sesi.",
    day: "Perşembe",
    startHour: 19,
    endHour: 20,
    hosts: ["Selim Özyılmaz"],
    accent: "from-emerald-400/80 to-teal-500/70",
  },
  {
    slug: "yan-komsu",
    title: "Yan Komşu",
    tagline: "Yeni perşembe bağımlılığınız.",
    description:
      "Her hafta sürpriz bir konu, samimi bir moderasyon. Duvara kulak ver, yan komşu başladı.",
    day: "Perşembe",
    startHour: 20,
    endHour: 21,
    hosts: ["Lâl Aker"],
    accent: "from-lime-400/80 to-green-500/70",
  },
];
