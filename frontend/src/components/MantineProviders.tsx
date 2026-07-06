"use client";
import { PropsWithChildren } from 'react';
import { MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';

export default function MantineProviders({ children }: PropsWithChildren) {
  return (
    <MantineProvider defaultColorScheme="light">
      <Notifications position="bottom-right" zIndex={1000} />
      {children}
    </MantineProvider>
  );
}

