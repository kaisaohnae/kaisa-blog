'use client';

import {usePathname} from 'next/navigation';
import {useEffect, useState} from 'react';

export function useMobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return {
    open,
    toggle: () => setOpen((value) => !value),
    close: () => setOpen(false),
  };
}
