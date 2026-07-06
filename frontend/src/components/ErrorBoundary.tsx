"use client";
import React from 'react';
import { Box, Button, Text } from '@mantine/core';

type State = { hasError: boolean; error?: Error | null; info?: React.ErrorInfo | null };

export default class ErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // you could also send this to an error reporting service
    // eslint-disable-next-line no-console
    console.error('Captured render error:', error, info);
    this.setState({ error, info });
  }

  render() {
    if (this.state.hasError) {
      return (
        <Box p="lg">
          <Text fw={700} size="lg" color="red">Something went wrong while rendering the app.</Text>
          <Text mt="sm">Error: {String(this.state.error)}</Text>
          <Box component="pre" mt="sm" style={{ whiteSpace: 'pre-wrap', background: '#f8f9fa', padding: 12, borderRadius: 6 }}>
            {this.state.info?.componentStack}
          </Box>
          <Button mt="md" onClick={() => location.reload()}>Reload</Button>
        </Box>
      );
    }
    return this.props.children;
  }
}
