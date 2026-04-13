import { NextResponse } from 'next/server';

export async function POST() {
  // This endpoint was intentionally deprecated during the hackathon pivot 
  // from a "Trade Execution" platform to an "AI Marketing Intelligence" dashboard.
  return NextResponse.json(
    { success: false, message: 'Trade execution deprecated in favor of market guidance pivot.' },
    { status: 400 }
  );
}
