/** Display only the city name; keep complete IANA identifiers for time calculations and storage. */
export function timezoneCityLabel(zone:string):string {
 const name=zone.split('/').at(-1)?.trim() || zone.trim();
 return name.replaceAll('_',' ');
}
/** Older saved profiles may have city, province, country in their name field. */
export function placeCityLabel(place:string):string {
 return place.split(',')[0]?.trim() || place.trim();
}
