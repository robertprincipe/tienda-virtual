import { SiteLayoutTemplate } from './site/site-shell-layout';

export default function SiteLayout({
  children,
  ...props
}: {
  children: React.ReactNode;
}) {
  return <SiteLayoutTemplate {...props}>{children}</SiteLayoutTemplate>;
}
