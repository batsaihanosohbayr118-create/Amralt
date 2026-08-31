function priceLabel(price: number) {
  if (price >= 1_000_000) return `${Math.round(price / 100_000) / 10}сая₮`;
  if (price >= 1000) return `${Math.round(price / 1000)}мянга₮`;
  return `${price}₮`;
}

export function createPricePinIcon(
  price: number,
  options: { selected?: boolean } = {}
): google.maps.Icon {
  const { selected = false } = options;
  const label = priceLabel(price);
  const paddingX = 10;
  const charWidth = 6.6;
  const width = Math.max(56, Math.round(label.length * charWidth + paddingX * 2));
  const height = 30;
  const bg = selected ? "#1f5d3f" : "#ffffff";
  const fg = selected ? "#ffffff" : "#1f5d3f";
  const stroke = selected ? "#1f5d3f" : "#d8e3dc";

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height + 8}" viewBox="0 0 ${width} ${height + 8}">
      <g filter="url(#shadow)">
        <rect x="1" y="1" width="${width - 2}" height="${height - 2}" rx="${height / 2}" fill="${bg}" stroke="${stroke}" stroke-width="1.5" />
      </g>
      <text x="${width / 2}" y="${height / 2 + 5}" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" font-weight="700" fill="${fg}">${label}</text>
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="160%">
          <feDropShadow dx="0" dy="1" stdDeviation="1.5" flood-color="#00000033" />
        </filter>
      </defs>
    </svg>
  `.trim();

  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new google.maps.Size(width, height + 8),
    anchor: new google.maps.Point(width / 2, height + 4),
  };
}

export function createProvinceIcon(name: string, count: number): google.maps.Icon {
  const label = `${name} · ${count}`;
  const paddingX = 14;
  const charWidth = 8;
  const width = Math.max(90, Math.round(label.length * charWidth + paddingX * 2));
  const height = 38;
  const bg = "#1f5d3f";
  const fg = "#ffffff";

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height + 8}" viewBox="0 0 ${width} ${height + 8}">
      <g filter="url(#shadow)">
        <rect x="1" y="1" width="${width - 2}" height="${height - 2}" rx="${height / 2}" fill="${bg}" stroke="#ffffff" stroke-width="2" />
      </g>
      <text x="${width / 2}" y="${height / 2 + 6}" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" font-weight="700" fill="${fg}">${label}</text>
      <defs>
        <filter id="shadow" x="-20%" y="-20%" width="140%" height="160%">
          <feDropShadow dx="0" dy="1" stdDeviation="2" flood-color="#00000040" />
        </filter>
      </defs>
    </svg>
  `.trim();

  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new google.maps.Size(width, height + 8),
    anchor: new google.maps.Point(width / 2, height + 4),
  };
}

export function createClusterIcon(count: number): google.maps.Icon {
  const size = count < 10 ? 40 : count < 50 ? 46 : 52;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
      <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 2}" fill="#1f5d3f" fill-opacity="0.9" stroke="#ffffff" stroke-width="2.5" />
      <text x="${size / 2}" y="${size / 2 + 5}" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" font-weight="700" fill="#ffffff">${count}</text>
    </svg>
  `.trim();

  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new google.maps.Size(size, size),
    anchor: new google.maps.Point(size / 2, size / 2),
  };
}
