import { NextResponse } from 'next/server';
import { mockCourses } from '@/lib/mockData';

export async function GET() {
  return NextResponse.json(mockCourses);
}
