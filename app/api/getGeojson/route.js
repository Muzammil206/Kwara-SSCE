// app/api/parcels/route.js
import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient";


export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const parcelId = searchParams.get("id");

  let query = supabase
    .from("pillar_applications")
    .select("id,  area, geom, pillar_type, client_address, lga, client_name, plan_number, surveyor_name, status, payment_status");

  if (parcelId) {
    query = query.eq("id", parcelId);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error }, { status: 500 });

  // Convert to GeoJSON
  const geojson = {
    type: "FeatureCollection",
    features: data.map((row) => ({
      type: "Feature",
      geometry: row.geom,
      properties: { id: row.id, pillar_type: row.pillar_type, client_address: row.client_address, lga: row.lga, client_name: row.client_name, plan_number: row.plan_number, area: row.area, surveyor_name: row.surveyor_name, status: row.status, payment_status: row.payment_status  },
    })),
  };

  return NextResponse.json(geojson);
}
