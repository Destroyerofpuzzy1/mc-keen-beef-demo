import { headers } from 'next/headers';
import { jsonLd } from '@/lib/seo';

/** JSON-LD script carrying the per-request CSP nonce. Data comes only from our own content. */
export async function JsonLd({ data }: { data: unknown }) {
  const nonce = (await headers()).get('x-nonce') ?? undefined;
  return <script type="application/ld+json" nonce={nonce} dangerouslySetInnerHTML={{ __html: jsonLd(data) }} />;
}
