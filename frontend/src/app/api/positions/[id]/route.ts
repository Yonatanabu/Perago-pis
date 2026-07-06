import { NextResponse } from 'next/server';
import { positions } from '../../../../lib/mockDb';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const id = String(params.id);
  const index = positions.findIndex(p => String(p.id) === id);
  if (index === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  
  const body = await request.json();
  positions[index] = { ...positions[index], ...body, id: positions[index].id };
  return NextResponse.json(positions[index]);
}

export async function PATCH(request: Request, context: { params: { id: string } }) {
  return PUT(request, context);
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const id = String(params.id);
  const target = positions.find(p => String(p.id) === id);
  if (!target) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  const idsToDelete = new Set<string>([id]);
  let changed = true;

  while (changed) {
    changed = false;
    for (const position of positions) {
      if (position.parentId !== null && idsToDelete.has(String(position.parentId)) && !idsToDelete.has(String(position.id))) {
        idsToDelete.add(String(position.id));
        changed = true;
      }
    }
  }

  for (let index = positions.length - 1; index >= 0; index -= 1) {
    if (idsToDelete.has(String(positions[index].id))) {
      positions.splice(index, 1);
    }
  }

  return NextResponse.json({ success: true });
}
