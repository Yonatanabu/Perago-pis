"use client";
import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import {
  Card,
  Title,
  Text,
  Box,
  Divider,
  ScrollArea,
  Group,
  Loader,
  ActionIcon,
  Tooltip,
  TextInput,
  Badge,
} from '@mantine/core';
import {
  IconClipboardList,
  IconSearch,
  IconPlayerPause,
  IconPlayerPlay,
  IconChevronRight,
  IconChevronDown,
} from '@tabler/icons-react';
import { useMantineColorScheme } from '@mantine/core';

interface AuditLog {
  id: string;
  action: string;
  message: string;
  eventTime: string | null;
  createdAt: string;
}

const AUDIT_API_URL = process.env.NEXT_PUBLIC_AUDIT_SERVICE_URL || 'http://localhost:3001';
const POLL_INTERVAL_MS = 5000;
const PAGE_SIZE = 10;

// ── Helpers ──────────────────────────────────────────────────────────────────

const ACTION_META: Record<string, { emoji: string; label: string; color: string; verb: string }> = {
  'position.created': { emoji: '🟢', label: 'CREATED', color: 'teal',   verb: 'created' },
  'position.updated': { emoji: '🟡', label: 'UPDATED', color: 'yellow', verb: 'updated' },
  'position.deleted': { emoji: '🔴', label: 'DELETED', color: 'red',    verb: 'deleted' },
};

