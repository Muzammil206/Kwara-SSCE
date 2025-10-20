import { supabase } from '@/lib/supabaseClient';
import { NextResponse } from 'next/server';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const plots = searchParams.get('plots');
  const schedule = searchParams.get('schedule');

  // Validate inputs
  if (!plots || !schedule) {
    return NextResponse.json(
      { error: 'Both plots and schedule parameters are required' },
      { status: 400 }
    );
  }

  const plotNumber = parseInt(plots);
  if (isNaN(plotNumber)) {
    return NextResponse.json(
      { error: 'Plots must be a valid number' },
      { status: 400 }
    );
  }

  const scheduleUpper = schedule.toUpperCase();
  if (!['A', 'B', 'C', 'D'].includes(scheduleUpper)) {
    return NextResponse.json(
      { error: 'Invalid schedule. Must be one of: A, B, C, or D' },
      { status: 400 }
    );
  }

  try {
    // Get all rows sorted by min_plots
    const { data, error } = await supabase
      .from('layout_quotations')
      .select('*')
      .order('min_plots', { ascending: true });

    if (error) throw error;

    // Find matching row
    const matchingRow = data.find(row => 
      plotNumber >= row.min_plots && 
      (row.max_plots === null || plotNumber <= row.max_plots)
    );

    // NEW: Check if plot number exceeds maximum range
    const maxPlotRange = data[data.length - 1];
    if (!matchingRow && maxPlotRange && plotNumber > maxPlotRange.min_plots) {
      return NextResponse.json(
        { 
          error: `Plot count exceeds maximum available range (${maxPlotRange.min_plots}+ plots)`,
          maximum_available_plots: maxPlotRange.min_plots
        },
        { status: 400 }
      );
    }

    if (!matchingRow) {
      return NextResponse.json(
        { error: 'No pricing data available for the specified plot count' },
        { status: 404 }
      );
    }

    // Get the price for the selected schedule
    const priceColumn = `schedule_${scheduleUpper.toLowerCase()}`;
    const price = matchingRow[priceColumn];

    if (price === undefined) {
      return NextResponse.json(
        { error: 'Schedule price not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      plots: plotNumber,
      schedule: scheduleUpper,
      price: price,
      mandatory_deposit: matchingRow.mandatory_deposit,
      price_range: {
        min_plots: matchingRow.min_plots,
        max_plots: matchingRow.max_plots
      }
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}