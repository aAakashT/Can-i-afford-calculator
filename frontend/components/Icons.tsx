export function Icon({ name, size = 20 }: { name: string; size?: number }) {
  const common = { width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  const paths: Record<string, React.ReactNode> = {
    car: <><path d="m5 17-1-5 2.1-5.2A2 2 0 0 1 8 5.5h8a2 2 0 0 1 1.9 1.3L20 12l-1 5"/><path d="M4 12h16M7 17v2m10-2v2M6 15h.01M18 15h.01"/></>,
    home: <><path d="m3 11 9-7 9 7"/><path d="M5 10v10h14V10M9 20v-6h6v6"/></>,
    phone: <><rect x="7" y="2.5" width="10" height="19" rx="2"/><path d="M11 18.5h2"/></>,
    laptop: <><rect x="5" y="4" width="14" height="11" rx="1"/><path d="M3 19h18l-2-4H5l-2 4Z"/></>,
    plane: <><path d="m3 11 18-6-6 18-3-8-9-4Z"/><path d="m12 15 5-5"/></>,
    graduation: <><path d="m3 9 9-5 9 5-9 5-9-5Z"/><path d="M7 11v5c3 2 7 2 10 0v-5M21 9v6"/></>,
    arrow: <><path d="M5 12h14M13 6l6 6-6 6"/></>,
    shield: <><path d="M12 3 20 6v5c0 5-3.4 8.5-8 10-4.6-1.5-8-5-8-10V6l8-3Z"/><path d="m8.5 12 2.2 2.2 4.8-5"/></>,
    chart: <><path d="M4 19V5M4 19h17"/><path d="m7 15 3-4 3 2 5-6"/></>,
    check: <path d="m5 12 4 4L19 6"/>,
    lock: <><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></>,
    spark: <><path d="m12 2 1.3 6.7L20 10l-6.7 1.3L12 18l-1.3-6.7L4 10l6.7-1.3L12 2Z"/><path d="m19 16 .5 2.5L22 19l-2.5.5L19 22l-.5-2.5L16 19l2.5-.5L19 16Z"/></>
  };
  return <svg {...common}>{paths[name] || paths.spark}</svg>;
}
