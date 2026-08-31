import "dotenv/config";
import { PrismaClient, AccommodationType, UserRole } from "../lib/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// Curated, verified-reachable Unsplash CDN photo ids (nature/mountains/lakes/camping).
// picsum.photos was unreliable in production, so seed images are pinned to these instead.
const PHOTO_POOL = [
  "photo-1506905925346-21bda4d32df4",
  "photo-1469474968028-56623f02e42e",
  "photo-1441974231531-c6227db76b6e",
  "photo-1470071459604-3b5ec3a7fe05",
  "photo-1501785888041-af3ef285b470",
  "photo-1519681393784-d120267933ba",
  "photo-1502082553048-f009c37129b9",
  "photo-1440342359743-84fcb8c21f21",
  "photo-1472214103451-9374bd1c798e",
  "photo-1447752875215-b2761acb3c5d",
  "photo-1500534623283-312aade485b7",
  "photo-1476514525535-07fb3b4ae5f1",
  "photo-1454496522488-7a8e488e8606",
  "photo-1519046904884-53103b34b206",
  "photo-1483728642387-6c3bdd6c93e5",
  "photo-1490750967868-88aa4486c946",
  "photo-1508739773434-c26b3d09e071",
  "photo-1533587851505-d119e13fa0d7",
  "photo-1504280390367-361c6d9f38f4",
  "photo-1518495973542-4542c06a5843",
  "photo-1441716844725-09cedc13a4e7",
  "photo-1445307806294-bff7f67ff225",
  "photo-1523712999610-f77fbcfc3843",
  "photo-1553095066-5014bc7b7f2d",
  "photo-1571687949921-1306bfb24b72",
  "photo-1517824806704-9040b037703b",
];

function hashSeed(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return h;
}

function photoUrl(id: string, w: number, h: number) {
  return `https://images.unsplash.com/${id}?w=${w}&h=${h}&fit=crop`;
}

function img(seed: string, n: number) {
  const start = hashSeed(seed) % PHOTO_POOL.length;
  return Array.from({ length: n }, (_, i) =>
    photoUrl(PHOTO_POOL[(start + i) % PHOTO_POOL.length], 1600, 1000)
  );
}

const AMENITIES = [
  { name: "WiFi", slug: "wifi", icon: "Wifi" },
  { name: "Зогсоол", slug: "parking", icon: "Car" },
  { name: "Ресторан", slug: "restaurant", icon: "UtensilsCrossed" },
  { name: "BBQ", slug: "bbq", icon: "CookingPot" },
  { name: "Саун", slug: "sauna", icon: "Thermometer" },
  { name: "Бассейн", slug: "pool", icon: "Waves" },
  { name: "Хүүхдийн талбай", slug: "playground", icon: "Baby" },
  { name: "Морь унах", slug: "horse-riding", icon: "PawPrint" },
  { name: "Загасчлал", slug: "fishing", icon: "Fish" },
  { name: "Гал түлээ", slug: "campfire", icon: "Flame" },
] as const;

const CATEGORIES = [
  { name: "Амралтын газар", slug: "amraltiin-gazar", icon: "TreePine" },
  { name: "Жуулчны бааз", slug: "juulchnii-baaz", icon: "Tent" },
  { name: "Глэмпинг байр", slug: "glemping", icon: "TentTree" },
] as const;

