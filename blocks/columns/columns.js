import { fetchPlaceholders } from '../../scripts/placeholders.js';

export default async function decorate() {
  const placeholders = await fetchPlaceholders('en');
  console.log('Placeholders:', placeholders);
}
