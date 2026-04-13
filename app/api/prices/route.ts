import { NextResponse } from 'next/server';
import { fetchMarketData } from '@/lib/dataProvider';

export async function GET() {
  try {
    const data = await fetchMarketData();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('API /prices error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
