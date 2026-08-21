type IconProps = {
  className?: string;
};

export function CategoryFolderClosedIcon({className}: IconProps) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 20 20" aria-hidden="true">
      <path
        d="M2.5 6.2h5.1l1.4 1.6H17.5v8.7a1.4 1.4 0 0 1-1.4 1.4H3.9a1.4 1.4 0 0 1-1.4-1.4V6.2Z"
        fill="#ebe8e1"
        stroke="#2c4a3e"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path
        d="M2.5 6.2V4.8c0-.7.6-1.3 1.3-1.3h4.2l1.4 2.7"
        fill="#d8e4de"
        stroke="#2c4a3e"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CategoryFolderOpenIcon({className}: IconProps) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 20 20" aria-hidden="true">
      <path
        d="M2.4 7.2h6.2l1.2-1.6H16.8V4.8c0-.7-.6-1.3-1.3-1.3H8.8L7.5 2.2H3.7c-.7 0-1.3.6-1.3 1.3v3.7Z"
        fill="#d8e4de"
        stroke="#2c4a3e"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path
        d="M3.2 8.4h13.6l-1.6 8.2H4.8L3.2 8.4Z"
        fill="#fffcf7"
        stroke="#2c4a3e"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function CategoryFileIcon({className}: IconProps) {
  return (
    <svg className={className} width="18" height="18" viewBox="0 0 20 20" aria-hidden="true">
      <path
        d="M5.2 2.6h6.2L15.8 7v10.2c0 .7-.6 1.2-1.2 1.2H5.2c-.7 0-1.2-.5-1.2-1.2V3.8c0-.7.5-1.2 1.2-1.2Z"
        fill="#f7f3ea"
        stroke="#8b5a2b"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path d="M11.4 2.8V7h4.2" fill="none" stroke="#8b5a2b" strokeWidth="1.3" strokeLinejoin="round" />
      <path d="M7 10.2h6.2M7 13h4.4" fill="none" stroke="#8b5a2b" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}
