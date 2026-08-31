const mnFormatter = new Intl.NumberFormat("mn-MN");

export function formatMNT(amount: number) {
  return `${mnFormatter.format(Math.round(amount))}₮`;
}

export function formatKm(km: number) {
  const rounded = km < 10 ? Math.round(km * 10) / 10 : Math.round(km);
  return `${mnFormatter.format(rounded)} км`;
}

export function formatDuration(minutes: number) {
  const h = Math.floor(minutes / 60);
  const m = Math.round(minutes % 60);
  if (h === 0) return `${m} мин`;
  if (m === 0) return `${h} цаг`;
  return `${h} цаг ${m} мин`;
}

export function formatRating(rating: number) {
  return rating.toFixed(1);
}
