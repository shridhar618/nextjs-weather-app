// GET /api/weather?city=London        search by name (best match)
// GET /api/weather?id=2643743         exact place from /api/places
// GET /api/weather?lat=51.5&lon=-0.12 coordinates (e.g. browser geolocation)
// Success: 200 + weather JSON
// Errors:  400 (bad input), 404 (not found), 502 (upstream failure), 504 (timeout)
import { getWeatherForCity, getWeatherForCoords, getWeatherForPlaceId, WeatherError } from "@/lib/weather";

export const dynamic = "force-dynamic";

export async function GET(request) {
  const params = new URL(request.url).searchParams;

  try {
    let weather;
    if (params.has("id")) weather = await getWeatherForPlaceId(params.get("id"));
    else if (params.has("lat") || params.has("lon")) weather = await getWeatherForCoords(params.get("lat"), params.get("lon"));
    else weather = await getWeatherForCity(params.get("city"));

    return Response.json(weather, {
      headers: { "Cache-Control": "public, max-age=300" }, // let browsers reuse for 5 min
    });
  } catch (err) {
    if (err instanceof WeatherError) {
      return Response.json({ error: { title: err.title, message: err.message } }, { status: err.status });
    }
    console.error("Unexpected /api/weather error:", err);
    return Response.json(
      { error: { title: "Something went wrong", message: "We couldn't load the weather. Please try again." } },
      { status: 500 }
    );
  }
}
