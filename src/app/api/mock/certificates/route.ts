import { NextResponse } from 'next/server';
import { mockCertificates } from '@/lib/mockData';

export async function GET() {
  return NextResponse.json(mockCertificates);
}
