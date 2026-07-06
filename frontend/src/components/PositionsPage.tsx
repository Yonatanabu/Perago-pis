"use client";
import React, { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPositions, addPosition, updatePosition, deletePosition, Position, addLocalPosition, updateLocalPosition, removeLocalPosition, replaceTempPosition } from '../store/positionsSlice';
import { RootState, AppDispatch } from '../store/store';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { Button, Card, Group, Text, Box, Divider, Title } from '@mantine/core';
import { IconSun, IconMoon, IconCheck } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import dynamic from 'next/dynamic';
const PositionsList = dynamic(() => import('@/components/PositionsList'), { ssr: false });
const PositionDetails = dynamic(() => import('@/components/PositionDetails'), { ssr: false });
const PositionFormModal = dynamic(() => import('@/components/PositionFormModal'), { ssr: false });
const ConfirmDeleteModal = dynamic(() => import('@/components/ConfirmDeleteModal'), { ssr: false });
const AuditLogPanel = dynamic(() => import('@/components/AuditLogPanel'), { ssr: false });
import { useMantineColorScheme } from '@mantine/core';

const schema = yup.object({
  name: yup.string().required('Position name is required'),
  description: yup.string().required('Description is required'),
  parentId: yup.string().nullable().transform((value, originalValue) => (originalValue === '' ? null : value)).notRequired(),
}).required();

type FormData = yup.InferType<typeof schema>;