function formatTimestamp(iso: string): string {
  try {
    return new Intl.DateTimeFormat('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function formatDayHeader(iso: string): string {
  try {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function isoDateKey(iso: string): string {
  return iso.slice(0, 10); // YYYY-MM-DD
}

function extractDiff(message: string): Record<string, string> {
  const m = message.match(/\[(.+?)\] is updated at \[(.+?)\]/);
  if (m) return { name: m[1], updatedAt: m[2] };
  return { raw: message };
}

// ── Main Component ────────────────────────────────────────────────────────────

export default function AuditLogPanel() {
  const { colorScheme } = useMantineColorScheme();
  const isDark = colorScheme === 'dark';

  const [logs, setLogs]                       = useState<AuditLog[]>([]);
  const [loading, setLoading]                 = useState(true);
  const [error, setError]                     = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed]     = useState<Date | null>(null);
  const [paused, setPaused]                   = useState(false);
  const [filter, setFilter]                   = useState('');
  const [page, setPage]                       = useState(1);
  const intervalRef                           = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchLogs = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${AUDIT_API_URL}/api/audit-logs`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: AuditLog[] = await res.json();
      // Guarantee newest-first
      const sorted = [...data].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      setLogs(sorted);
      setLastRefreshed(new Date());
    } catch (err: any) {
      console.error('AuditLog fetch error:', err);
      setError(`${err.message || 'Could not reach the audit service'}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  useEffect(() => {
    if (paused) {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => fetchLogs(true), POLL_INTERVAL_MS);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [paused, fetchLogs]);

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return logs;
    return logs.filter(l =>
      l.message.toLowerCase().includes(q) ||
      l.action.toLowerCase().includes(q)
    );
  }, [logs, filter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const paginated  = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  useEffect(() => { setPage(1); }, [filter]);

  const rangeStart = filtered.length === 0 ? 0 : (safePage - 1) * PAGE_SIZE + 1;
  const rangeEnd   = Math.min(safePage * PAGE_SIZE, filtered.length);

  return (
    <Card
      shadow="sm"
      p="lg"
      radius="md"
      withBorder
      bg={isDark ? 'dark.7' : 'white'}
      style={{ height: '100%' }}
    >
      {/* ── Header ── */}
      <Group justify="space-between" mb="xs" wrap="nowrap">
        <Group gap="xs">
          <IconClipboardList size={20} color="var(--mantine-color-blue-6)" />
          <Title order={4}>Audit Log</Title>
          {lastRefreshed && (
            <Text size="xs" c="dimmed" style={{ whiteSpace: 'nowrap' }}>
              · updated {formatTimestamp(lastRefreshed.toISOString())}
            </Text>
          )}
        </Group>

        <Group gap={6} wrap="nowrap">
          <Tooltip label={paused ? 'Resume auto-refresh' : 'Pause auto-refresh'} position="left">
            <ActionIcon
              variant={paused ? 'filled' : 'subtle'}
              color={paused ? 'orange' : 'gray'}
              onClick={() => setPaused(p => !p)}
              size="sm"
              id="audit-pause-btn"
            >
              {paused ? <IconPlayerPlay size={14} /> : <IconPlayerPause size={14} />}
            </ActionIcon>
          </Tooltip>
          <Text size="xs" c={paused ? 'orange' : 'dimmed'} style={{ whiteSpace: 'nowrap' }}>
            {paused ? '⏸ Paused' : 'Auto-refresh 5s'}
          </Text>
        </Group>
      </Group>

      {/* ── Search ── */}
      <TextInput
        id="audit-search"
        size="xs"
        placeholder="Filter by position name or action…"
        value={filter}
        onChange={e => setFilter(e.currentTarget.value)}
        mb="sm"
        leftSection={<IconSearch size={13} />}
        styles={{ input: { fontFamily: 'inherit' } }}
      />

      <Divider mb="sm" />

      {/* ── Body ── */}
      {loading ? (
        <Box ta="center" py="xl">
          <Loader size="sm" />
          <Text size="sm" c="dimmed" mt="sm">Loading audit logs…</Text>
        </Box>
      ) : error ? (
        <Box
          p="md"
          style={{
            borderRadius: 8,
            background: isDark ? 'var(--mantine-color-red-9)' : 'var(--mantine-color-red-0)',
            border: '1px solid var(--mantine-color-red-4)',
          }}
        >
          <Text size="sm" c="red" fw={500}>⚠️ {error}</Text>
        </Box>
      ) : paginated.length === 0 ? (
        <Box ta="center" py="xl">
          <IconClipboardList size={36} color="var(--mantine-color-gray-5)" />
          <Text size="sm" c="dimmed" mt="sm">
            {filter
              ? 'No entries match your filter.'
              : 'No audit events yet.\nCreate a position to see the first entry.'}
          </Text>
        </Box>
      ) : (
        <ScrollArea h={420} scrollbarSize={6}>
          <EventList logs={paginated} isDark={isDark} />
        </ScrollArea>
      )}

      {/* ── Pagination footer ── */}
      {!loading && !error && filtered.length > 0 && (
        <>
          <Divider mt="sm" mb="xs" />
          <Group justify="space-between" wrap="nowrap">
            <Text size="xs" c="dimmed">
              Showing {rangeStart}–{rangeEnd} of {filtered.length}
              {filter ? ` (filtered from ${logs.length})` : ''}
            </Text>
            <Group gap={4} wrap="nowrap">
              <PagerBtn
                label="‹ Prev"
                disabled={safePage <= 1}
                onClick={() => setPage(p => Math.max(1, p - 1))}
                id="audit-prev-btn"
              />
              <Text size="xs" c="dimmed">{safePage} / {totalPages}</Text>
              <PagerBtn
                label="Next ›"
                disabled={safePage >= totalPages}
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                id="audit-next-btn"
              />
            </Group>
          </Group>
        </>
      )}
    </Card>
  );
}

// ── EventList with day-separator headers ──────────────────────────────────────

function EventList({ logs, isDark }: { logs: AuditLog[]; isDark: boolean }) {
  let lastDay = '';
  return (
    <Box style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
      {logs.map(log => {
        const dayKey = isoDateKey(log.createdAt);
        const showDaySep = dayKey !== lastDay;
        lastDay = dayKey;
        return (
          <React.Fragment key={log.id}>
            {showDaySep && <DaySeparator iso={log.createdAt} isDark={isDark} />}
            <AuditLogEntry log={log} isDark={isDark} />
          </React.Fragment>
        );
      })}
    </Box>
  );
}

// ── Day separator ─────────────────────────────────────────────────────────────

function DaySeparator({ iso, isDark }: { iso: string; isDark: boolean }) {
  return (
    <Box style={{ display: 'flex', alignItems: 'center', gap: 8, margin: '12px 0 8px' }}>
      <Box style={{ flex: 1, height: 1, background: isDark ? '#373a40' : '#dee2e6' }} />
      <Text size="xs" c="dimmed" fw={600} style={{ letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
        — {formatDayHeader(iso)} —
      </Text>
      <Box style={{ flex: 1, height: 1, background: isDark ? '#373a40' : '#dee2e6' }} />
    </Box>
  );
}

// ── Individual log entry ──────────────────────────────────────────────────────

function AuditLogEntry({ log, isDark }: { log: AuditLog; isDark: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const [hovered, setHovered] = useState(false);
  const meta = ACTION_META[log.action] ?? { emoji: '⬜', label: log.action.toUpperCase(), color: 'gray', verb: log.action };
  const isUpdated = log.action === 'position.updated';

  const renderedMessage = useMemo(() => {
    const parts = log.message.split(new RegExp(`(${meta.verb})`, 'i'));
    return parts.map((part, i) =>
      part.toLowerCase() === meta.verb.toLowerCase()
        ? <strong key={i}>{part}</strong>
        : <span key={i}>{part}</span>
    );
  }, [log.message, meta.verb]);

  const diff = useMemo(() => isUpdated ? extractDiff(log.message) : null, [log.message, isUpdated]);

  return (
    <Box
      mb={8}
      p="sm"
      style={{
        borderRadius: 8,
        background: isDark ? 'var(--mantine-color-dark-6)' : 'var(--mantine-color-gray-0)',
        border: `1px solid ${isDark ? 'var(--mantine-color-dark-4)' : 'var(--mantine-color-gray-2)'}`,
        transition: 'background 0.15s ease',
      }}
    >
      {/* Action + timestamp row */}
      <Group justify="space-between" wrap="nowrap" mb={4}>
        <Group gap={6} wrap="nowrap">
          <Text size="sm" style={{ lineHeight: 1 }}>{meta.emoji}</Text>
          <Badge size="xs" color={meta.color} variant="light" radius="sm">
            {meta.label}
          </Badge>
        </Group>
        <Text size="xs" c="dimmed" style={{ whiteSpace: 'nowrap', fontVariantNumeric: 'tabular-nums' }}>
          {formatTimestamp(log.createdAt)}
        </Text>
      </Group>

      {/* Message with bold verb */}
      <Text size="sm" style={{ fontFamily: 'monospace', wordBreak: 'break-word' }}>
        {renderedMessage}
      </Text>

      {/* Expandable diff for UPDATED */}
      {isUpdated && diff && (
        <>
          <Box
            mt={6}
            style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 3 }}
            onClick={() => setExpanded(e => !e)}
            id={`audit-expand-${log.id}`}
          >
            {expanded
              ? <IconChevronDown size={12} color="var(--mantine-color-blue-5)" />
              : <IconChevronRight size={12} color="var(--mantine-color-blue-5)" />}
            <Text size="xs" c="blue" style={{ userSelect: 'none' }}>
              {expanded ? 'Hide diff' : 'Show diff'}
            </Text>
          </Box>
          {expanded && (
            <Box
              mt={6}
              p="xs"
              style={{
                borderRadius: 6,
                background: isDark ? '#1a1b1e' : '#f1f3f5',
                border: `1px solid ${isDark ? '#2c2e33' : '#dee2e6'}`,
                fontFamily: 'monospace',
                fontSize: 12,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-all',
              }}
            >
              {JSON.stringify(diff, null, 2)}
            </Box>
          )}
        </>
      )}
    </Box>
  );
}

// ── Pager button ──────────────────────────────────────────────────────────────

function PagerBtn({ label, disabled, onClick, id }: {
  label: string; disabled: boolean; onClick: () => void; id: string;
}) {
  return (
    <Box
      id={id}
      onClick={disabled ? undefined : onClick}
      style={{
        cursor: disabled ? 'default' : 'pointer',
        padding: '2px 8px',
        borderRadius: 4,
        fontSize: 12,
        color: disabled ? 'var(--mantine-color-gray-5)' : 'var(--mantine-color-blue-6)',
        userSelect: 'none',
      }}
    >
      {label}
    </Box>
  );
}
