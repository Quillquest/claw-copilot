import { NextResponse } from 'next/server';
import { executeTrade } from '@/lib/tradeService';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { asset, decision, amount } = body;
    
    if (!asset || !decision || !amount) {
      return NextResponse.json({ success: false, error: 'Missing parameters' }, { status: 400 });
    }

    const result = await executeTrade(asset, decision, amount);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('API /trade error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
