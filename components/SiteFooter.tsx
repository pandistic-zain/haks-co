export function SiteFooter() {
  return (
    <footer className="bg-[#020202] px-5 py-16 text-center text-white/[0.45]">
      <div className="font-serif text-4xl font-semibold tracking-[0.18em] text-white">HAKS & CO</div>
      <p className="mt-4 text-sm">Luxury Watch House 2026</p>
      <p className="mt-2 text-xs uppercase tracking-[0.22em] text-white/55">
        Proposal Presented By{" "}
        <a
          href="https://loopmtech.com"
          target="_blank"
          rel="noreferrer"
          className="text-white transition hover:text-emberLight"
        >
          loopmtech.com
        </a>
      </p>
    </footer>
  );
}
