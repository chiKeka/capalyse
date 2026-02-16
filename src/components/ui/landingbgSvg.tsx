const LandingbgSvg = ({ className }: { className?: string }) => {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 1440 1027"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <g filter="url(#filter0_f_141_2384)">
        <ellipse cx="720" cy="513.5" rx="532" ry="224.5" fill="#F4FFFC" />
      </g>
      <defs>
        <filter
          id="filter0_f_141_2384"
          x="-100.186"
          y="0.814117"
          width="1640.37"
          height="1025.37"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend mode="normal" in="SourceGraphic" in2="BackgroundImageFix" result="shape" />
          <feGaussianBlur stdDeviation="144.093" result="effect1_foregroundBlur_141_2384" />
        </filter>
      </defs>
    </svg>
  );
};

export default LandingbgSvg;
