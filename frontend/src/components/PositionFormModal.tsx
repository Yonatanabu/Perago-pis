"use client";
import React from 'react';
import { Modal, Stack, TextInput, Select, Button, Text } from '@mantine/core';

export default function PositionFormModal({ opened, onClose, modalMode, register, errors, setValue, handleSubmit, onSubmit, selectedPosition, parentOptions }: any) {
  return (
    <Modal 
      opened={opened} 
      onClose={onClose} 
      title={<Text fw={600} size="lg">{modalMode === 'add' ? 'Add New Position' : 'Edit Position'}</Text>}
      centered
      radius="md"
    >
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack>
          <TextInput
            label="Position Name"
            placeholder="e.g. Chief Executive Officer"
            withAsterisk
            {...register('name')}
            error={errors.name?.message}
          />
          <TextInput
            label="Description"
            placeholder="e.g. Head of the company"
            withAsterisk
            {...register('description')}
            error={errors.description?.message}
          />
          <Select
            label="Reports To (Parent Position)"
            placeholder="Select immediate manager (Leave blank for Root)"
            data={[{ value: '', label: 'None (Root Node)' }, ...parentOptions]}
            clearable
            searchable
            onChange={(val) => setValue('parentId', val || null)}
            defaultValue={selectedPosition?.parentId?.toString() ?? ''}
          />
          <Button type="submit" fullWidth mt="md" size="md" radius="md">
            {modalMode === 'add' ? 'Create Position' : 'Save Changes'}
          </Button>
        </Stack>
      </form>
    </Modal>
  );
}
