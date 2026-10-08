import { notFound } from 'next/navigation';

/** Any path not matched by a page under [locale] is a real 404 (never a redirect home). */
export default function CatchAll() {
  notFound();
}
