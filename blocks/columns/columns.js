import { fetchPlaceholders } from "../../scripts/placeholders";

export default async function decorate(block) {
  const placeholders = await fetchPlaceholders('en');
  console.log('Placeholders:', placeholders);
}
