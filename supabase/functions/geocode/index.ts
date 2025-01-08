import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const OPENCAGE_API_KEY = Deno.env.get('OPENCAGE_API_KEY')

serve(async (req) => {
  try {
    const { location, lat, lng, mode } = await req.json()
    
    let url: string;
    
    if (mode === 'reverse') {
      // Reverse geocoding
      url = `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=${OPENCAGE_API_KEY}&language=en&pretty=1`
    } else {
      // Forward geocoding
      url = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(location)}&key=${OPENCAGE_API_KEY}&language=en&pretty=1`
    }

    const response = await fetch(url)
    const data = await response.json()

    return new Response(
      JSON.stringify(data),
      { headers: { "Content-Type": "application/json" } },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    )
  }
})