import { useState } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { ListItem } from '../types';

function SortableItem({ item }: { item: ListItem }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });

  return (
    <li
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      className={`dnd-item ${isDragging ? 'dragging' : ''}`}
      {...attributes}
      {...listeners}
    >
      {item.label}
    </li>
  );
}

export function DndKitList({ initialItems }: { initialItems: ListItem[] }) {
  const [items, setItems] = useState(initialItems);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setItems((list) => {
        const oldIndex = list.findIndex((i) => i.id === active.id);
        const newIndex = list.findIndex((i) => i.id === over.id);
        if (oldIndex === -1 || newIndex === -1) return list;
        return arrayMove(list, oldIndex, newIndex);
      });
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <ul className="dnd-list droppable-zone">
          {items.map((item) => (
            <SortableItem key={item.id} item={item} />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}
