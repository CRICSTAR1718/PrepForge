// Placement prep themed doodles component
export function PlacementDoodles() {
  return (
    <svg
      className="fixed inset-0 w-full h-full pointer-events-none opacity-5 dark:opacity-3"
      viewBox="0 0 1200 800"
      preserveAspectRatio="none"
    >
      {/* Resume doodle */}
      <g transform="translate(100, 100)">
        <rect x="0" y="0" width="80" height="100" fill="none" stroke="currentColor" strokeWidth="2" rx="4" />
        <line x1="10" y1="15" x2="70" y2="15" stroke="currentColor" strokeWidth="1.5" />
        <line x1="10" y1="25" x2="70" y2="25" stroke="currentColor" strokeWidth="1.5" />
        <line x1="10" y1="40" x2="60" y2="40" stroke="currentColor" strokeWidth="1.5" />
        <line x1="10" y1="50" x2="60" y2="50" stroke="currentColor" strokeWidth="1.5" />
        <line x1="10" y1="60" x2="55" y2="60" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="70" cy="80" r="8" fill="none" stroke="currentColor" strokeWidth="1.5" />
      </g>

      {/* Interview/chat bubble doodle */}
      <g transform="translate(950, 150)">
        <path
          d="M 0 0 L 80 0 L 80 60 L 20 60 L 10 75 L 20 60 L 0 60 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
        <circle cx="15" cy="25" r="3" fill="currentColor" />
        <circle cx="30" cy="25" r="3" fill="currentColor" />
        <circle cx="45" cy="25" r="3" fill="currentColor" />
      </g>

      {/* Laptop/coding doodle */}
      <g transform="translate(150, 650)">
        <rect x="0" y="0" width="90" height="60" fill="none" stroke="currentColor" strokeWidth="2" rx="3" />
        <rect x="5" y="5" width="80" height="45" fill="none" stroke="currentColor" strokeWidth="1" />
        <line x1="0" y1="60" x2="45" y2="75" stroke="currentColor" strokeWidth="2" />
        <line x1="90" y1="60" x2="45" y2="75" stroke="currentColor" strokeWidth="2" />
        <circle cx="45" cy="75" r="2" fill="currentColor" />
      </g>

      {/* Target/Goal doodle */}
      <g transform="translate(1050, 650)">
        <circle cx="30" cy="30" r="25" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="30" cy="30" r="17" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="30" cy="30" r="9" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="30" cy="30" r="3" fill="currentColor" />
      </g>

      {/* Award/Trophy doodle */}
      <g transform="translate(550, 100)">
        <path
          d="M 10 0 L 50 0 L 50 30 Q 50 40 40 40 L 30 40 L 30 50 L 20 50 L 20 40 Q 10 40 10 30 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        />
        <rect x="15" y="30" width="30" height="3" fill="currentColor" />
      </g>

      {/* Checkmark doodle */}
      <g transform="translate(300, 300)">
        <path
          d="M 5 25 L 15 35 L 40 10"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </g>

      {/* Lightbulb/Idea doodle */}
      <g transform="translate(900, 400)">
        <circle cx="20" cy="15" r="12" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M 15 27 L 15 35 M 25 27 L 25 35 M 12 35 L 28 35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M 18 25 Q 20 28 22 25" fill="currentColor" />
      </g>

      {/* Chart/Growth doodle */}
      <g transform="translate(200, 500)">
        <polyline
          points="0,40 15,30 30,35 45,15 60,25 75,10"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <line x1="0" y1="45" x2="75" y2="45" stroke="currentColor" strokeWidth="1.5" />
        <line x1="0" y1="0" x2="0" y2="45" stroke="currentColor" strokeWidth="1.5" />
      </g>

      {/* Handshake doodle */}
      <g transform="translate(750, 250)">
        <path d="M 5 15 Q 15 5 25 15 Q 35 5 45 15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M 5 25 L 15 20 M 45 25 L 35 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <line x1="15" y1="20" x2="35" y2="20" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      </g>

      {/* Brain/Learning doodle */}
      <g transform="translate(600, 600)">
        <circle cx="20" cy="15" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="20" cy="30" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="35" cy="22" r="6" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <line x1="20" y1="21" x2="20" y2="24" stroke="currentColor" strokeWidth="1.5" />
        <line x1="26" y1="19" x2="29" y2="19" stroke="currentColor" strokeWidth="1.5" />
      </g>

      {/* Rocket doodle */}
      <g transform="translate(450, 200)">
        <path d="M 20 0 L 25 20 L 30 40 L 10 40 L 15 20 Z" fill="none" stroke="currentColor" strokeWidth="2" />
        <circle cx="20" cy="15" r="4" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M 10 35 L 0 45 L 5 40 Z" fill="currentColor" />
        <path d="M 30 35 L 40 45 L 35 40 Z" fill="currentColor" />
      </g>
    </svg>
  );
}
