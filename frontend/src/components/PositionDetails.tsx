"use client";
import React from 'react';
import { Card, Group, Title, ActionIcon, Divider, Stack, Box, Text } from '@mantine/core';
import { IconX } from '@tabler/icons-react';

export default function PositionDetails({ activePosition, positions, onClose }: any) {
  if (!activePosition) return null;

  const subordinates = positions.filter((p: any) => p.parentId === activePosition.id);

  return (
    <Card shadow="sm" p="lg" radius="md" withBorder>
      <Group justify="space-between" mb="sm">
        <Title order={4}>Role Details</Title>
        <ActionIcon variant="subtle" color="gray" onClick={onClose}>
          <IconX size={16} />
        </ActionIcon>
      </Group>
      <Divider mb="md" />
      <Stack gap="sm">
        <Box>
          <Text size="sm" fw={600} c="dimmed">Role Name</Text>
          <Text size="md" fw={500}>{activePosition.name}</Text>
        </Box>
        <Box>
          <Text size="sm" fw={600} c="dimmed">Description</Text>
          <Text size="sm">{activePosition.description}</Text>
        </Box>
        <Box>
          <Text size="sm" fw={600} c="dimmed">Subordinates</Text>
          {subordinates.length > 0 ? (
            <Box mt={4} pl={8} style={{ borderLeft: '2px solid #e9ecef' }}>
              {subordinates.map((sub: any) => (
                <Text key={sub.id} size="sm" mb={4}>{sub.name}</Text>
              ))}
            </Box>
          ) : (
            <Text size="sm">None</Text>
          )}
        </Box>
        <Box>
          <Text size="sm" fw={600} c="dimmed">Parent Role</Text>
          <Text size="sm">{activePosition.parentId ? positions.find((p: any) => p.id === activePosition.parentId)?.name || 'Unknown' : 'None (Root Node)'}</Text>
        </Box>
      </Stack>
    </Card>
  );
}
