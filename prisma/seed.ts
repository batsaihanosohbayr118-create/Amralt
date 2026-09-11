import "dotenv/config";
import { PrismaClient, UserRole } from "../lib/generated/prisma/client";
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
    nameEn: "Gorkhi-Terelj",
    nameZh: "戈尔希-特勒尔吉",
    slug: "gorkhi-terelj",
    province: "Төв аймаг",
    description: "Улаанбаатараас ойрхон, уул толгод, гол горхитой үзэсгэлэнт байгаль.",
    descriptionEn: "Beautiful nature close to Ulaanbaatar, with mountains, hills, and rivers.",
    descriptionZh: "毗邻乌兰巴托，拥有群山、丘陵与河流的秀丽自然风光。",
    lat: 47.98,
    lng: 107.48,
    featured: true,
  },
  {
    name: "Хөвсгөл",
    nameEn: "Khuvsgul",
    nameZh: "库苏古尔",
    slug: "khuvsgul",
    province: "Хөвсгөл аймаг",
    description: "Монголын \"хөх сувд\" хэмээх Хөвсгөл нуур орчмын амралтын газрууд.",
    descriptionEn: "Resorts around Lake Khuvsgul, known as Mongolia's \"blue pearl.\"",
    descriptionZh: "环绕蒙古\"蓝色珍珠\"库苏古尔湖的度假胜地。",
    lat: 51.0,
    lng: 100.5,
    featured: true,
  },
  {
    name: "Богд Хан уул",
    nameEn: "Bogd Khan Mountain",
    nameZh: "博格达汗山",
    slug: "bogd-khan-uul",
    province: "Улаанбаатар",
    description: "Нийслэлийн өмнөд хэсэгт орших дархан цаазат уул, ойролцоо амралтын газрууд.",
    descriptionEn: "A protected mountain south of the capital, with resorts nearby.",
    descriptionZh: "位于首都南部的自然保护山区，周边分布着多家度假村。",
    lat: 47.8,
    lng: 106.95,
    featured: true,
  },
  {
    name: "Зуунмод",
    nameEn: "Zuunmod",
    nameZh: "宗毛德",
    slug: "zuunmod",
    province: "Төв аймаг",
    description: "Улаанбаатараас 45 км-т орших Төв аймгийн төв, гэр бүлийн амралтын газрууд.",
    descriptionEn: "The capital of Töv province, 45 km from Ulaanbaatar, with family-friendly resorts.",
    descriptionZh: "距乌兰巴托45公里的中央省省会，拥有多家适合家庭的度假村。",
    lat: 47.7167,
    lng: 106.95,
    featured: true,
  },
  {
    name: "Булган",
    nameEn: "Bulgan",
    nameZh: "布尔干",
    slug: "bulgan",
    province: "Булган аймаг",
    description: "Ой мод, гол мөрөнд баялаг Булган аймгийн байгаль.",
    descriptionEn: "Bulgan province's nature, rich in forests and rivers.",
    descriptionZh: "布尔干省的自然风光，森林与河流资源丰富。",
    lat: 48.8125,
    lng: 103.5347,
    featured: true,
  },
  {
    name: "Архангай",
    nameEn: "Arkhangai",
    nameZh: "杭爱",
    slug: "arkhangai",
    province: "Архангай аймаг",
    description: "Тэрхийн цагаан нуур, халуун рашаанаараа алдартай Архангай аймаг.",
    descriptionEn: "Arkhangai province, famous for White Lake (Terkhiin Tsagaan Lake) and its hot springs.",
    descriptionZh: "以特日欣查干湖（白湖）和温泉闻名的杭爱省。",
    lat: 47.4767,
    lng: 101.4544,
    featured: true,
  },
  {
    name: "Өвөрхангай",
    nameEn: "Uvurkhangai",
    nameZh: "后杭爱",
    slug: "uvurkhangai",
    province: "Өвөрхангай аймаг",
    description: "Орхоны хөндий, Хархорин орчмын түүхэн дурсгалт газрууд.",
    descriptionEn: "Historic sites around the Orkhon Valley and Kharkhorin.",
    descriptionZh: "鄂尔浑河谷与哈拉和林周边的历史古迹。",
    lat: 46.2667,
    lng: 102.7833,
    featured: true,
  },
] as const;

