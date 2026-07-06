"use client";
import React from 'react';
import { Modal, Text, Group, Button } from '@mantine/core';

export default function ConfirmDeleteModal({ opened, onClose, performDelete, pendingDelete }: any) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={<Text fw={600} size="lg">Confirm Deletion</Text>}
      centered
      radius="md"
    >
      <Text>Are you sure you want to delete {pendingDelete?.name}?</Text>
      <Group style={{ justifyContent: 'flex-end', marginTop: 12 }}>
        <Button variant="default" onClick={onClose}>Cancel</Button>
        <Button color="red" onClick={performDelete}>Delete</Button>
      </Group>
    </Modal>
  );
}
