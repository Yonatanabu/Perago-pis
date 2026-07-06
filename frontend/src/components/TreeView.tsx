"use client";
import React, { useMemo } from 'react';
import { Box, Text } from '@mantine/core';
import { Position } from '../store/positionsSlice';

// Simple TreeView demo: converts flat positions -> nested tree and renders it.
export default function TreeView({ positions }: { positions: Position[] }) {
  const tree = useMemo(() => {
    const buildTree = (parentId: string | null): any[] => {
      return positions
        .filter(p => p.parentId === parentId)
        .map(p => ({ ...p, children: buildTree(p.id) }));
    };
    return buildTree(null);
  }, [positions]);

  const renderNodes = (nodes: any[], level = 0) => (
    <ul style={{ paddingLeft: level === 0 ? 8 : 18, marginTop: 6 }}>
      {nodes.map(node => (
        <li key={node.id}>
          <Text size="sm"><strong>{node.name}</strong> <span style={{ color: '#666' }}>({node.id})</span></Text>
          {node.children && node.children.length > 0 && renderNodes(node.children, level + 1)}
        </li>
      ))}
    </ul>
  );

  return (
    <Box>
      <Text fw={600} mb={6}>TreeView demo (built from flat positions)</Text>
      {tree.length > 0 ? renderNodes(tree) : <Text c="dimmed">No positions</Text>}
    </Box>
  );
}
