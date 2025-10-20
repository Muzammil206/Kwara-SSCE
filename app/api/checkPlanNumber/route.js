import { supabase } from '@/lib/supabaseClient'
import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const { planNumber } = await request.json()
    
    if (!planNumber) {
      return NextResponse.json(
        { error: 'Plan number is required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('pillar_applications')
      .select('plan_number')
      .eq('plan_number', planNumber)
      .maybeSingle()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      exists: !!data,
      valid: true
    })

  } catch (error) {
    console.error('Validation error:', error)
    return NextResponse.json(
      { error: 'Validation failed' },
      { status: 500 }
    )
  }
}
