export function AdSlot({ label = "Ad space" }: { label?: string }) {
  if (process.env.NEXT_PUBLIC_ADSENSE_ENABLED !== "true") return null;
  return <div className="ad-slot" aria-label={label}>{label}</div>;
}
