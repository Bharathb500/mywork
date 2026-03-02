import { fetchPlaceholders } from '../../scripts/placeholders.js';

export default async function decorate(block) {
  const locale = document.documentElement.lang || 'en';
  const placeholders = await fetchPlaceholders(locale);
  const { currency } = placeholders;
  console.log('Currency:', currency);
  block.innerHTML = '';
  block.innerHTML = `<p>Currency placeholder for locale "${locale}": ${currency || 'N/A'}</p>`;
}
