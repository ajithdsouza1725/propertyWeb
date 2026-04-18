export function HeroHousingBackdrop() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
      <div className="absolute inset-0 bg-[linear-gradient(90deg,#8a4f4d_0%,#c47b75_45%,#c98a84_70%,#8a4f4d_100%)]" />
      <div className="absolute inset-0 opacity-35 mix-blend-soft-light">
        <svg
          className="h-full w-full"
          viewBox="0 0 1440 560"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid slice"
        >
          <g stroke="white" strokeOpacity="0.55" strokeWidth="1.2">
            {/* Left lamp + lines */}
            <g opacity="0.35">
              <path d="M210 150h220" />
              <path d="M210 170h160" />
              <path d="M220 210h120" />
              <path d="M120 120c35-35 95-35 130 0" />
              <path d="M185 120v120" />
              <path d="M155 240h60" />
              <path d="M160 255h50" />
              <path d="M170 270h30" />
            </g>

            {/* Big house outline left */}
            <g opacity="0.30">
              <path d="M40 460V280l150-110 150 110v180" />
              <path d="M90 460V320h200v140" />
              <path d="M160 355h60v60h-60z" />
              <path d="M125 320v-35h130v35" />
            </g>

            {/* Right building + shelves */}
            <g opacity="0.32">
              <path d="M1020 440V210h170v230" />
              <path d="M1060 250h90" />
              <path d="M1060 280h90" />
              <path d="M1060 310h90" />
              <path d="M1220 440V250h150v190" />
              <path d="M1255 285h80" />
              <path d="M1255 315h80" />
              <path d="M1255 345h80" />
            </g>

            {/* Floating frames / decor */}
            <g opacity="0.22">
              <path d="M780 140h160" />
              <path d="M780 165h120" />
              <path d="M720 430h170" />
              <path d="M720 455h110" />
              <path d="M980 120h120v70H980z" />
              <path d="M1010 145h60" />
              <path d="M540 120h120v80H540z" />
              <path d="M560 145h80" />
            </g>

            {/* Subtle corner outlines */}
            <g opacity="0.18">
              <path d="M0 520h220" />
              <path d="M1220 520h220" />
              <path d="M60 40h220" />
              <path d="M1160 40h220" />
            </g>
          </g>
        </svg>
      </div>

      {/* readability overlay */}
      <div className="absolute inset-0 bg-linear-to-b from-black/15 via-black/10 to-background/70" />
    </div>
  );
}

