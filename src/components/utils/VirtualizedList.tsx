'use client';

import { useRef, useEffect, useState } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

interface VirtualizedListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  keyExtractor: (item: T, index: number) => string;
  itemCount?: number;
  overscan?: number;
  height?: number;
  className?: string;
}

/**
 * Virtualized list component for large datasets
 * Only renders items currently in viewport
 */
export default function VirtualizedList<T>({
  items,
  renderItem,
  keyExtractor,
  itemCount = items.length,
  overscan = 5,
  height = 600,
  className = '',
}: VirtualizedListProps<T>) {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: itemCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 80, // Default item height
    overscan,
    paddingEnd: 20,
  });

  return (
    <div ref={parentRef} style={{ height: `${height}px`, overflow: 'auto' }} className={className}>
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={keyExtractor(items[virtualRow.index], virtualRow.index)}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            {renderItem(items[virtualRow.index], virtualRow.index)}
          </div>
        ))}
      </div>
    </div>
  );
}
