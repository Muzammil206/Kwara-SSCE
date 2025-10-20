import { supabase } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';

// Per hectare rates for properties >500,000 sqm
const LARGE_PROPERTY_RATES = {
  'SCHEDULE A': { residential: 8000, commercial: 12000 },
  'SCHEDULE B': { residential: 12000, commercial: 19000 },
  'SCHEDULE C': { residential: 16000, commercial: 25000 },
  'SCHEDULE D': { residential: 60000, commercial: 90000 }
};

const THRESHOLD_SIZE = 500000; // 500,000 sqm threshold

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const area = searchParams.get('area');
  const schedule = searchParams.get('schedule');

  // Validate inputs
  if (!area || !schedule) {
    return NextResponse.json(
      { error: 'Both area and schedule parameters are required' },
      { status: 400 }
    );
  }

  const areaNumber = parseFloat(area);
  if (isNaN(areaNumber)) {
    return NextResponse.json(
      { error: 'Area must be a valid number' },
      { status: 400 }
    );
  }

  const formattedSchedule = `SCHEDULE ${schedule.toUpperCase().charAt(0)}`;
  const validSchedules = Object.keys(LARGE_PROPERTY_RATES);
  
  if (!validSchedules.includes(formattedSchedule)) {
    return NextResponse.json(
      { error: 'Invalid schedule. Must be one of: A, B, C, or D' },
      { status: 400 }
    );
  }

  try {
    // For properties ≤ threshold size
    if (areaNumber <= THRESHOLD_SIZE) {
      const { data, error } = await supabase
        .from('payment_fees_zone')
        .select('*')
        .eq('schedule', formattedSchedule)
        .lte('size_min', areaNumber)
        .gte('size_max', areaNumber)
        .single();

      if (error) throw error;
      if (data) return NextResponse.json(data, { status: 200 });
    }
    // For properties > threshold size (custom calculation)
    else {
      // 1. Get the last available fee for 500,000 sqm
      const { data: baseFeeData, error: baseFeeError } = await supabase
        .from('payment_fees_zone')
        .select('*')
        .eq('schedule', formattedSchedule)
        .lte('size_max', THRESHOLD_SIZE)
        .order('size_max', { ascending: false })
        .limit(1)
        .single();

      if (baseFeeError) throw baseFeeError;
      if (!baseFeeData) {
        return NextResponse.json(
          { error: 'Base fee data not found' },
          { status: 404 }
        );
      }

      // 2. Calculate additional fee
      const additionalArea = areaNumber - THRESHOLD_SIZE;
      const additionalHectares = additionalArea / 10000; // Convert sqm to hectares
      const rates = LARGE_PROPERTY_RATES[formattedSchedule];
      
      // 3. Calculate total fees
      const residentialFee = baseFeeData.residential_survey_fee + 
                           (rates.residential * additionalHectares);
      const commercialFee = baseFeeData.commercial_survey_fee + 
                          (rates.commercial * additionalHectares);

      return NextResponse.json({
        ...baseFeeData,
        size_range: `More Than ${THRESHOLD_SIZE.toLocaleString()} (Calculated)`,
        size_min: THRESHOLD_SIZE,
        size_max: null,
        residential_survey_fee: Math.round(residentialFee),
        commercial_survey_fee: Math.round(commercialFee),
        is_calculated: true,
        base_fee: baseFeeData,
        additional_hectares: additionalHectares,
        additional_rate: rates
      }, { status: 200 });
    }

    return NextResponse.json(
      { error: 'No matching fee found' },
      { status: 404 }
    );

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}