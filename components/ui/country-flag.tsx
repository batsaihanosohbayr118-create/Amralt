export function CountryFlag({
  src,
  className,
}: {
  src: string;
  className?: string;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt=""
      className={`inline-block h-3 w-4 shrink-0 rounded-[2px] object-cover align-middle ${className ?? ""}`}
    />
  );
}
