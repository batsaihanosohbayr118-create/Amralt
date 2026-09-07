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

// Accommodation names and facilities repeat across resorts, so translations are
// keyed by the Mongolian string once here rather than duplicated per entry.
const ACCOMMODATION_NAME_TRANSLATIONS: Record<string, { en: string; zh: string }> = {
  "Монгол гэр": { en: "Mongolian Ger", zh: "蒙古包" },
  "Гэр бүлийн байшин": { en: "Family House", zh: "家庭别墅" },
  "VIP байшин": { en: "VIP House", zh: "VIP别墅" },
  "Стандарт гэр": { en: "Standard Ger", zh: "标准蒙古包" },
  "Майхан": { en: "Tent", zh: "帐篷" },
  "Нуурын эрэг гэр": { en: "Lakeside Ger", zh: "湖畔蒙古包" },
  "VIP нуурын байшин": { en: "VIP Lake House", zh: "VIP湖畔别墅" },
  "Гэр": { en: "Ger", zh: "蒙古包" },
  "Байшин": { en: "House", zh: "别墅" },
  "Нуурын гэр": { en: "Lake Ger", zh: "湖景蒙古包" },
  "Түүхэн загварын гэр": { en: "Traditional-Style Ger", zh: "传统风格蒙古包" },
  "Sky Dome VIP": { en: "Sky Dome VIP", zh: "天空穹顶VIP房" },
  "Энгийн гэр": { en: "Simple Ger", zh: "简易蒙古包" },
};

const FACILITY_TRANSLATIONS: Record<string, { en: string; zh: string }> = {
  "Зуух": { en: "Stove", zh: "火炉" },
  "Ор, дэрний хэрэгсэл": { en: "Bedding", zh: "床上用品" },
  "Угаалгын өрөө": { en: "Bathroom", zh: "卫生间" },
  "Гал тогоо": { en: "Kitchen", zh: "厨房" },
  "Саун": { en: "Sauna", zh: "桑拿" },
  "Тагт": { en: "Terrace", zh: "露台" },
  "Халуун ус": { en: "Hot water", zh: "热水" },
  "Унтлагын уут түрээслэх": { en: "Sleeping bag rental", zh: "睡袋租赁" },
  "Нуурын үзэмж": { en: "Lake view", zh: "湖景" },
  "Тоглоомын талбай": { en: "Playground", zh: "游乐场" },
  "Рашаан ус": { en: "Hot spring water", zh: "温泉水" },
  "Шилэн таазтай": { en: "Glass ceiling", zh: "玻璃穹顶" },
  "Тансаг тавилга": { en: "Luxury furnishings", zh: "奢华家具" },
};

function translateAccommodationName(name: string) {
  return ACCOMMODATION_NAME_TRANSLATIONS[name] ?? { en: name, zh: name };
}

function translateFacilities(facilities: string[]) {
  return {
    en: facilities.map((f) => FACILITY_TRANSLATIONS[f]?.en ?? f),
    zh: facilities.map((f) => FACILITY_TRANSLATIONS[f]?.zh ?? f),
  };
}

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