// Real resort listings supplied directly by the site owner (name/location/province/
// phone/rating as given; unknown fields are intentionally left unset rather than
// invented — see the priceFrom === 0 / rating === 0 handling throughout the app).
type RealResortSeed = {
  name: string;
  nameEn?: string;
  slug: string;
  locationSlug?: string;
  categorySlug: string;
  province: string;
  district: string;
  address: string;
  lat: number;
  lng: number;
  phone: string | null;
  rating: number | null;
  price: number | null;
  description: string;
  amenitySlugs?: string[];
};

// Approximate coordinates per real-world area (exact per-resort coordinates were not
// supplied). A small deterministic jitter is added per resort so markers don't stack.
const AREA_CENTER: Record<string, { lat: number; lng: number }> = {
  "gorkhi-terelj": { lat: 47.98, lng: 107.48 },
  gachuurt: { lat: 47.95, lng: 107.23 },
  "tsonjin-boldog": { lat: 47.933, lng: 107.795 },
  ulaanbaatar: { lat: 47.9184, lng: 106.9177 },
  arkhust: { lat: 47.717, lng: 107.417 },
};

function jitter(seed: string, center: { lat: number; lng: number }) {
  const h = hashSeed(seed);
  const dLat = (((h % 1000) / 1000) - 0.5) * 0.06;
  const dLng = ((((h >> 10) % 1000) / 1000) - 0.5) * 0.06;
  return { lat: center.lat + dLat, lng: center.lng + dLng };
}

