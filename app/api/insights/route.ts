import { NextResponse } from 'next/server';
import { fetchBroadMarket } from '@/lib/dataProvider';
import { generateInsights } from '@/lib/aiService';

export async function GET() {
  try {
    const marketData = await fetchBroadMarket();
    const insights = await generateInsights(marketData);

    return NextResponse.json({ success: true, data: insights });
  } catch (error) {
    console.error('Insights API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
