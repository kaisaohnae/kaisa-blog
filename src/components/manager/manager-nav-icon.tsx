type ManagerNavIconProps = {
  name: string;
  className?: string;
};

export default function ManagerNavIcon({name, className}: ManagerNavIconProps) {
  const props = {
    className,
    width: 18,
    height: 18,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };

  switch (name) {
    case 'dashboard':
      return (
        <svg {...props}>
          <rect x="3" y="3" width="8" height="8" rx="1.5" />
          <rect x="13" y="3" width="8" height="5" rx="1.5" />
          <rect x="13" y="10" width="8" height="11" rx="1.5" />
          <rect x="3" y="13" width="8" height="8" rx="1.5" />
        </svg>
      );
    case 'posts':
      return (
        <svg {...props}>
          <path d="M5 5h14v14H5z" />
          <path d="M8 9h8M8 12h8M8 15h5" />
        </svg>
      );
    case 'categories':
      return (
        <svg {...props}>
          <path d="M4 7h16M4 12h10M4 17h14" />
          <circle cx="18" cy="12" r="2.2" />
        </svg>
      );
    case 'write':
      return (
        <svg {...props}>
          <path d="M12 20h9" />
          <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
        </svg>
      );
    case 'members':
      return (
        <svg {...props}>
          <circle cx="9" cy="8" r="3" />
          <path d="M3 19c0-3 2.5-5 6-5s6 2 6 5" />
          <circle cx="17" cy="9" r="2.2" />
          <path d="M21 19c0-2.2-1.6-3.8-4-4.2" />
        </svg>
      );
    case 'users':
      return (
        <svg {...props}>
          <path d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4z" />
          <path d="M6 20v-1a6 6 0 0 1 12 0v1" />
          <path d="M19 8.5V6.8a1.8 1.8 0 1 0-3.6 0V8.5" />
          <path d="M17.2 8.5h3.6" />
        </svg>
      );
    case 'issues':
      return (
        <svg {...props}>
          <circle cx="11" cy="11" r="6.5" />
          <path d="M20 20l-3.5-3.5" />
          <path d="M8.7 11h4.6M11 8.7v4.6" />
        </svg>
      );
    case 'settings':
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="3" />
          <path d="M12 2v2.2M12 19.8V22M4.2 4.2l1.6 1.6M18.2 18.2l1.6 1.6M2 12h2.2M19.8 12H22M4.2 19.8l1.6-1.6M18.2 5.8l1.6-1.6" />
        </svg>
      );
    default:
      return (
        <svg {...props}>
          <circle cx="12" cy="12" r="2" />
        </svg>
      );
  }
}
