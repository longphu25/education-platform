import { NextResponse } from 'next/server';
import { mockTransactions } from '@/lib/mockData';

export async function GET() {
  return NextResponse.json(mockTransactions);
}
