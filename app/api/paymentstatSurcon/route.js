// app/api/parcels/route.js
import { NextResponse } from "next/server"
import { supabase } from "@/lib/supabaseClient";

export async function GET(req) {
  
  // Get user_id and optional parcelId from query string
  const { searchParams } = new URL(req.url);
  const user_id = searchParams.get("user_id");
  const parcelId = searchParams.get("parcelId");


  let query = supabase
   .from(
'surcon_pillar_application'
)
.select(
`
      id,
      application_id,

      pillar_applications!inner(
        paid_amount,
        pillar_payment_fee,
        mds_fee
      )
    `
)


  const { data, error } = await query;
  if (error) return NextResponse.json({ error }, { status: 500 });

  
  const StatSUmmary = {
   
    total_applications: data.length,
    total_revenue: data.reduce((sum, app) => sum + (app.pillar_applications?.paid_amount || 0), 0),
    
    total_pillar_payment_fees: data.reduce((sum, app) => sum + (app.pillar_applications?.pillar_payment_fee || 0), 0),
  };

  return NextResponse.json(StatSUmmary);
}
