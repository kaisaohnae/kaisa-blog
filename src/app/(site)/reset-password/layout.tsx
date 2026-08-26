import {buildPageMetadata} from '@/lib/seo';

export const metadata = buildPageMetadata({
  title: 'Reset password',
  description: 'Reset your Kaisa Blog password.',
  path: '/reset-password/',
});

export default function ResetPasswordLayout({children}: {children: React.ReactNode}) {
  return children;
}