type ResortSeed = {
  name: string;
  nameEn: string;
  nameZh: string;
  slug: string;
  locationSlug: string;
  categorySlug: string;
  province: string;
  district: string;
  address: string;
  addressEn: string;
  addressZh: string;
  lat: number;
  lng: number;
  distanceFromUbKm: number;
  phone: string;
  description: string;
  descriptionEn: string;
  descriptionZh: string;
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
    nameEn: "Terelj Resort",
    nameZh: "特勒尔吉度假村",
    slug: "terelj-resort",
    locationSlug: "gorkhi-terelj",
    categorySlug: "amraltiin-gazar",
    province: "Төв аймаг",
    district: "Гачуурт сум",
    address: "Горхи-Тэрэлжийн байгалийн цогцолборт газар",
    addressEn: "Gorkhi-Terelj National Park",
    addressZh: "戈尔希-特勒尔吉国家公园",
    lat: 47.985,
    lng: 107.47,
    distanceFromUbKm: 65,
    phone: "+976 9911 2233",
    description:
      "Горхи-Тэрэлжийн байгалийн цогцолборт газарт орших уламжлалт гэр болон тав тухтай зусланг хослуулсан амралтын газар. Хад чулуу, гол, ойн үзэсгэлэнт байгаль дунд амрах боломжтой.",
    descriptionEn:
      "A resort in Gorkhi-Terelj National Park combining traditional gers with comfortable cottages. Relax amid stunning rock formations, rivers, and forest scenery.",
    descriptionZh:
      "位于戈尔希-特勒尔吉国家公园内的度假村，将传统蒙古包与舒适别墅相结合。可在壮观的岩石、河流与森林美景中尽享休憩。",
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
    nameEn: "Gorkhi Eco Camp",
    nameZh: "戈尔希生态营地",
    slug: "gorkhi-eco-camp",
    locationSlug: "gorkhi-terelj",
    categorySlug: "juulchnii-baaz",
    province: "Төв аймаг",
    district: "Эрдэнэ сум",
    address: "Горхийн хөндий",
    addressEn: "Gorkhi Valley",
    addressZh: "戈尔希河谷",
    lat: 47.95,
    lng: 107.4,
    distanceFromUbKm: 72,
    phone: "+976 9922 3344",
    description: "Байгальд ээлтэй, энгийн зохион байгуулалттай жуулчны бааз. Морь унах, загасчлах боломжтой.",
    descriptionEn: "An eco-friendly, simply organized tourist camp offering horseback riding and fishing.",
    descriptionZh: "环保、布局简单的旅游营地，可骑马和垂钓。",
    amenities: ["campfire", "horse-riding", "fishing", "parking"],
    accommodations: [
      { type: "GER", name: "Стандарт гэр", capacity: 3, price: 85000, facilities: ["Зуух"] },
      { type: "TENT", name: "Майхан", capacity: 2, price: 45000, facilities: ["Унтлагын уут түрээслэх"] },
    ],
  },
  {
    name: "Хөвсгөл Нуур Лодж",
    nameEn: "Khuvsgul Lake Lodge",
    nameZh: "库苏古尔湖度假屋",
    slug: "khuvsgul-lake-lodge",
    locationSlug: "khuvsgul",
    categorySlug: "amraltiin-gazar",
    province: "Хөвсгөл аймаг",
    district: "Алаг-Эрдэнэ сум",
    address: "Хатгал тосгоны ойролцоо, нуурын эрэг",
    addressEn: "Near Khatgal village, lake shore",
    addressZh: "毗邻哈特嘎勒村，湖畔",
    lat: 51.03,
    lng: 100.15,
    distanceFromUbKm: 655,
    phone: "+976 9933 4455",
    description: "Хөвсгөл нуурын эрэг дээр байрлах тансаг зэрэглэлийн амралтын газар. Нуурын үзэмж бүхий VIP байшингууд.",
    descriptionEn: "A luxury resort on the shore of Lake Khuvsgul, with VIP cottages offering lake views.",
    descriptionZh: "坐落于库苏古尔湖畔的豪华度假村，设有可欣赏湖景的贵宾别墅。",
    amenities: ["restaurant", "wifi", "sauna", "fishing", "parking", "campfire"],
    featured: true,
    accommodations: [
      { type: "GER", name: "Нуурын эрэг гэр", capacity: 4, price: 140000, facilities: ["Нуурын үзэмж", "Зуух"] },
      { type: "VIP_HOUSE", name: "VIP нуурын байшин", capacity: 4, price: 420000, facilities: ["Саун", "Тагт", "Халуун ус"] },
    ],
  },
  {
    name: "Хатгал Нуур Кэмп",
    nameEn: "Khatgal Lake Camp",
    nameZh: "哈特嘎勒湖营地",
    slug: "khatgal-nuur-camp",
    locationSlug: "khuvsgul",
    categorySlug: "juulchnii-baaz",
    province: "Хөвсгөл аймаг",
    district: "Алаг-Эрдэнэ сум",
    address: "Хатгал тосгон",
    addressEn: "Khatgal village",
    addressZh: "哈特嘎勒村",
    lat: 50.98,
    lng: 100.16,
    distanceFromUbKm: 660,
    phone: "+976 9944 5566",
    description: "Гэр бүлийн амралтад тохиромжтой, нуурын хажууд орших энгийн боловч тав тухтай бааз.",
    descriptionEn: "A simple yet comfortable camp by the lake, well suited for family vacations.",
    descriptionZh: "位于湖边的简朴舒适营地，非常适合家庭度假。",
    amenities: ["fishing", "campfire", "horse-riding", "parking"],
    accommodations: [
      { type: "GER", name: "Гэр", capacity: 4, price: 95000, facilities: ["Зуух"] },
      { type: "FAMILY_HOUSE", name: "Гэр бүлийн байшин", capacity: 6, price: 180000, facilities: ["Гал тогоо"] },
    ],
  },
  {
    name: "Богд Хан Нэйчур Ресорт",
    nameEn: "Bogd Khan Nature Resort",
    nameZh: "博格达汗自然度假村",
    slug: "bogd-khan-nature-resort",
    locationSlug: "bogd-khan-uul",
    categorySlug: "amraltiin-gazar",
    province: "Улаанбаатар",
    district: "Хан-Уул дүүрэг",
    address: "Богд Хан уулын ар бэл",
    addressEn: "Northern foothills of Bogd Khan Mountain",
    addressZh: "博格达汗山北麓",
    lat: 47.81,
    lng: 106.97,
    distanceFromUbKm: 28,
    phone: "+976 9955 6677",
    description: "Хотоос хамгийн ойр, нэг өдрийн амралтад тохиромжтой гэр бүлийн амралтын газар.",
    descriptionEn: "The closest resort to the city, perfect for a family day trip.",
    descriptionZh: "距市区最近的度假村，非常适合家庭一日游。",
    amenities: ["playground", "pool", "restaurant", "wifi", "parking"],
    accommodations: [
      { type: "GER", name: "Гэр", capacity: 4, price: 100000, facilities: ["Зуух"] },
      { type: "FAMILY_HOUSE", name: "Гэр бүлийн байшин", capacity: 5, price: 190000, facilities: ["Тагт"] },
    ],
  },
  {
    name: "Зайсан Хилл Ритрит",
    nameEn: "Zaisan Hill Retreat",
    nameZh: "扎伊桑山庄",
    slug: "zaisan-hill-retreat",
    locationSlug: "bogd-khan-uul",
    categorySlug: "amraltiin-gazar",
    province: "Улаанбаатар",
    district: "Хан-Уул дүүрэг",
    address: "Зайсан толгойн урд бэл",
    addressEn: "Southern foothills of Zaisan Hill",
    addressZh: "扎伊桑山南麓",
    lat: 47.865,
    lng: 106.93,
    distanceFromUbKm: 15,
    phone: "+976 9966 7788",
    description: "Хотын төвөөс машинаар 20 минутын зайд орших тансаг VIP амралтын газар.",
    descriptionEn: "A luxury VIP resort just a 20-minute drive from the city center.",
    descriptionZh: "距市中心仅20分钟车程的豪华贵宾度假村。",
    amenities: ["sauna", "pool", "restaurant", "wifi", "parking"],
    accommodations: [
      { type: "VIP_HOUSE", name: "VIP байшин", capacity: 4, price: 350000, facilities: ["Саун", "Бассейн"] },
    ],
  },
  {
    name: "Зуунмод Гэр Бүлийн Кэмп",
    nameEn: "Zuunmod Family Camp",
    nameZh: "宗毛德家庭营地",
    slug: "zuunmod-family-camp",
    locationSlug: "zuunmod",
    categorySlug: "amraltiin-gazar",
    province: "Төв аймаг",
    district: "Зуунмод сум",
    address: "Зуунмод хотын захад",
    addressEn: "On the outskirts of Zuunmod",
    addressZh: "宗毛德市郊",
    lat: 47.71,
    lng: 106.94,
    distanceFromUbKm: 45,
    phone: "+976 9977 8899",
    description: "Хямд, хүртээмжтэй үнэтэй, хүүхэдтэй гэр бүлд тохиромжтой амралтын газар.",
    descriptionEn: "An affordable resort well suited for families with children.",
    descriptionZh: "价格实惠，非常适合有孩子的家庭。",
    amenities: ["playground", "bbq", "campfire", "parking"],
    accommodations: [
      { type: "GER", name: "Гэр", capacity: 4, price: 70000, facilities: ["Зуух"] },
      { type: "FAMILY_HOUSE", name: "Байшин", capacity: 6, price: 130000, facilities: ["Тоглоомын талбай"] },
    ],
  },
  {
    name: "Булган Гол Лодж",
    nameEn: "Bulgan River Lodge",
    nameZh: "布尔干河畔度假屋",
    slug: "bulgan-river-lodge",
    locationSlug: "bulgan",
    categorySlug: "amraltiin-gazar",
    province: "Булган аймаг",
    district: "Булган сум",
    address: "Сэлэнгэ мөрний хөвөө",
    addressEn: "Banks of the Selenge River",
    addressZh: "色楞格河畔",
    lat: 48.8,
    lng: 103.53,
    distanceFromUbKm: 305,
    phone: "+976 9988 9900",
    description: "Гол мөрний эрэг дээр орших, загасчлал болон морь унахад тохиромжтой амралтын газар.",
    descriptionEn: "A riverside resort ideal for fishing and horseback riding.",
    descriptionZh: "位于河岸边的度假村，非常适合垂钓和骑马。",
    amenities: ["fishing", "campfire", "horse-riding", "parking", "restaurant"],
    accommodations: [
      { type: "GER", name: "Гэр", capacity: 4, price: 90000, facilities: ["Зуух"] },
      { type: "FAMILY_HOUSE", name: "Байшин", capacity: 6, price: 170000, facilities: ["Гал тогоо"] },
    ],
  },
  {
    name: "Цагаан Нуур Ресорт",
    nameEn: "Tsagaan Nuur Resort",
    nameZh: "查干湖度假村",
    slug: "tsagaan-nuur-resort",
    locationSlug: "arkhangai",
    categorySlug: "amraltiin-gazar",
    province: "Архангай аймаг",
    district: "Тариат сум",
    address: "Тэрхийн цагаан нуурын эрэг",
    addressEn: "Shore of White Lake (Terkhiin Tsagaan Lake)",
    addressZh: "特日欣查干湖（白湖）湖畔",
    lat: 48.17,
    lng: 99.75,
    distanceFromUbKm: 480,
    phone: "+976 9900 1122",
    description: "Тэрхийн цагаан нуур, Хорго уулын үзэсгэлэнт байгаль дунд орших амралтын газар.",
    descriptionEn: "A resort amid the scenic nature of White Lake (Terkhiin Tsagaan Lake) and Khorgo Mountain.",
    descriptionZh: "坐落于特日欣查干湖（白湖）与和日高山秀丽自然风光之中的度假村。",
    amenities: ["restaurant", "wifi", "fishing", "campfire", "horse-riding", "parking"],
    featured: true,
    accommodations: [
      { type: "GER", name: "Нуурын гэр", capacity: 4, price: 110000, facilities: ["Нуурын үзэмж"] },
      { type: "VIP_HOUSE", name: "VIP байшин", capacity: 4, price: 320000, facilities: ["Тагт", "Халуун ус"] },
    ],
  },
  {
    name: "Архангай Рашаан Ресорт",
    nameEn: "Arkhangai Hot Springs Resort",
    nameZh: "杭爱温泉度假村",
    slug: "arkhangai-hot-spring-resort",
    locationSlug: "arkhangai",
    categorySlug: "amraltiin-gazar",
    province: "Архангай аймаг",
    district: "Цэнхэр сум",
    address: "Цэнхэрийн халуун рашаан",
    addressEn: "Tsenkher Hot Spring",
    addressZh: "岑赫尔温泉",
    lat: 47.35,
    lng: 101.15,
    distanceFromUbKm: 445,
    phone: "+976 9911 2200",
    description: "Байгалийн халуун рашаан бүхий эрүүл мэндийн амралтын газар.",
    descriptionEn: "A wellness resort with natural hot springs.",
    descriptionZh: "拥有天然温泉的健康疗养度假村。",
    amenities: ["sauna", "pool", "restaurant", "wifi", "parking"],
    accommodations: [
      { type: "FAMILY_HOUSE", name: "Байшин", capacity: 5, price: 200000, facilities: ["Рашаан ус"] },
      { type: "VIP_HOUSE", name: "VIP байшин", capacity: 4, price: 360000, facilities: ["Саун", "Рашаан ус"] },
    ],
  },
  {
    name: "Орхоны Хөндий Кэмп",
    nameEn: "Orkhon Valley Camp",
    nameZh: "鄂尔浑河谷营地",
    slug: "orkhon-valley-camp",
    locationSlug: "uvurkhangai",
    categorySlug: "juulchnii-baaz",
    province: "Өвөрхангай аймаг",
    district: "Хархорин сум",
    address: "Орхоны хөндий",
    addressEn: "Orkhon Valley",
    addressZh: "鄂尔浑河谷",
    lat: 47.2,
    lng: 102.83,
    distanceFromUbKm: 365,
    phone: "+976 9922 3311",
    description: "Түүхэн дурсгалт Хархорин хотын ойролцоо, нүүдэлчдийн соёлыг мэдрэх боломжтой бааз.",
    descriptionEn: "A camp near the historic city of Kharkhorin, offering a chance to experience nomadic culture.",
    descriptionZh: "毗邻历史名城哈拉和林的营地，可在此体验游牧文化。",
    amenities: ["horse-riding", "campfire", "restaurant", "parking"],
    accommodations: [
      { type: "GER", name: "Түүхэн загварын гэр", capacity: 4, price: 95000, facilities: ["Зуух"] },
    ],
  },
  {
    name: "Хархорум Херитаж Ресорт",
    nameEn: "Kharkhorum Heritage Resort",
    nameZh: "哈拉和林遗产度假村",
    slug: "kharkhorum-heritage-resort",
    locationSlug: "uvurkhangai",
    categorySlug: "amraltiin-gazar",
    province: "Өвөрхангай аймаг",
    district: "Хархорин сум",
    address: "Эрдэнэ Зуу хийдийн ойролцоо",
    addressEn: "Near Erdene Zuu Monastery",
    addressZh: "毗邻额尔德尼召寺",
    lat: 47.195,
    lng: 102.82,
    distanceFromUbKm: 370,
    phone: "+976 9933 4400",
    description: "Эрдэнэ Зуу хийдийн ойролцоо орших, түүх соёлын аяллын цэг дэх тав тухтай амралтын газар.",
    descriptionEn: "A comfortable resort near Erdene Zuu Monastery, a key stop on any historical and cultural tour.",
    descriptionZh: "毗邻额尔德尼召寺的舒适度假村，是历史文化之旅的重要一站。",
    amenities: ["wifi", "restaurant", "parking", "bbq"],
    accommodations: [
      { type: "GER", name: "Гэр", capacity: 4, price: 100000, facilities: ["Зуух"] },
      { type: "VIP_HOUSE", name: "VIP байшин", capacity: 4, price: 290000, facilities: ["Тагт"] },
    ],
  },
  {
    name: "Nomad Sky Glamping",
    nameEn: "Nomad Sky Glamping",
    nameZh: "游牧天空豪华露营",
    slug: "nomad-sky-glamping",
    locationSlug: "gorkhi-terelj",
    categorySlug: "glemping",
    province: "Төв аймаг",
    district: "Гачуурт сум",
    address: "Тэрэлжийн үндэсний цэцэрлэгт хүрээлэн",
    addressEn: "Terelj National Park",
    addressZh: "特勒尔吉国家公园",
    lat: 48.0,
    lng: 107.45,
    distanceFromUbKm: 68,
    phone: "+976 9944 3300",
    description: "Тансаг зэрэглэлийн глэмпинг — таны дулаан, тав тухыг хангасан орчин үеийн бүрэн тоноглогдсон майхан байшингууд.",
    descriptionEn: "Luxury glamping — fully equipped modern tent cabins designed for your warmth and comfort.",
    descriptionZh: "奢华露营地——配备齐全的现代化帐篷小屋，为您带来温暖与舒适。",
    amenities: ["wifi", "pool", "sauna", "restaurant", "parking"],
    featured: true,
    accommodations: [
      { type: "VIP_HOUSE", name: "Sky Dome VIP", capacity: 2, price: 550000, facilities: ["Шилэн таазтай", "Тансаг тавилга", "Саун"] },
    ],
  },
  {
    name: "Steppe Budget Camp",
    nameEn: "Steppe Budget Camp",
    nameZh: "草原经济营地",
    slug: "steppe-budget-camp",
    locationSlug: "zuunmod",
    categorySlug: "juulchnii-baaz",
    province: "Төв аймаг",
    district: "Зуунмод сум",
    address: "Зуунмодын хөндий",
    addressEn: "Zuunmod Valley",
    addressZh: "宗毛德河谷",
    lat: 47.68,
    lng: 106.97,
    distanceFromUbKm: 50,
    phone: "+976 9955 4400",
    description: "Хямд өртөгтэй, энгийн зохион байгуулалттай, оюутан залуучуудад тохиромжтой амралтын газар.",
    descriptionEn: "An affordable, simply organized resort well suited for students and young travelers.",
    descriptionZh: "价格实惠、布局简单，非常适合学生和年轻旅行者的度假村。",
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

  console.log("Seeding resorts...");
  for (const r of RESORTS) {
    const priceFrom = Math.min(...r.accommodations.map((a) => a.price));
    const location = locationBySlug.get(r.locationSlug)!;
    const category = categoryBySlug.get(r.categorySlug)!;

    const resort = await prisma.resort.upsert({
      where: { slug: r.slug },
      update: {
        name: r.name,
        nameEn: r.nameEn,
        nameZh: r.nameZh,
        description: r.description,
        descriptionEn: r.descriptionEn,
        descriptionZh: r.descriptionZh,
        province: r.province,
        district: r.district,
        address: r.address,
        addressEn: r.addressEn,
        addressZh: r.addressZh,
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
        nameEn: r.nameEn,
        nameZh: r.nameZh,
        slug: r.slug,
        description: r.description,
        descriptionEn: r.descriptionEn,
        descriptionZh: r.descriptionZh,
        province: r.province,
        district: r.district,
        address: r.address,
        addressEn: r.addressEn,
        addressZh: r.addressZh,
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
      const nameTranslation = translateAccommodationName(a.name);
      const facilitiesTranslation = translateFacilities(a.facilities);
      await prisma.accommodation.create({
        data: {
          resortId: resort.id,
          type: a.type,
          name: a.name,
          nameEn: nameTranslation.en,
          nameZh: nameTranslation.zh,
          capacity: a.capacity,
          price: a.price,
          images: img(`${r.slug}-${a.name}`, 3),
          facilities: a.facilities,
          facilitiesEn: facilitiesTranslation.en,
          facilitiesZh: facilitiesTranslation.zh,
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
