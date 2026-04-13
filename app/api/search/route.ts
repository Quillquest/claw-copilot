import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');
  
  if (!q) {
    return NextResponse.json({ coins: [] });
  }

  try {
    const res = await fetch(`https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(q)}`);
    const data = await res.json();
    return NextResponse.json({ coins: data.coins?.slice(0, 5) || [] }); // Return top 5 results securely
  } catch (error) {
    console.error('Search API Error:', error);
    return NextResponse.json({ coins: [] }, { status: 500 });
  }
}