const REAL_RESORTS: RealResortSeed[] = [
  {
    name: "Terelj Luxury Hotel",
    slug: "terelj-luxury-hotel",
    locationSlug: "gorkhi-terelj",
    categorySlug: "amraltiin-gazar",
    province: "Улаанбаатар",
    district: "Горхи-Тэрэлж",
    address: "Горхи-Тэрэлж орчим",
    ...jitter("terelj-luxury-hotel", AREA_CENTER["gorkhi-terelj"]),
    phone: "+976 9999 2233",
    rating: 4.4,
    price: null,
    description: "Горхи-Тэрэлж орчимд байрлах зочид буудал, амралтын газар.",
  },
  {
    name: "Juulchin Terelj Resort",
    slug: "juulchin-terelj-resort",
    locationSlug: "gorkhi-terelj",
    categorySlug: "amraltiin-gazar",
    province: "Улаанбаатар",
    district: "Горхи-Тэрэлж",
    address: "Горхи-Тэрэлж орчим",
    ...jitter("juulchin-terelj-resort", AREA_CENTER["gorkhi-terelj"]),
    phone: "+976 9433 1212",
    rating: 4.4,
    price: null,
    description: "Горхи-Тэрэлжид байрлах Жуулчин группын амралтын газар.",
  },
  {
    name: "Terelj Star Resort",
    slug: "terelj-star-resort",
    locationSlug: "gorkhi-terelj",
    categorySlug: "amraltiin-gazar",
    province: "Улаанбаатар",
    district: "Горхи-Тэрэлж",
    address: "Горхи-Тэрэлж орчим",
    ...jitter("terelj-star-resort", AREA_CENTER["gorkhi-terelj"]),
    phone: "+976 9588 3330",
    rating: 4.4,
    price: 450000,
    description: "Горхи-Тэрэлж дэх амралтын газар.",
  },
  {
    name: "Red Rock Resort, Mongolia",
    slug: "red-rock-resort",
    locationSlug: "gorkhi-terelj",
    categorySlug: "amraltiin-gazar",
    province: "Улаанбаатар",
    district: "Горхи-Тэрэлж",
    address: "Горхи-Тэрэлж орчим",
    lat: 47.85099949593331, // verified via Google Maps
    lng: 107.40412083439112,
    phone: "+976 7700 0111",
    rating: 4.2,
    price: null,
    description: "Горхи-Тэрэлж орчимд байрлах амралтын газар.",
  },
  {
    name: "Blue Spot Resort",
    slug: "blue-spot-resort",
    locationSlug: "gorkhi-terelj",
    categorySlug: "amraltiin-gazar",
    province: "Улаанбаатар",
    district: "Горхи-Тэрэлж",
    address: "Горхи-Тэрэлж орчим",
    ...jitter("blue-spot-resort", AREA_CENTER["gorkhi-terelj"]),
    phone: "+976 8627 4747",
    rating: 4.6,
    price: null,
    description: "Горхи-Тэрэлж дэх амралтын газар.",
  },
  {
    name: "Imperial Mount Resort",
    slug: "imperial-mount-resort",
    locationSlug: "gorkhi-terelj",
    categorySlug: "amraltiin-gazar",
    province: "Улаанбаатар",
    district: "Горхи-Тэрэлж",
    address: "Горхи-Тэрэлж орчим",
    ...jitter("imperial-mount-resort", AREA_CENTER["gorkhi-terelj"]),
    phone: "+976 7588 7733",
    rating: 4.1,
    price: null,
    description: "Горхи-Тэрэлж орчимд байрлах уулын амралтын газар.",
  },
  {
    name: "Ekh Terelj Family Resort",
    slug: "ekh-terelj-family-resort",
    locationSlug: "gorkhi-terelj",
    categorySlug: "amraltiin-gazar",
    province: "Улаанбаатар",
    district: "Горхи-Тэрэлж",
    address: "Горхи-Тэрэлж орчим",
    ...jitter("ekh-terelj-family-resort", AREA_CENTER["gorkhi-terelj"]),
    phone: "+976 8801 0003",
    rating: 4.6,
    price: null,
    description: "Гэр бүлд тохиромжтой, Горхи-Тэрэлж дэх амралтын газар.",
  },
  {
    name: "Bayalag Resort",
    slug: "bayalag-resort",
    locationSlug: "gorkhi-terelj",
    categorySlug: "amraltiin-gazar",
    province: "Улаанбаатар",
    district: "Горхи-Тэрэлж",
    address: "Горхи-Тэрэлж орчим",
    ...jitter("bayalag-resort", AREA_CENTER["gorkhi-terelj"]),
    phone: null,
    rating: 4.5,
    price: null,
    description: "Горхи-Тэрэлж дэх амралтын газар.",
  },
  {
    name: "Terelj Resort",
    nameEn: "Terelj Resort",
    slug: "terelj-resort-2",
    locationSlug: "gorkhi-terelj",
    categorySlug: "amraltiin-gazar",
    province: "Улаанбаатар",
    district: "Горхи-Тэрэлж",
    address: "Горхи-Тэрэлж орчим",
    ...jitter("terelj-resort-2", AREA_CENTER["gorkhi-terelj"]),
    phone: "+976 7755 5115",
    rating: 4.2,
    price: 185000,
    description: "Горхи-Тэрэлж орчимд байрлах амралтын газар.",
  },
  {
    name: "Bugat Resort",
    slug: "bugat-resort",
    locationSlug: "gorkhi-terelj",
    categorySlug: "amraltiin-gazar",
    province: "Төв аймаг",
    district: "Тэрэлж",
    address: "Тэрэлж орчим",
    ...jitter("bugat-resort", AREA_CENTER["gorkhi-terelj"]),
    phone: "+976 7707 7555",
    rating: 4.6,
    price: null,
    description: "Тэрэлж орчимд байрлах амралтын газар.",
  },
  {
    name: "Оршил Resort",
    nameEn: "Orshil Resort",
    slug: "orshil-resort",
    categorySlug: "amraltiin-gazar",
    province: "Улаанбаатар",
    district: "Гачуурт",
    address: "Гачуурт орчим",
    ...jitter("orshil-resort", AREA_CENTER.gachuurt),
    phone: null,
    rating: null,
    price: 80000,
    description: "Гачуурт тосгонд байрлах амралтын газар.",
  },
  {
    name: "Шинэ Монгол",
    nameEn: "New Mongolia",
    slug: "shine-mongol",
    categorySlug: "amraltiin-gazar",
    province: "Улаанбаатар",
    district: "Гачуурт",
    address: "Гачуурт орчим",
    ...jitter("shine-mongol", AREA_CENTER.gachuurt),
    phone: "+976 9919 0613",
    rating: null,
    price: 80000,
    description: "Гачуурт дэх амралтын газар.",
  },
  {
    name: "Gobi Deluxe Hotel and Resort",
    slug: "gobi-deluxe-hotel-resort",
    categorySlug: "amraltiin-gazar",
    province: "Улаанбаатар",
    district: "Гачуурт",
    address: "Гачуурт орчим",
    ...jitter("gobi-deluxe-hotel-resort", AREA_CENTER.gachuurt),
    phone: "+976 8809 0814",
    rating: 3.9,
    price: null,
    description: "Гачуурт дэх зочид буудал, амралтын газар.",
  },
  {
    name: "Монгол Шилтгээн",
    nameEn: "Mongolian Castle",
    slug: "mongol-shiltgeen",
    categorySlug: "amraltiin-gazar",
    province: "Улаанбаатар",
    district: "Гачуурт",
    address: "Гачуурт орчим",
    ...jitter("mongol-shiltgeen", AREA_CENTER.gachuurt),
    phone: null,
    rating: null,
    price: null,
    description: "Гачуурт дэх амралтын газар.",
  },
  {
    name: "Харгиа Амралт",
    nameEn: "Khargia Resort",
    slug: "khargia-amralt",
    categorySlug: "amraltiin-gazar",
    province: "Улаанбаатар",
    district: "Гачуурт",
    address: "Гачуурт орчим",
    ...jitter("khargia-amralt", AREA_CENTER.gachuurt),
    phone: null,
    rating: null,
    price: 70000,
    description: "Гачуурт дэх амралтын газар.",
  },
  {
    name: "Bayan Mongolian Resort",
    slug: "bayan-mongolian-resort",
    categorySlug: "amraltiin-gazar",
    province: "Төв аймаг",
    district: "Цонжин болдог",
    address: "Цонжин болдог орчим",
    ...jitter("bayan-mongolian-resort", AREA_CENTER["tsonjin-boldog"]),
    phone: "+976 9590 9220",
    rating: 4.3,
    price: null,
    description: "Цонжин болдог орчимд байрлах амралтын газар.",
  },
  {
    name: "Jargalant Resort",
    slug: "jargalant-resort",
    categorySlug: "amraltiin-gazar",
    province: "Улаанбаатар",
    district: "Улаанбаатар",
    address: "Улаанбаатар хотын орчим",
    ...jitter("jargalant-resort", AREA_CENTER.ulaanbaatar),
    phone: null,
    rating: 4.4,
    price: null,
    description: "Улаанбаатар хотын орчимд байрлах амралтын газар.",
  },
  {
    name: "Hunnu Camp",
    slug: "hunnu-camp",
    categorySlug: "juulchnii-baaz",
    province: "Улаанбаатар",
    district: "Архуст",
    address: "Архуст сум орчим",
    ...jitter("hunnu-camp", AREA_CENTER.arkhust),
    phone: "+976 7000 6989",
    rating: 4.2,
    price: null,
    description: "Архуст сум дахь жуулчны бааз.",
  },
  {
    name: "Ар гурван сайхан",
    nameEn: "Ar Gurvan Saikhan",
    slug: "ar-gurvan-saikhan",
    locationSlug: "gorkhi-terelj",
    categorySlug: "amraltiin-gazar",
    province: "Улаанбаатар",
    district: "Горхи-Тэрэлж",
    address: "Горхи-Тэрэлж орчим",
    ...jitter("ar-gurvan-saikhan", AREA_CENTER["gorkhi-terelj"]),
    phone: null,
    rating: null,
    price: 40000,
    description: "Горхи-Тэрэлж дэх амралтын газар.",
  },
  {
    name: "Тэрэлж амралт",
    nameEn: "Terelj Resort",
    slug: "terelj-amralt",
    locationSlug: "gorkhi-terelj",
    categorySlug: "amraltiin-gazar",
    province: "Улаанбаатар",
    district: "Тэрэлж",
    address: "Тэрэлж орчим",
    ...jitter("terelj-amralt", AREA_CENTER["gorkhi-terelj"]),
    phone: "+976 9310 0810",
    rating: null,
    price: 40000,
    description:
      "Морин аялал, теннис, бильярд, сагсан бөмбөг, волейболын талбайтай амралтын газар.",
    amenitySlugs: ["horse-riding"],
  },
  {
    // Verified via its official website (gloryresortmongolia.mn). Email, website,
    // and photos were imported straight into the database via the admin
    // "Import from URL" tool and aren't tracked in this seed file.
    name: "Glory Resort Mongolia",
    slug: "glory-resort-mongolia",
    locationSlug: "gorkhi-terelj",
    categorySlug: "amraltiin-gazar",
    province: "Төв аймаг",
    district: "Горхи-Тэрэлж",
    address: "Горхи-Тэрэлжийн үндэсний цэцэрлэгт хүрээлэн",
    ...jitter("glory-resort-mongolia", AREA_CENTER["gorkhi-terelj"]),
    phone: "+976 7070 2222",
    rating: null,
    price: null,
    description:
      "Горхи-Тэрэлжийн үндэсний цэцэрлэгт хүрээлэнд, Улаанбаатараас 44 км-т байрлах тансаг зэрэглэлийн амралтын газар.",
  },
];

