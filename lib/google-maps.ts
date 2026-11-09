"use client";
// Loads the Google Maps JavaScript API once. Needs NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
// with "Maps JavaScript API" and "Places API (New)" enabled.
export const mapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "";

type Suggestion = {
  placePrediction?: { text: { text: string }; placeId: string };
};
type PlacesLibrary = {
  AutocompleteSessionToken: new () => object;
  AutocompleteSuggestion: {
    fetchAutocompleteSuggestions: (request: {
      input: string;
      sessionToken?: object;
      includedPrimaryTypes?: string[];
    }) => Promise<{ suggestions: Suggestion[] }>;
  };
};
let loading: Promise<PlacesLibrary> | null = null;

export function loadPlaces(): Promise<PlacesLibrary> {
  if (!mapsKey) return Promise.reject(new Error("No Google Maps key"));
  loading ??= new Promise<PlacesLibrary>((resolve, reject) => {
    const w = window as unknown as {
      google?: {
        maps?: { importLibrary?: (name: string) => Promise<unknown> };
      };
      __mapsReady?: () => void;
    };
    const ready = () =>
      w.google!.maps!.importLibrary!("places").then(
        (lib) => resolve(lib as PlacesLibrary),
        reject,
      );
    if (w.google?.maps?.importLibrary) return void ready();
    w.__mapsReady = ready;
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(mapsKey)}&loading=async&v=weekly&callback=__mapsReady`;
    script.async = true;
    script.onerror = () => {
      loading = null;
      reject(new Error("Google Maps failed to load"));
    };
    document.head.appendChild(script);
  });
  return loading;
}
export async function suggestPlaces(input: string, token: object) {
  const places = await loadPlaces();
  const { suggestions } =
    await places.AutocompleteSuggestion.fetchAutocompleteSuggestions({
      input,
      sessionToken: token,
      includedPrimaryTypes: [
        "locality",
        "administrative_area_level_1",
        "country",
        "sublocality",
      ],
    });
  return suggestions
    .map((item) => item.placePrediction)
    .filter((item): item is NonNullable<typeof item> => Boolean(item))
    .map((item) => ({ id: item.placeId, text: item.text.text }));
}
export async function newPlaceSession() {
  const places = await loadPlaces();
  return new places.AutocompleteSessionToken();
}
export const mapsLink = (place: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place)}`;
