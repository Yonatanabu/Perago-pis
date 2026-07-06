export const positions = [
  { id: 1, name: 'CEO', description: 'Chief Executive Officer', parentId: null },
  { id: 2, name: 'CTO', description: 'Chief Technology Officer', parentId: 1 },
  { id: 3, name: 'CFO', description: 'Chief Finance Officer', parentId: 1 },
  { id: 4, name: 'Project Manager', description: 'PM', parentId: 2 },
  { id: 5, name: 'Product Owner', description: 'PO', parentId: 4 },
];

export const getNextId = () => {
  return positions.length > 0 ? Math.max(...positions.map(p => p.id)) + 1 : 1;
};
