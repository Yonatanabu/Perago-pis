import { NextResponse } from 'next/server';
import { positions, getNextId } from '../../../lib/mockDb';

export async function GET() {
  return NextResponse.json(positions);
}

export async function POST(request: Request) {
  const body = await request.json();
  const newPosition = { ...body, id: getNextId() };
  positions.push(newPosition);
  return NextResponse.json(newPosition, { status: 201 });
}