const LOCATIONS = [
  {
    name: "Горхи-Тэрэлж",
    slug: "gorkhi-terelj",
    province: "Төв аймаг",
    description: "Улаанбаатараас ойрхон, уул толгод, гол горхитой үзэсгэлэнт байгаль.",
    lat: 47.98,
    lng: 107.48,
    featured: true,
  },
  {
    name: "Хөвсгөл",
    slug: "khuvsgul",
    province: "Хөвсгөл аймаг",
    description: "Монголын \"хөх сувд\" хэмээх Хөвсгөл нуур орчмын амралтын газрууд.",
    lat: 51.0,
    lng: 100.5,
    featured: true,
  },
  {
    name: "Богд Хан уул",
    slug: "bogd-khan-uul",
    province: "Улаанбаатар",
    description: "Нийслэлийн өмнөд хэсэгт орших дархан цаазат уул, ойролцоо амралтын газрууд.",
    lat: 47.8,
    lng: 106.95,
    featured: true,
  },
  {
    name: "Зуунмод",
    slug: "zuunmod",
    province: "Төв аймаг",
    description: "Улаанбаатараас 45 км-т орших Төв аймгийн төв, гэр бүлийн амралтын газрууд.",
    lat: 47.7167,
    lng: 106.95,
    featured: true,
  },
  {
    name: "Булган",
    slug: "bulgan",
    province: "Булган аймаг",
    description: "Ой мод, гол мөрөнд баялаг Булган аймгийн байгаль.",
    lat: 48.8125,
    lng: 103.5347,
    featured: true,
  },
  {
    name: "Архангай",
    slug: "arkhangai",
    province: "Архангай аймаг",
    description: "Тэрхийн цагаан нуур, халуун рашаанаараа алдартай Архангай аймаг.",
    lat: 47.4767,
    lng: 101.4544,
    featured: true,
  },
  {
    name: "Өвөрхангай",
    slug: "uvurkhangai",
    province: "Өвөрхангай аймаг",
    description: "Орхоны хөндий, Хархорин орчмын түүхэн дурсгалт газрууд.",
    lat: 46.2667,
    lng: 102.7833,
    featured: true,
  },
] as const;

type ResortSeed = {
  name: string;
  slug: string;
  locationSlug: string;
  categorySlug: string;
  province: string;
  district: string;
  address: string;
  lat: number;
  lng: number;
  distanceFromUbKm: number;
  phone: string;
  description: string;
  amenities: string[];
  featured?: boolean;
  status?: "APPROVED" | "PENDING";
  accommodations: {
    type: keyof typeof AccommodationType;
    name: string;
    capacity: number;
    price: number;
    facilities: string[];
  }[];
};

