import type { Locale } from "@/i18n/request";

export function localizedName(
  locale: Locale,
  name: string,
  nameEn?: string | null,
  nameZh?: string | null
) {
  if (locale === "en" && nameEn) return nameEn;
  if (locale === "zh" && nameZh) return nameZh;
  return name;
}

export function localizedDescription(
  locale: Locale,
  description: string,
  descriptionEn?: string | null,
  descriptionZh?: string | null
) {
  if (locale === "en" && descriptionEn) return descriptionEn;
  if (locale === "zh" && descriptionZh) return descriptionZh;
  return description;
}

export function localizedAddress(
  locale: Locale,
  address: string,
  addressEn?: string | null,
  addressZh?: string | null
) {
  if (locale === "en" && addressEn) return addressEn;
  if (locale === "zh" && addressZh) return addressZh;
  return address;
}

export function localizedList(
  locale: Locale,
  list: string[],
  listEn?: string[] | null,
  listZh?: string[] | null
) {
  if (locale === "en" && listEn?.length) return listEn;
  if (locale === "zh" && listZh?.length) return listZh;
  return list;
}

const PROVINCE_TRANSLATIONS: Record<string, { en: string; zh: string }> = {
  "Улаанбаатар": { en: "Ulaanbaatar", zh: "乌兰巴托" },
  "Архангай аймаг": { en: "Arkhangai Province", zh: "杭爱省" },
  "Баян-Өлгий аймаг": { en: "Bayan-Ölgii Province", zh: "巴彦乌列盖省" },
  "Баянхонгор аймаг": { en: "Bayankhongor Province", zh: "巴彦洪戈尔省" },
  "Булган аймаг": { en: "Bulgan Province", zh: "布尔干省" },
  "Говь-Алтай аймаг": { en: "Govi-Altai Province", zh: "戈壁阿尔泰省" },
  "Говьсүмбэр аймаг": { en: "Govisümber Province", zh: "戈壁苏木贝尔省" },
  "Дархан-Уул аймаг": { en: "Darkhan-Uul Province", zh: "达尔汗乌拉省" },
  "Дорноговь аймаг": { en: "Dornogovi Province", zh: "东戈壁省" },
  "Дорнод аймаг": { en: "Dornod Province", zh: "东方省" },
  "Дундговь аймаг": { en: "Dundgovi Province", zh: "中戈壁省" },
  "Завхан аймаг": { en: "Zavkhan Province", zh: "扎布汗省" },
  "Орхон аймаг": { en: "Orkhon Province", zh: "鄂尔浑省" },
  "Өвөрхангай аймаг": { en: "Övörkhangai Province", zh: "后杭爱省" },
  "Өмнөговь аймаг": { en: "Ömnögovi Province", zh: "南戈壁省" },
  "Сүхбаатар аймаг": { en: "Sükhbaatar Province", zh: "苏赫巴托省" },
  "Сэлэнгэ аймаг": { en: "Selenge Province", zh: "色楞格省" },
  "Төв аймаг": { en: "Töv Province", zh: "中央省" },
  "Увс аймаг": { en: "Uvs Province", zh: "乌布苏省" },
  "Ховд аймаг": { en: "Khovd Province", zh: "科布多省" },
  "Хөвсгөл аймаг": { en: "Khövsgöl Province", zh: "库苏古尔省" },
  "Хэнтий аймаг": { en: "Khentii Province", zh: "肯特省" },
};

const DISTRICT_TRANSLATIONS: Record<string, { en: string; zh: string }> = {
  "Гачуурт сум": { en: "Gachuurt", zh: "加楚尔特" },
  "Эрдэнэ сум": { en: "Erdene", zh: "额尔德尼" },
  "Алаг-Эрдэнэ сум": { en: "Alag-Erdene", zh: "阿拉格额尔德尼" },
  "Хан-Уул дүүрэг": { en: "Khan-Uul District", zh: "汗乌拉区" },
  "Зуунмод сум": { en: "Zuunmod", zh: "宗毛德" },
  "Булган сум": { en: "Bulgan", zh: "布尔干" },
  "Тариат сум": { en: "Tariat", zh: "塔里亚特" },
  "Цэнхэр сум": { en: "Tsenkher", zh: "岑赫尔" },
  "Хархорин сум": { en: "Kharkhorin", zh: "哈拉和林" },
};

export function localizedProvince(locale: Locale, province: string) {
  const translated = PROVINCE_TRANSLATIONS[province];
  if (!translated) return province;
  if (locale === "en") return translated.en;
  if (locale === "zh") return translated.zh;
  return province;
}

export function localizedDistrict(locale: Locale, district: string) {
  const translated = DISTRICT_TRANSLATIONS[district];
  if (!translated) return district;
  if (locale === "en") return translated.en;
  if (locale === "zh") return translated.zh;
  return district;
}
