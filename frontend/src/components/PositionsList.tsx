"use client";
import React, { useState } from 'react';
import { Box, Paper, Group, ActionIcon, Text, Badge, Collapse } from '@mantine/core';
import { IconChevronDown, IconChevronRight, IconEdit, IconTrash, IconUser } from '@tabler/icons-react';
import { Position } from '@/store/positionsSlice';

type TreeNode = Position & { children?: TreeNode[] };

type Props = {
  nodes?: TreeNode[];
  handleOpenModal: (mode: 'add' | 'edit', node?: Position) => void;
  openConfirmDelete: (id: string, name: string) => void;
  setViewedPositionId: (id: string) => void;
  viewedPositionId?: string | null;
};

function PositionsList({ nodes = [], handleOpenModal, openConfirmDelete, setViewedPositionId, viewedPositionId }: Props) {
  const [collapsedNodes, setCollapsedNodes] = useState<Record<string, boolean>>({});
  const toggleCollapse = (id: string) => setCollapsedNodes(prev => ({ ...prev, [id]: !prev[id] }));

  const renderTree = (nodesLocal: any[], level = 0) => {
    return nodesLocal.map(node => (
      <Box key={node.id} ml={level > 0 ? 24 : 0} mt="sm">
        <Paper 
          withBorder 
          p="sm" 
          radius="md" 
          shadow="sm" 
          className={`hover:shadow-md cursor-pointer role-card ${viewedPositionId === node.id ? 'active-role' : ''}`}
          onClick={() => setViewedPositionId(node.id)}
        >
          <Group justify="space-between">
            <Group>
              {node.children && node.children.length > 0 ? (
                <ActionIcon variant="subtle" onClick={(e) => { e.stopPropagation(); toggleCollapse(node.id); }}>
                  {collapsedNodes[node.id] ? <IconChevronRight size={16} /> : <IconChevronDown size={16} />}
                </ActionIcon>
              ) : (
                <Box style={{ width: 28 }} />
              )}
              <IconUser size={20} className={viewedPositionId === node.id ? 'text-blue-600' : 'text-gray-500'} />
              <Text fw={600} size="lg" c={viewedPositionId === node.id ? 'blue.7' : undefined}>{node.name}</Text>
              <Badge color="blue" variant="light">{node.children?.length || 0} Subordinates</Badge>
              <Text size="sm" c="dimmed" fs="italic">- {node.description}</Text>
            </Group>
            <Group gap="xs" onClick={(e) => e.stopPropagation()}>
              <ActionIcon variant="light" color="blue" onClick={() => handleOpenModal('edit', node)} aria-label="Edit">
                <IconEdit size={16} />
              </ActionIcon>
              <ActionIcon variant="light" color="red" onClick={() => openConfirmDelete(node.id, node.name)} aria-label="Delete">
                <IconTrash size={16} />
              </ActionIcon>
            </Group>
          </Group>
        </Paper>
        {node.children && node.children.length > 0 && (
          <Collapse in={!collapsedNodes[node.id]}>
            <Box style={{ borderLeft: '2px dashed #e9ecef', paddingLeft: 12, marginTop: 8, marginLeft: 12 }}>
              {renderTree(node.children, level + 1)}
            </Box>
          </Collapse>
        )}
      </Box>
    ));
  };

  return <div>{renderTree(nodes)}</div>;
}

export default React.memo(PositionsList);