const RESORTS: ResortSeed[] = [
  {
    name: "Тэрэлж Ресорт",
    slug: "terelj-resort",
    locationSlug: "gorkhi-terelj",
    categorySlug: "amraltiin-gazar",
    province: "Төв аймаг",
    district: "Гачуурт сум",
    address: "Горхи-Тэрэлжийн байгалийн цогцолборт газар",
    lat: 47.985,
    lng: 107.47,
    distanceFromUbKm: 65,
    phone: "+976 9911 2233",
    description:
      "Горхи-Тэрэлжийн байгалийн цогцолборт газарт орших уламжлалт гэр болон тав тухтай зусланг хослуулсан амралтын газар. Хад чулуу, гол, ойн үзэсгэлэнт байгаль дунд амрах боломжтой.",
    amenities: ["wifi", "restaurant", "bbq", "campfire", "horse-riding", "parking"],
    featured: true,
    accommodations: [
      { type: "GER", name: "Монгол гэр", capacity: 4, price: 120000, facilities: ["Зуух", "Ор, дэрний хэрэгсэл"] },
      { type: "FAMILY_HOUSE", name: "Гэр бүлийн байшин", capacity: 6, price: 220000, facilities: ["Угаалгын өрөө", "Гал тогоо"] },
      { type: "VIP_HOUSE", name: "VIP байшин", capacity: 4, price: 380000, facilities: ["Саун", "Тагт", "Халуун ус"] },
    ],
  },
  {
    name: "Горхи Эко Кэмп",
    slug: "gorkhi-eco-camp",
    locationSlug: "gorkhi-terelj",
    categorySlug: "juulchnii-baaz",
    province: "Төв аймаг",
    district: "Эрдэнэ сум",
    address: "Горхийн хөндий",
    lat: 47.95,
    lng: 107.4,
    distanceFromUbKm: 72,
    phone: "+976 9922 3344",
    description: "Байгальд ээлтэй, энгийн зохион байгуулалттай жуулчны бааз. Морь унах, загасчлах боломжтой.",
    amenities: ["campfire", "horse-riding", "fishing", "parking"],
    accommodations: [
      { type: "GER", name: "Стандарт гэр", capacity: 3, price: 85000, facilities: ["Зуух"] },
      { type: "TENT", name: "Майхан", capacity: 2, price: 45000, facilities: ["Унтлагын уут түрээслэх"] },
    ],
  },
  {
    name: "Хөвсгөл Нуур Лодж",
    slug: "khuvsgul-lake-lodge",
    locationSlug: "khuvsgul",
    categorySlug: "amraltiin-gazar",
    province: "Хөвсгөл аймаг",
    district: "Алаг-Эрдэнэ сум",
    address: "Хатгал тосгоны ойролцоо, нуурын эрэг",
    lat: 51.03,
    lng: 100.15,
    distanceFromUbKm: 655,
    phone: "+976 9933 4455",
    description: "Хөвсгөл нуурын эрэг дээр байрлах тансаг зэрэглэлийн амралтын газар. Нуурын үзэмж бүхий VIP байшингууд.",
    amenities: ["restaurant", "wifi", "sauna", "fishing", "parking", "campfire"],
    featured: true,
    accommodations: [
      { type: "GER", name: "Нуурын эрэг гэр", capacity: 4, price: 140000, facilities: ["Нуурын үзэмж", "Зуух"] },
      { type: "VIP_HOUSE", name: "VIP нуурын байшин", capacity: 4, price: 420000, facilities: ["Саун", "Тагт", "Халуун ус"] },
    ],
  },
  {
    name: "Хатгал Нуур Кэмп",
    slug: "khatgal-nuur-camp",
    locationSlug: "khuvsgul",
    categorySlug: "juulchnii-baaz",
    province: "Хөвсгөл аймаг",
    district: "Алаг-Эрдэнэ сум",
    address: "Хатгал тосгон",
    lat: 50.98,
    lng: 100.16,
    distanceFromUbKm: 660,
    phone: "+976 9944 5566",
    description: "Гэр бүлийн амралтад тохиромжтой, нуурын хажууд орших энгийн боловч тав тухтай бааз.",
    amenities: ["fishing", "campfire", "horse-riding", "parking"],
    accommodations: [
      { type: "GER", name: "Гэр", capacity: 4, price: 95000, facilities: ["Зуух"] },
      { type: "FAMILY_HOUSE", name: "Гэр бүлийн байшин", capacity: 6, price: 180000, facilities: ["Гал тогоо"] },
    ],
  },
  {
    name: "Богд Хан Нэйчур Ресорт",
    slug: "bogd-khan-nature-resort",
    locationSlug: "bogd-khan-uul",
    categorySlug: "amraltiin-gazar",
    province: "Улаанбаатар",
    district: "Хан-Уул дүүрэг",
    address: "Богд Хан уулын ар бэл",
    lat: 47.81,
    lng: 106.97,
    distanceFromUbKm: 28,
    phone: "+976 9955 6677",
    description: "Хотоос хамгийн ойр, нэг өдрийн амралтад тохиромжтой гэр бүлийн амралтын газар.",
    amenities: ["playground", "pool", "restaurant", "wifi", "parking"],
    accommodations: [
      { type: "GER", name: "Гэр", capacity: 4, price: 100000, facilities: ["Зуух"] },
      { type: "FAMILY_HOUSE", name: "Гэр бүлийн байшин", capacity: 5, price: 190000, facilities: ["Тагт"] },
    ],
  },
  {
    name: "Зайсан Хилл Ритрит",
    slug: "zaisan-hill-retreat",
    locationSlug: "bogd-khan-uul",
    categorySlug: "amraltiin-gazar",
    province: "Улаанбаатар",
    district: "Хан-Уул дүүрэг",
    address: "Зайсан толгойн урд бэл",
    lat: 47.865,
    lng: 106.93,
    distanceFromUbKm: 15,
    phone: "+976 9966 7788",
    description: "Хотын төвөөс машинаар 20 минутын зайд орших тансаг VIP амралтын газар.",
    amenities: ["sauna", "pool", "restaurant", "wifi", "parking"],
    accommodations: [
      { type: "VIP_HOUSE", name: "VIP байшин", capacity: 4, price: 350000, facilities: ["Саун", "Бассейн"] },
    ],
  },
  {
    name: "Зуунмод Гэр Бүлийн Кэмп",
    slug: "zuunmod-family-camp",
    locationSlug: "zuunmod",
    categorySlug: "amraltiin-gazar",
    province: "Төв аймаг",
    district: "Зуунмод сум",
    address: "Зуунмод хотын захад",
    lat: 47.71,
    lng: 106.94,
    distanceFromUbKm: 45,
    phone: "+976 9977 8899",
    description: "Хямд, хүртээмжтэй үнэтэй, хүүхэдтэй гэр бүлд тохиромжтой амралтын газар.",
    amenities: ["playground", "bbq", "campfire", "parking"],
    accommodations: [
      { type: "GER", name: "Гэр", capacity: 4, price: 70000, facilities: ["Зуух"] },
      { type: "FAMILY_HOUSE", name: "Байшин", capacity: 6, price: 130000, facilities: ["Тоглоомын талбай"] },
    ],
  },
  {
    name: "Булган Гол Лодж",
    slug: "bulgan-river-lodge",
    locationSlug: "bulgan",
    categorySlug: "amraltiin-gazar",
    province: "Булган аймаг",
    district: "Булган сум",
    address: "Сэлэнгэ мөрний хөвөө",
    lat: 48.8,
    lng: 103.53,
    distanceFromUbKm: 305,
    phone: "+976 9988 9900",
    description: "Гол мөрний эрэг дээр орших, загасчлал болон морь унахад тохиромжтой амралтын газар.",
    amenities: ["fishing", "campfire", "horse-riding", "parking", "restaurant"],
    accommodations: [
      { type: "GER", name: "Гэр", capacity: 4, price: 90000, facilities: ["Зуух"] },
      { type: "FAMILY_HOUSE", name: "Байшин", capacity: 6, price: 170000, facilities: ["Гал тогоо"] },
    ],
  },
  {
    name: "Цагаан Нуур Ресорт",
    slug: "tsagaan-nuur-resort",
    locationSlug: "arkhangai",
    categorySlug: "amraltiin-gazar",
    province: "Архангай аймаг",
    district: "Тариат сум",
    address: "Тэрхийн цагаан нуурын эрэг",
    lat: 48.17,
    lng: 99.75,
    distanceFromUbKm: 480,
    phone: "+976 9900 1122",
    description: "Тэрхийн цагаан нуур, Хорго уулын үзэсгэлэнт байгаль дунд орших амралтын газар.",
    amenities: ["restaurant", "wifi", "fishing", "campfire", "horse-riding", "parking"],
    featured: true,
    accommodations: [
      { type: "GER", name: "Нуурын гэр", capacity: 4, price: 110000, facilities: ["Нуурын үзэмж"] },
      { type: "VIP_HOUSE", name: "VIP байшин", capacity: 4, price: 320000, facilities: ["Тагт", "Халуун ус"] },
    ],
  },
  {
    name: "Архангай Рашаан Ресорт",
    slug: "arkhangai-hot-spring-resort",
    locationSlug: "arkhangai",
    categorySlug: "amraltiin-gazar",
    province: "Архангай аймаг",
    district: "Цэнхэр сум",
    address: "Цэнхэрийн халуун рашаан",
    lat: 47.35,
    lng: 101.15,
    distanceFromUbKm: 445,
    phone: "+976 9911 2200",
    description: "Байгалийн халуун рашаан бүхий эрүүл мэндийн амралтын газар.",
    amenities: ["sauna", "pool", "restaurant", "wifi", "parking"],
    accommodations: [
      { type: "FAMILY_HOUSE", name: "Байшин", capacity: 5, price: 200000, facilities: ["Рашаан ус"] },
      { type: "VIP_HOUSE", name: "VIP байшин", capacity: 4, price: 360000, facilities: ["Саун", "Рашаан ус"] },
    ],
  },
  {
    name: "Орхоны Хөндий Кэмп",
    slug: "orkhon-valley-camp",
    locationSlug: "uvurkhangai",
    categorySlug: "juulchnii-baaz",
    province: "Өвөрхангай аймаг",
    district: "Хархорин сум",
    address: "Орхоны хөндий",
    lat: 47.2,
    lng: 102.83,
    distanceFromUbKm: 365,
    phone: "+976 9922 3311",
    description: "Түүхэн дурсгалт Хархорин хотын ойролцоо, нүүдэлчдийн соёлыг мэдрэх боломжтой бааз.",
    amenities: ["horse-riding", "campfire", "restaurant", "parking"],
    accommodations: [
      { type: "GER", name: "Түүхэн загварын гэр", capacity: 4, price: 95000, facilities: ["Зуух"] },
    ],
  },
  {
    name: "Хархорум Херитаж Ресорт",
    slug: "kharkhorum-heritage-resort",
    locationSlug: "uvurkhangai",
    categorySlug: "amraltiin-gazar",
    province: "Өвөрхангай аймаг",
    district: "Хархорин сум",
    address: "Эрдэнэ Зуу хийдийн ойролцоо",
    lat: 47.195,
    lng: 102.82,
    distanceFromUbKm: 370,
    phone: "+976 9933 4400",
    description: "Эрдэнэ Зуу хийдийн ойролцоо орших, түүх соёлын аяллын цэг дэх тав тухтай амралтын газар.",
    amenities: ["wifi", "restaurant", "parking", "bbq"],
    accommodations: [
      { type: "GER", name: "Гэр", capacity: 4, price: 100000, facilities: ["Зуух"] },
      { type: "VIP_HOUSE", name: "VIP байшин", capacity: 4, price: 290000, facilities: ["Тагт"] },
    ],
  },
  {
    name: "Nomad Sky Glamping",
    slug: "nomad-sky-glamping",
    locationSlug: "gorkhi-terelj",
    categorySlug: "glemping",
    province: "Төв аймаг",
    district: "Гачуурт сум",
    address: "Тэрэлжийн үндэсний цэцэрлэгт хүрээлэн",
    lat: 48.0,
    lng: 107.45,
    distanceFromUbKm: 68,
    phone: "+976 9944 3300",
    description: "Тансаг зэрэглэлийн глэмпинг — таны дулаан, тав тухыг хангасан орчин үеийн бүрэн тоноглогдсон майхан байшингууд.",
    amenities: ["wifi", "pool", "sauna", "restaurant", "parking"],
    featured: true,
    accommodations: [
      { type: "VIP_HOUSE", name: "Sky Dome VIP", capacity: 2, price: 550000, facilities: ["Шилэн таазтай", "Тансаг тавилга", "Саун"] },
    ],
  },
  {
    name: "Steppe Budget Camp",
    slug: "steppe-budget-camp",
    locationSlug: "zuunmod",
    categorySlug: "juulchnii-baaz",
    province: "Төв аймаг",
    district: "Зуунмод сум",
    address: "Зуунмодын хөндий",
    lat: 47.68,
    lng: 106.97,
    distanceFromUbKm: 50,
    phone: "+976 9955 4400",
    description: "Хямд өртөгтэй, энгийн зохион байгуулалттай, оюутан залуучуудад тохиромжтой амралтын газар.",
    amenities: ["campfire", "parking"],
    accommodations: [
      { type: "GER", name: "Энгийн гэр", capacity: 4, price: 45000, facilities: ["Зуух"] },
    ],
  },
];