export default function PositionsPage() {
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const [mounted, setMounted] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const { data: positions, status } = useSelector((state: RootState) => state.positions);

  const [selectedPosition, setSelectedPosition] = useState<Position | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [viewedPositionId, setViewedPositionId] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<{ id: string; name: string } | null>(null);

  useEffect(() => {
    if (status === 'idle') dispatch(fetchPositions());
  }, [status, dispatch]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<any>({
    resolver: yupResolver(schema),
    defaultValues: { name: '', description: '', parentId: null }
  });

  const handleOpenModal = (mode: 'add' | 'edit', position?: Position) => {
    setModalMode(mode);
    if (mode === 'edit' && position) {
      setSelectedPosition(position);
      setValue('name', position.name);
      setValue('description', position.description);
      setValue('parentId', position.parentId);
    } else {
      setSelectedPosition(null);
      reset({ name: '', description: '', parentId: null });
    }
    setIsModalOpen(true);
  };

  const onSubmit = async (data: FormData) => {
    if (modalMode === 'add') {
      const tempId = `temp-${Date.now()}`;
      const tempPos: Position = { id: tempId, name: data.name, description: data.description, parentId: data.parentId ?? null };
      dispatch(addLocalPosition(tempPos));
      setIsModalOpen(false);
      reset();
      try {
        const resultAction = await dispatch(addPosition({ name: data.name, description: data.description, parentId: data.parentId ?? null }));
        const real = (resultAction as any).payload;
        dispatch(replaceTempPosition({ tempId, realPosition: real }));
        notifications.show({ title: 'Position Added', message: `Successfully created ${data.name}.`, color: 'teal', icon: <IconCheck size={16} /> });
      } catch (err: any) {
        dispatch(removeLocalPosition(tempId));
        const msg = typeof err === 'string' ? err : (err?.message || 'Failed to create position');
        notifications.show({ title: 'Error', message: msg, color: 'red' });
      }
      return;
    }

    if (modalMode === 'edit' && selectedPosition) {
      const old = { ...selectedPosition };
      const updated: Position = { id: selectedPosition.id, name: data.name, description: data.description, parentId: data.parentId ?? null };
      dispatch(updateLocalPosition(updated));
      setIsModalOpen(false);
      reset();
      try {
        await dispatch(updatePosition(updated)).unwrap();
        notifications.show({ title: 'Position Updated', message: `Successfully updated ${data.name}.`, color: 'teal', icon: <IconCheck size={16} /> });
      } catch (err: any) {
        dispatch(updateLocalPosition(old));
        const msg = typeof err === 'string' ? err : (err?.message || 'Failed to update position');
        notifications.show({ title: 'Error', message: msg, color: 'red' });
      }
      return;
    }
  };

  const openConfirmDelete = (id: string, name: string) => {
    setPendingDelete({ id, name });
    setConfirmOpen(true);
  };

  const performDelete = async () => {
    if (!pendingDelete) return;
    const { id, name } = pendingDelete;
    setConfirmOpen(false);

    // determine subtree to allow full rollback
    const removedIds = new Set<string>([id]);
    let changed = true;
    while (changed) {
      changed = false;
      for (const position of positions) {
        if (position.parentId !== null && removedIds.has(position.parentId) && !removedIds.has(position.id)) {
          removedIds.add(position.id);
          changed = true;
        }
      }
    }
    const removedPositions = positions.filter(position => removedIds.has(position.id));

    dispatch(removeLocalPosition(id));
    if (viewedPositionId === id) setViewedPositionId(null);
    try {
      await dispatch(deletePosition(id)).unwrap();
      notifications.show({ title: 'Position Deleted', message: `Successfully deleted ${name}.`, color: 'blue', icon: <IconCheck size={16} /> });
    } catch (err: any) {
      removedPositions.forEach((position) => dispatch(addLocalPosition(position)));
      const msg = typeof err === 'string' ? err : (err?.message || 'Failed to delete position');
      notifications.show({ title: 'Error', message: msg, color: 'red' });
    }
    setPendingDelete(null);
  };

  const positionsTree = useMemo(() => {
    // build a map of parentId -> children to avoid O(n^2) recursion
    const map = new Map<string | null, Position[]>();
    for (const p of positions) {
      const key = p.parentId ?? null;
      const arr = map.get(key) ?? [];
      arr.push(p);
      map.set(key, arr);
    }
    const buildTree = (parentId: string | null): any[] => {
      const children = map.get(parentId) || [];
      return children.map(c => ({ ...c, children: buildTree(c.id) }));
    };
    return buildTree(null);
  }, [positions]);

  const parentOptions = positions
    .filter(p => p.id !== selectedPosition?.id)
    .map(p => ({ value: p.id.toString(), label: p.name }));

  if (!mounted) return null;

  return (
    <Box p="xl" className="mx-auto min-h-screen" style={{ maxWidth: 1200 }}>
      <Card shadow="sm" p="lg" radius="md" withBorder mb="lg" bg={colorScheme === 'dark' ? 'dark.7' : 'white'}>
        <Group justify="space-between">
          <div>
            <Title order={2} c="blue.7">Organization Management</Title>
            <Text c="dimmed" size="sm">Manage employee hierarchy and structure</Text>
          </div>
          <Group>
            <Button variant="default" radius="md" size="md" onClick={() => toggleColorScheme()}>
              {colorScheme === 'dark' ? <IconSun size={18} /> : <IconMoon size={18} />}
            </Button>
            <Button radius="md" size="md" onClick={() => handleOpenModal('add')}>+ Add New Position</Button>
          </Group>
        </Group>
      </Card>

      {status === 'loading' && <Text ta="center" mt="xl" size="lg" fw={500} c="dimmed">Loading organizational structure...</Text>}

      {status === 'succeeded' && (
        <Group align="flex-start" wrap="nowrap" gap="lg">
          <Box style={{ flexGrow: 1, minWidth: 0 }}>
            <Card shadow="sm" p="lg" radius="md" withBorder bg={colorScheme === 'dark' ? 'dark.7' : 'white'}>
              <Title order={4} mb="md">Company Hierarchy</Title>
              <Divider mb="md" />
              <Box className="rounded" bg="transparent">
                {positionsTree.length > 0 ? (
                  <PositionsList
                    nodes={positionsTree}
                    handleOpenModal={handleOpenModal}
                    openConfirmDelete={openConfirmDelete}
                    setViewedPositionId={setViewedPositionId}
                    viewedPositionId={viewedPositionId}
                  />
                ) : (
                  <Text ta="center" c="dimmed" py="xl">No positions found. Start by adding a root position (e.g. CEO).</Text>
                )}
              </Box>
            </Card>
          </Box>

          {viewedPositionId && (
            <Box w={350} className="sticky" style={{ top: 24 }}>
              <PositionDetails activePosition={positions.find(p => p.id === viewedPositionId)!} positions={positions} onClose={() => setViewedPositionId(null)} />
            </Box>
          )}
        </Group>
      )}

      {/* ── Audit Log ────────────────────────────────────────────────────────── */}
      {status === 'succeeded' && (
        <Box mt="lg">
          <AuditLogPanel />
        </Box>
      )}

      <PositionFormModal
        opened={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        modalMode={modalMode}
        register={register}
        errors={errors}
        setValue={setValue}
        handleSubmit={handleSubmit}
        onSubmit={onSubmit}
        selectedPosition={selectedPosition}
        parentOptions={parentOptions}
      />

      <ConfirmDeleteModal opened={confirmOpen} onClose={() => setConfirmOpen(false)} performDelete={performDelete} pendingDelete={pendingDelete} />
    </Box>
  );
}
