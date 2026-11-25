import type { SkillId } from './skillsData';

interface SkillLogoProps {
  id: SkillId;
  /** Unique suffix so SVG gradient/clip IDs never collide across instances */
  uid: string;
}

/**
 * Recognizable official vector brand marks (viewBox 0 0 64 64) suspended inside
 * each 3D glass skill sphere. All 14 retain their authentic full brand colours
 * as the ONLY coloured elements in the monochrome cosmic scene.
 */
export function SkillLogo({ id, uid }: SkillLogoProps) {
  switch (id) {
    case 'html5':
      return (
        <g>
          {/* Official HTML5 orange shield */}
          <path d="M12 8 L52 8 L48.3 48.8 L32 53.5 L15.7 48.8 Z" fill="#E34F26" />
          <path d="M32 11.4 L48.6 11.4 L45.4 46.1 L32 50 Z" fill="#EF652A" />
          {/* Official geometric 5 ribbon */}
          <path
            d="M32 23.2 H24.5 L24 18.1 H32 V13.1 H18.6 L18.7 14.5 L20 28.2 H32 Z M32 36.2 L31.9 36.3 L26.3 34.8 L26 30.8 H21 L21.7 38.6 L31.9 41.5 L32 41.4 Z"
            fill="#EBEBEB"
          />
          <path
            d="M32 23.2 V28.2 H39.1 L38.4 34.8 L32 36.2 V41.4 L42.2 38.6 L42.3 37.7 L43.5 24.5 L43.6 23.2 H32 Z M32 13.1 V18.1 H44.1 L44.2 17 L44.5 14.5 L44.6 13.1 Z"
            fill="#FFFFFF"
          />
        </g>
      );

    case 'css3':
      return (
        <g>
          {/* Official CSS3 blue shield */}
          <path d="M12 8 L52 8 L48.3 48.8 L32 53.5 L15.7 48.8 Z" fill="#1572B6" />
          <path d="M32 11.4 L48.6 11.4 L45.4 46.1 L32 50 Z" fill="#33A9DC" />
          {/* Official geometric 3 ribbon */}
          <path
            d="M32 23.2 H19.5 L19.9 28.2 H32 Z M32 13.1 H18.6 L19 18.1 H32 Z M32 36.2 L26.3 34.7 L26 30.8 H21 L21.7 38.6 L32 41.5 Z"
            fill="#EBEBEB"
          />
          <path
            d="M32 23.2 V28.2 H39.1 L38.4 34.7 L32 36.2 V41.5 L42.3 38.6 L44.6 13.1 H32 V18.1 H39.5 L39.1 23.2 Z"
            fill="#FFFFFF"
          />
        </g>
      );

    case 'javascript':
      return (
        <g>
          {/* Official JS yellow tile */}
          <rect x="9" y="9" width="46" height="46" rx="5" fill="#F7DF1E" />
          {/* Authentic bold geometric J & S paths */}
          <path
            d="M31.4 45.2 C31.4 48.9 29.2 50.8 25.8 50.8 C22.9 50.8 21.1 49.3 20.1 47.4 L23.4 45.4 C24 46.5 24.7 47.3 26.1 47.3 C27.4 47.3 28.2 46.8 28.2 44.7 V30.4 H31.4 Z"
            fill="#141414"
          />
          <path
            d="M39.5 46.3 C40.5 47.9 41.8 49.1 44.1 49.1 C46 49.1 47.2 48.2 47.2 46.8 C47.2 45.2 45.9 44.6 43.7 43.6 L42.5 43.1 C39.1 41.6 36.9 39.8 36.9 36 C36.9 32.4 39.6 29.7 43.9 29.7 C46.9 29.7 49.1 30.8 50.6 33.5 L47.3 35.6 C46.6 34.3 45.8 33.7 44.4 33.7 C43.1 33.7 42.2 34.5 42.2 35.7 C42.2 37.1 43.1 37.7 45.1 38.6 L46.3 39.1 C50.3 40.8 52.5 42.5 52.5 46.5 C52.5 50.8 49.1 53.1 44.4 53.1 C39.9 53.1 37 50.9 35.6 48.2 Z"
            fill="#141414"
          />
        </g>
      );

    case 'typescript':
      return (
        <g>
          {/* Official TS blue tile */}
          <rect x="9" y="9" width="46" height="46" rx="5" fill="#3178C6" />
          {/* Authentic bold geometric T & S paths */}
          <path
            d="M20.2 33.8 H26.2 V50.6 H30.4 V33.8 H36.4 V30.2 H20.2 Z"
            fill="#FFFFFF"
          />
          <path
            d="M39.2 46.6 C40.4 47.7 42.2 48.4 44.3 48.4 C46.4 48.4 47.7 47.5 47.7 46.2 C47.7 44.8 46.6 44.1 44.1 43.1 L42.5 42.4 C39.2 41 37.2 39.3 37.2 35.8 C37.2 32.4 39.9 29.9 44.1 29.9 C46.8 29.9 49 30.7 50.6 32.2 L48.5 35.1 C47.3 34 45.9 33.4 44.2 33.4 C42.4 33.4 41.3 34.2 41.3 35.4 C41.3 36.7 42.4 37.3 44.7 38.2 L46.3 38.9 C50 40.4 51.9 42.1 51.9 45.7 C51.9 49.6 48.8 51.9 44.1 51.9 C41 51.9 38.3 50.9 36.8 49.4 Z"
            fill="#FFFFFF"
          />
        </g>
      );

    case 'react':
      return (
        <g>
          <circle cx="32" cy="32" r="4.8" fill="#61DAFB" />
          <g fill="none" stroke="#61DAFB" strokeWidth="2.8">
            <ellipse cx="32" cy="32" rx="23.5" ry="9.2" />
            <ellipse cx="32" cy="32" rx="23.5" ry="9.2" transform="rotate(60 32 32)" />
            <ellipse cx="32" cy="32" rx="23.5" ry="9.2" transform="rotate(120 32 32)" />
          </g>
        </g>
      );

    case 'nextjs':
      return (
        <g>
          <defs>
            <linearGradient id={`next-n-${uid}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="78%" stopColor="#FFFFFF" stopOpacity="0.88" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.15" />
            </linearGradient>
            <linearGradient id={`next-r-${uid}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0.18" />
            </linearGradient>
          </defs>
          <circle cx="32" cy="32" r="23.5" fill="#0B0B10" stroke="#FFFFFF" strokeWidth="2.2" />
          {/* Official Next.js diagonal slash N mark */}
          <path d="M22.2 44.5 V20.5 H26.2 L46.8 47.6 L43.4 49.6 L26.1 26.8 V44.5 Z" fill={`url(#next-n-${uid})`} />
          <rect x="38.2" y="20.5" width="3.9" height="17.5" fill={`url(#next-r-${uid})`} />
        </g>
      );

    case 'nodejs':
      return (
        <g>
          <defs>
            <linearGradient id={`node-g-${uid}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#77BC65" />
              <stop offset="100%" stopColor="#3E863D" />
            </linearGradient>
          </defs>
          {/* Official Node.js hexagon emblem */}
          <path
            d="M32 6.5 L53.5 19 V44 L32 56.5 L10.5 44 V19 Z"
            fill={`url(#node-g-${uid})`}
          />
          <path
            d="M32 13.5 L47.5 22.5 V40.5 L32 49.5 L16.5 40.5 V22.5 Z"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="2.6"
            strokeLinejoin="round"
            opacity="0.92"
          />
          {/* Inner hexagonal JS node mark */}
          <path
            d="M32 20.5 L41.5 26 V37 L32 42.5 L22.5 37 V26 Z"
            fill="#FFFFFF"
            fillOpacity="0.92"
          />
          <path
            d="M32 25.2 L37.4 28.3 V34.7 L32 37.8 L26.6 34.7 V28.3 Z"
            fill="#3E863D"
          />
        </g>
      );

    case 'python':
      return (
        <g>
          {/* Official Python blue top snake */}
          <path
            d="M31.6 9 C21.2 9 21.8 13.5 21.8 13.5 L21.8 18.2 H31.9 V19.9 H17.8 C17.8 19.9 11 19.1 11 29.6 C11 40.1 16.9 39.7 16.9 39.7 H20.4 V34.8 C20.4 34.8 20.2 28.9 26.2 28.9 H36.1 C36.1 28.9 41.7 29 41.7 23.5 V14.6 C41.7 14.6 42.6 9 31.6 9 Z"
            fill="#3776AB"
          />
          <circle cx="26.4" cy="14.3" r="1.9" fill="#FFFFFF" />
          {/* Official Python yellow bottom snake */}
          <path
            d="M32.4 55 C42.8 55 42.2 50.5 42.2 50.5 L42.2 45.8 H32.1 V44.1 H46.2 C46.2 44.1 53 44.9 53 34.4 C53 23.9 47.1 24.3 47.1 24.3 H43.6 V29.2 C43.6 29.2 43.8 35.1 37.8 35.1 H27.9 C27.9 35.1 22.3 35 22.3 40.5 V49.4 C22.3 49.4 21.4 55 32.4 55 Z"
            fill="#FFD43B"
          />
          <circle cx="37.6" cy="49.7" r="1.9" fill="#FFFFFF" />
        </g>
      );

    case 'cpp':
      return (
        <g>
          {/* Official ISO C++ 3-facet blue hexagon */}
          <path d="M32 6.5 L53.5 19 V44 L32 56.5 L10.5 44 V19 Z" fill="#00599C" />
          <path d="M32 6.5 L53.5 19 L32 31.5 L10.5 19 Z" fill="#659AD2" />
          <path d="M53.5 19 V44 L32 56.5 V31.5 Z" fill="#004482" />
          {/* Crisp white C ring */}
          <path
            d="M38.8 25.5 A10.5 10.5 0 1 0 38.8 37.5"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="5.4"
            strokeLinecap="butt"
          />
          {/* Twin ++ crosses */}
          <g stroke="#FFFFFF" strokeWidth="2.3" strokeLinecap="square">
            <line x1="39.5" y1="31.5" x2="45.1" y2="31.5" />
            <line x1="42.3" y1="28.7" x2="42.3" y2="34.3" />
            <line x1="47.2" y1="31.5" x2="52.8" y2="31.5" />
            <line x1="50" y1="28.7" x2="50" y2="34.3" />
          </g>
        </g>
      );

    case 'fastapi':
      return (
        <g>
          {/* Official FastAPI teal disc + crisp lightning bolt */}
          <circle cx="32" cy="32" r="24" fill="#009688" />
          <path d="M34.2 15.5 L20.2 35.2 H31.2 L29.4 48.5 L44.2 28.4 H33 Z" fill="#FFFFFF" />
        </g>
      );

    case 'postgresql':
      return (
        <g>
          {/* Official PostgreSQL Slonik elephant head emblem */}
          <path
            d="M44.5 13.5 C40.5 10.5 34.5 11.2 31.6 13.8 C28.4 11.2 22.8 10.6 18.6 14 C13.2 18.4 12.6 29.8 16.4 37.8 C18.5 42.1 22 44.2 24.4 42.6 C25.8 41.6 25.8 38.8 25.8 36.2 C27.2 37.8 29.2 39.2 31.8 39.4 C31.8 44.8 32.5 50.8 36.4 52.8 C39.5 54.4 42.4 51.8 42.4 48.4 C42.4 46.8 41.4 46 40.3 46.2 C39.2 46.4 38.8 47.8 37.6 47.6 C36.2 47.3 36.1 43.2 36.4 39.6 C41.6 39.4 46.2 35.2 48.4 29.6 C50.8 23.6 49.2 17 44.5 13.5 Z"
            fill="#336791"
            stroke="#FFFFFF"
            strokeWidth="2.1"
            strokeLinejoin="round"
          />
          {/* Ear contour & tusk */}
          <path
            d="M23.8 18.6 C18.8 20.4 17.5 28.2 20.6 34.2 M39.6 17.6 C44.6 19.6 46 26.8 43.2 32.2"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="1.9"
            strokeLinecap="round"
          />
          <path
            d="M27.6 34.8 C28.6 38.4 30.8 40.8 33.4 40.8"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <circle cx="29.4" cy="24.5" r="2.1" fill="#FFFFFF" />
          <circle cx="38.2" cy="24.5" r="2.1" fill="#FFFFFF" />
        </g>
      );

    case 'mongodb':
      return (
        <g>
          {/* Official MongoDB twin-tone green leaf + central vein */}
          <path
            d="M32 7.5 C32 7.5 18.5 19.2 18.5 34.5 C18.5 44.2 24.4 50.2 30.5 53.2 L32 56.5 V7.5 Z"
            fill="#58AA50"
          />
          <path
            d="M32 7.5 C32 7.5 45.5 19.2 45.5 34.5 C45.5 44.2 39.6 50.2 33.5 53.2 L32 56.5 V7.5 Z"
            fill="#439945"
          />
          <path d="M32 16.5 V55.5" stroke="#E8F5E9" strokeWidth="2.1" strokeLinecap="round" />
        </g>
      );

    case 'docker':
      return (
        <g>
          {/* Stacked Docker shipping containers */}
          <g fill="#2496ED">
            <rect x="25.5" y="16" width="5.2" height="4.8" rx="0.6" />
            <rect x="19.3" y="21.8" width="5.2" height="4.8" rx="0.6" />
            <rect x="25.5" y="21.8" width="5.2" height="4.8" rx="0.6" />
            <rect x="31.7" y="21.8" width="5.2" height="4.8" rx="0.6" />
            <rect x="13.1" y="27.6" width="5.2" height="4.8" rx="0.6" />
            <rect x="19.3" y="27.6" width="5.2" height="4.8" rx="0.6" />
            <rect x="25.5" y="27.6" width="5.2" height="4.8" rx="0.6" />
            <rect x="31.7" y="27.6" width="5.2" height="4.8" rx="0.6" />
            <rect x="37.9" y="27.6" width="5.2" height="4.8" rx="0.6" />
          </g>
          {/* Official Moby whale silhouette */}
          <path
            d="M55.5 32.8 C54.1 31.8 51.3 31.4 49 32 C48.7 29.8 47.4 27.9 45.6 26.8 L44.9 26.4 L44.5 27.1 C43.6 28.8 43.5 31.4 44.5 33.3 C43.2 34.1 40.9 34.5 38.6 34.5 H9.4 C8.8 39.2 10.2 44.8 14.2 48.2 C17.7 51.1 22.8 52.4 28.4 52.4 C41 52.4 50.4 46.5 54.6 36.2 C56.1 36.2 58.3 35.8 59.4 33.8 L59.6 33.4 Z"
            fill="#2496ED"
          />
          <circle cx="21.2" cy="42.4" r="1.8" fill="#FFFFFF" />
        </g>
      );

    case 'git':
      return (
        <g>
          {/* Official Git vermilion rotated diamond */}
          <rect
            x="15.5"
            y="15.5"
            width="33"
            height="33"
            rx="4.2"
            transform="rotate(45 32 32)"
            fill="#F05032"
          />
          {/* Branching commit graph */}
          <path
            d="M25.5 19.2 L32.2 25.9 V41.2 M32.2 26.8 L39.8 34.4"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          <circle cx="32.2" cy="26.4" r="3.6" fill="#FFFFFF" />
          <circle cx="32.2" cy="41.4" r="3.6" fill="#FFFFFF" />
          <circle cx="39.8" cy="34.4" r="3.6" fill="#FFFFFF" />
        </g>
      );
  }
}