const REVIEW_COMMENTS = [
  "Маш их таалагдсан, дахин ирнэ! Байгаль үзэсгэлэнтэй, үйлчилгээ сайн байлаа.",
  "Гэр цэвэрхэн, тухтай байсан. Хоолны газар сайн байна.",
  "Үнийн хувьд арай өндөр ч гэсэн үйлчилгээ, орчин зохих ёсоор байлаа.",
  "Хүүхэдтэй гэр бүлд маш тохиромжтой газар. Тоглоомын талбай том.",
  "Ажилчид найрсаг, орчин зохион байгуулалт сайтай. Дахин очих болно.",
  "Байршил тун гоё, зам сайн, амарч сэргэх боломж ихтэй.",
];

async function main() {
  console.log("Seeding admin, demo users...");

  const passwordHash = await bcrypt.hash("Password123!", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@amralt.mn" },
    update: {},
    create: {
      email: "admin@amralt.mn",
      name: "Админ",
      password: passwordHash,
      role: UserRole.ADMIN,
    },
  });

  const demoUser = await prisma.user.upsert({
    where: { email: "demo@amralt.mn" },
    update: {},
    create: {
      email: "demo@amralt.mn",
      name: "Сарнай",
      password: passwordHash,
      role: UserRole.USER,
    },
  });

  const reviewerNames = ["Болд", "Оюунаа", "Ганбаяр", "Түмэн", "Энхжин", "Мөнхбат"];
  const reviewers = [];
  for (const rname of reviewerNames) {
    const email = `${rname.toLowerCase()}@example.mn`;
    const u = await prisma.user.upsert({
      where: { email },
      update: {},
      create: { email, name: rname, password: passwordHash, role: UserRole.USER },
    });
    reviewers.push(u);
  }
  const allReviewers = [demoUser, ...reviewers];

  console.log("Seeding categories...");
  const categoryBySlug = new Map<string, { id: string }>();
  for (const c of CATEGORIES) {
    const created = await prisma.category.upsert({
      where: { slug: c.slug },
      update: { name: c.name, icon: c.icon },
      create: c,
    });
    categoryBySlug.set(c.slug, created);
  }

  console.log("Seeding locations...");
  const locationBySlug = new Map<string, { id: string }>();
  for (const l of LOCATIONS) {
    const created = await prisma.location.upsert({
      where: { slug: l.slug },
      update: {
        name: l.name,
        province: l.province,
        description: l.description,
        latitude: l.lat,
        longitude: l.lng,
        featured: l.featured,
        image: photoUrl(PHOTO_POOL[hashSeed(`${l.slug}-cover`) % PHOTO_POOL.length], 1200, 900),
      },
      create: {
        name: l.name,
        slug: l.slug,
        province: l.province,
        description: l.description,
        latitude: l.lat,
        longitude: l.lng,
        featured: l.featured,
        image: photoUrl(PHOTO_POOL[hashSeed(`${l.slug}-cover`) % PHOTO_POOL.length], 1200, 900),
      },
    });
    locationBySlug.set(l.slug, created);
  }

  console.log("Seeding amenities...");
  const amenityBySlug = new Map<string, { id: string }>();
  for (const a of AMENITIES) {
    const created = await prisma.amenity.upsert({
      where: { slug: a.slug },
      update: { name: a.name, icon: a.icon },
      create: a,
    });
    amenityBySlug.set(a.slug, created);
  }

  console.log("Seeding resorts...");
  for (const r of RESORTS) {
    const priceFrom = Math.min(...r.accommodations.map((a) => a.price));
    const location = locationBySlug.get(r.locationSlug)!;
    const category = categoryBySlug.get(r.categorySlug)!;

    const resort = await prisma.resort.upsert({
      where: { slug: r.slug },
      update: {
        name: r.name,
        description: r.description,
        province: r.province,
        district: r.district,
        address: r.address,
        latitude: r.lat,
        longitude: r.lng,
        phone: r.phone,
        priceFrom,
        distanceFromUbKm: r.distanceFromUbKm,
        status: r.status ?? "APPROVED",
        featured: r.featured ?? false,
        categoryId: category.id,
        locationId: location.id,
      },
      create: {
        name: r.name,
        slug: r.slug,
        description: r.description,
        province: r.province,
        district: r.district,
        address: r.address,
        latitude: r.lat,
        longitude: r.lng,
        phone: r.phone,
        priceFrom,
        distanceFromUbKm: r.distanceFromUbKm,
        status: r.status ?? "APPROVED",
        featured: r.featured ?? false,
        categoryId: category.id,
        locationId: location.id,
      },
    });

    // Images
    await prisma.resortImage.deleteMany({ where: { resortId: resort.id } });
    const urls = img(r.slug, 6);
    await prisma.resortImage.createMany({
      data: urls.map((url, i) => ({
        resortId: resort.id,
        url,
        alt: r.name,
        order: i,
        isCover: i === 0,
      })),
    });

    // Amenities
    await prisma.resortAmenity.deleteMany({ where: { resortId: resort.id } });
    for (const slug of r.amenities) {
      const amenity = amenityBySlug.get(slug);
      if (!amenity) continue;
      await prisma.resortAmenity.create({
        data: { resortId: resort.id, amenityId: amenity.id },
      });
    }

    // Accommodations
    await prisma.accommodation.deleteMany({ where: { resortId: resort.id } });
    for (const a of r.accommodations) {
      await prisma.accommodation.create({
        data: {
          resortId: resort.id,
          type: a.type,
          name: a.name,
          capacity: a.capacity,
          price: a.price,
          images: img(`${r.slug}-${a.name}`, 3),
          facilities: a.facilities,
        },
      });
    }

    // Reviews (deterministic pseudo-random subset of reviewers per resort)
    await prisma.review.deleteMany({ where: { resortId: resort.id } });
    const seedNum = r.slug.split("").reduce((acc, ch) => acc + ch.charCodeAt(0), 0);
    const numReviews = 2 + (seedNum % 4); // 2-5 reviews
    const chosenReviewers = allReviewers
      .slice()
      .sort((a, b) => (a.id + r.slug > b.id + r.slug ? 1 : -1))
      .slice(0, numReviews);

    let ratingSum = 0;
    for (let i = 0; i < chosenReviewers.length; i++) {
      const rating = 3 + ((seedNum + i) % 3); // 3-5
      ratingSum += rating;
      await prisma.review.create({
        data: {
          resortId: resort.id,
          userId: chosenReviewers[i].id,
          rating,
          comment: REVIEW_COMMENTS[(seedNum + i) % REVIEW_COMMENTS.length],
        },
      });
    }

    const avgRating = chosenReviewers.length ? ratingSum / chosenReviewers.length : 0;
    await prisma.resort.update({
      where: { id: resort.id },
      data: {
        rating: Math.round(avgRating * 10) / 10,
        reviewCount: chosenReviewers.length,
        viewCount: 50 + (seedNum % 900),
      },
    });

    console.log(`  - ${r.name}`);
  }

  // A couple of favorites for the demo user
  const someResorts = await prisma.resort.findMany({ take: 3 });
  for (const resort of someResorts) {
    await prisma.favorite.upsert({
      where: { userId_resortId: { userId: demoUser.id, resortId: resort.id } },
      update: {},
      create: { userId: demoUser.id, resortId: resort.id },
    });
  }

  console.log("Seed complete.");
  console.log("Login accounts (password: Password123!):");
  console.log("  admin@amralt.mn (admin)");
  console.log("  demo@amralt.mn (regular user)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
