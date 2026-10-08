import 'server-only';
import type { CareersApplication, Enquiry } from '@/lib/validation/forms';
import { enquiryProductLabel } from '@/content/products';
import { jobs } from '@/content/jobs';

/** Escapes user input for HTML e-mail bodies. */
export const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

type Row = [label: string, value: string];

function render(title: string, rows: Row[], footer: string): { text: string; html: string } {
  const visible = rows.filter(([, v]) => v);
  const text = [title, '', ...visible.map(([k, v]) => `${k}:\n${v}\n`), '--', footer].join('\n');
  const html =
    `<!doctype html><html><body style="font-family:Arial,sans-serif;font-size:14px;color:#26211e">` +
    `<h2 style="margin:0 0 16px">${escapeHtml(title)}</h2><table cellpadding="6" style="border-collapse:collapse">` +
    visible
      .map(
        ([k, v]) =>
          `<tr><th align="left" valign="top" style="border-bottom:1px solid #ddd;white-space:nowrap">${escapeHtml(k)}</th>` +
          `<td style="border-bottom:1px solid #ddd;white-space:pre-wrap">${escapeHtml(v)}</td></tr>`,
      )
      .join('') +
    `</table><p style="color:#777;font-size:12px;margin-top:24px">${escapeHtml(footer)}</p></body></html>`;
  return { text, html };
}

const formLabel = { chilled: 'chłodzony', frozen: 'mrożony', unknown: 'nie wiem', '': '' } as const;
const topicLabel = { products: 'Produkty', sales: 'Sprzedaż i eksport', cooperation: 'Współpraca', other: 'Inne' } as const;

export function enquiryEmail(e: Enquiry, id: string) {
  const subject = `Zapytanie (${topicLabel[e.topic]}): ${e.company} (${e.country}) [${id}]`;
  const body = render(
    'Nowe zapytanie ofertowe ze strony mckeen-beef.eu',
    [
      ['Czego dotyczy zapytanie', topicLabel[e.topic]],
      ['Firma', e.company],
      ['Osoba kontaktowa', e.person],
      ['Kraj', e.country],
      ['E-mail', e.email],
      ['Telefon', e.phone],
      ['NIP / VAT ID', e.vat],
      ['Interesuje mnie', e.products.map((p) => enquiryProductLabel[p].pl).join(', ')],
      ['Produkt', formLabel[e.productForm]],
      ['Zapotrzebowanie / częstotliwość', e.volume],
      ['Wiadomość', e.message],
      ['Wersja językowa formularza', e.locale.toUpperCase()],
      ['Zgoda na przetwarzanie danych', 'tak'],
    ],
    `ID zgłoszenia ${id}. Odpowiedź trafi na adres nadawcy (Reply-To).`,
  );
  return { subject, ...body };
}

export function careersEmail(a: CareersApplication, id: string, hasCv: boolean) {
  const job = jobs.find((j) => j.id === a.position);
  const position = job ? job.title.pl : 'Inne stanowisko';
  const subject = `Zgłoszenie rekrutacyjne: ${position} [${id}]`;
  const body = render(
    'Nowe zgłoszenie rekrutacyjne ze strony mckeen-beef.eu',
    [
      ['Imię i nazwisko', a.name],
      ['Telefon', a.phone],
      ['E-mail', a.email],
      ['Stanowisko', position],
      ['Wiadomość', a.message],
      ['CV', hasCv ? 'w załączniku (plik przesłany przez kandydata, otwieraj zgodnie z zasadami bezpieczeństwa poczty)' : 'brak'],
      ['Wersja językowa formularza', a.locale.toUpperCase()],
      ['Zgoda rekrutacyjna', 'tak'],
    ],
    `ID zgłoszenia ${id}. Strona nie przechowuje danych ani plików CV.`,
  );
  return { subject, ...body };
}
