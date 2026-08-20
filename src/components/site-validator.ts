'use client';

import {useEffect} from 'react';
import {useRouter} from '@/hooks/use-custom-router';

type Props = {
  onReady: () => void;
};

export default function SiteValidator({onReady}: Props) {
  const router = useRouter();

  useEffect(() => {
    const refresh = async () => {
      try {
        onReady();
      } catch (error) {
        console.error('Error fetching data:', error);
        router.push({
          pathname: '/error',
          query: {cd: 'fetch-error'},
        });
      }
    };
    refresh().then();
  }, [onReady, router]);

  return null;
}
