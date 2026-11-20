// GET /api/places?q=Par  ->  { results: [{ id, name, region, countryCode, latitude, longitude }] }
// Used for search-as-you-type suggestions. Failures return an empty list (suggestions are optional).
import { searchCities } from "@/lib/weather";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const q = new URL(request.url).searchParams.get("q");
  try {
    const results = await searchCities(q);
    return Response.json({ results }, { headers: { "Cache-Control": "public, max-age=3600" } });
  } catch (err) {
    console.error("Unexpected /api/places error:", err);
    return Response.json({ results: [] }, { status: 200 });
  }
}
