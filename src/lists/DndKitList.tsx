import { useState } from 'react';
import {
  DragDropProvider,
  PointerSensor,
  KeyboardSensor,
  type DragEndEvent,
} from '@dnd-kit/react';
import { useSortable, isSortableOperation } from '@dnd-kit/react/sortable';
import { arrayMove } from '@dnd-kit/sortable';
import type { ListItem } from '../types';

function SortableItem({ item, index }: { item: ListItem; index: number }) {
  const { ref, isDragging } = useSortable({
    id: item.id,
    index,
  });

  return (
    <li
      ref={ref}
      className={`dnd-item ${isDragging ? 'dragging' : ''}`}
    >
      {item.label}
    </li>
  );
}

export function DndKitList({ initialItems }: { initialItems: ListItem[] }) {
  const [items, setItems] = useState(initialItems);

  const handleDragEnd: DragEndEvent = ({ operation }) => {
    if (isSortableOperation(operation)) {
      const { source, target } = operation;

      if (source && target && source.id !== target.id) {
        setItems((list) => {
          const oldIndex = list.findIndex((i) => i.id === source.id);
          const newIndex = list.findIndex((i) => i.id === target.id);
          if (oldIndex === -1 || newIndex === -1) return list;
          return arrayMove(list, oldIndex, newIndex);
        });
      }
    }
  };

  return (
    <DragDropProvider
      sensors={[PointerSensor, KeyboardSensor]}
      onDragEnd={handleDragEnd}
    >
      <ul className="dnd-list droppable-zone">
        {items.map((item, index) => (
          <SortableItem key={item.id} item={item} index={index} />
        ))}
      </ul>
    </DragDropProvider>
  );
}