async function main() {
  console.log("Seeding admin, demo users...");

  const passwordHash = await bcrypt.hash("Password123!", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@vayora.mn" },
    update: {},
    create: {
      email: "admin@vayora.mn",
      name: "Админ",
      password: passwordHash,
      role: UserRole.ADMIN,
    },
  });

  const demoUser = await prisma.user.upsert({
    where: { email: "demo@vayora.mn" },
    update: {},
    create: {
      email: "demo@vayora.mn",
      name: "Сарнай",
      password: passwordHash,
      role: UserRole.USER,
    },
  });

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
        nameEn: l.nameEn,
        nameZh: l.nameZh,
        province: l.province,
        description: l.description,
        descriptionEn: l.descriptionEn,
        descriptionZh: l.descriptionZh,
        latitude: l.lat,
        longitude: l.lng,
        featured: l.featured,
        image: photoUrl(PHOTO_POOL[hashSeed(`${l.slug}-cover`) % PHOTO_POOL.length], 1200, 900),
      },
      create: {
        name: l.name,
        nameEn: l.nameEn,
        nameZh: l.nameZh,
        slug: l.slug,
        province: l.province,
        description: l.description,
        descriptionEn: l.descriptionEn,
        descriptionZh: l.descriptionZh,
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

  console.log("Seeding real resorts...");
  for (const r of REAL_RESORTS) {
    const location = r.locationSlug ? locationBySlug.get(r.locationSlug) : undefined;
    const category = categoryBySlug.get(r.categorySlug)!;

    const resort = await prisma.resort.upsert({
      where: { slug: r.slug },
      update: {
        name: r.name,
        nameEn: r.nameEn ?? null,
        description: r.description,
        province: r.province,
        district: r.district,
        address: r.address,
        latitude: r.lat,
        longitude: r.lng,
        phone: r.phone,
        priceFrom: r.price ?? 0,
        rating: r.rating ?? 0,
        status: "APPROVED",
        featured: false,
        categoryId: category.id,
        locationId: location?.id ?? null,
      },
      create: {
        name: r.name,
        nameEn: r.nameEn ?? null,
        slug: r.slug,
        description: r.description,
        province: r.province,
        district: r.district,
        address: r.address,
        latitude: r.lat,
        longitude: r.lng,
        phone: r.phone,
        priceFrom: r.price ?? 0,
        rating: r.rating ?? 0,
        status: "APPROVED",
        featured: false,
        categoryId: category.id,
        locationId: location?.id ?? null,
      },
    });

    if (r.amenitySlugs?.length) {
      await prisma.resortAmenity.deleteMany({ where: { resortId: resort.id } });
      for (const slug of r.amenitySlugs) {
        const amenity = amenityBySlug.get(slug);
        if (!amenity) continue;
        await prisma.resortAmenity.create({
          data: { resortId: resort.id, amenityId: amenity.id },
        });
      }
    }

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
  console.log("  admin@vayora.mn (admin)");
  console.log("  demo@vayora.mn (regular user)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
