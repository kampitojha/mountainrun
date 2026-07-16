export function SectionRidge({ flip = false }: { flip?: boolean }) {
  return (
    <div aria-hidden className={`section-ridge ${flip ? "rotate-180" : ""}`}>
      <svg preserveAspectRatio="none" viewBox="0 0 1440 48">
        <path
          d="M0 32L80 28C160 24 320 16 480 18C640 20 800 32 960 34C1120 36 1280 28 1360 24L1440 20V48H0V32Z"
          fill="currentColor"
        />
      </svg>
    </div>
  );
}
