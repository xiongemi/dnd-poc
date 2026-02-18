import React, { useCallback, useContext, useMemo, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
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

// --- react-beautiful-dnd compatible types ---
export interface DropResult {
  draggableId: string;
  type: string;
  source: { index: number; droppableId: string };
  destination: { index: number; droppableId: string } | null;
  reason: 'DROP' | 'CANCEL';
}

export interface DraggableProvided {
  innerRef: (element: HTMLElement | null) => void;
  draggableProps: Record<string, unknown>;
  dragHandleProps: Record<string, unknown> | null;
}

export interface DraggableStateSnapshot {
  isDragging: boolean;
}

export interface DroppableProvided {
  innerRef: (element: HTMLElement | null) => void;
  droppableProps: Record<string, unknown>;
  placeholder: ReactNode;
}

// --- Internal context for registration and drag end ---
type RbdCompatContextValue = {
  register: (droppableId: string, draggableId: string, index: number) => void;
  unregister: (draggableId: string) => void;
  getOrderRef: React.MutableRefObject<Map<string, string[]>>;
  onDragEnd: (result: DropResult) => void;
};

const RbdCompatContext = React.createContext<RbdCompatContextValue | null>(null);

function useRbdCompat() {
  const ctx = useContext(RbdCompatContext);
  if (!ctx) throw new Error('DragDropContext required');
  return ctx;
}

// --- DragDropContext (react-beautiful-dnd API) ---
export function DragDropContext({
  children,
  onDragEnd: onDragEndCallback,
}: {
  children: ReactNode;
  onDragEnd: (result: DropResult) => void;
}) {
  const ordersRef = useRef<Map<string, { id: string; index: number }[]>>(new Map());
  const draggableToDroppable = useRef<Map<string, string>>(new Map());
  const orderIdsRef = useRef<Map<string, string[]>>(new Map());

  const register = useCallback((droppableId: string, draggableId: string, index: number) => {
    draggableToDroppable.current.set(draggableId, droppableId);
    const orders = ordersRef.current;
    const list = orders.get(droppableId) ?? [];
    const without = list.filter((e) => e.id !== draggableId);
    without.push({ id: draggableId, index });
    without.sort((a, b) => a.index - b.index);
    orders.set(droppableId, without);
    orderIdsRef.current.set(droppableId, without.map((e) => e.id));
  }, []);

  const unregister = useCallback((draggableId: string) => {
    draggableToDroppable.current.delete(draggableId);
    const orders = ordersRef.current;
    orders.forEach((list, did) => {
      const next = list.filter((e) => e.id !== draggableId);
      orders.set(did, next);
      orderIdsRef.current.set(did, next.map((e) => e.id));
    });
  }, []);

  const value: RbdCompatContextValue = useMemo(
    () => ({
      register,
      unregister,
      getOrderRef: orderIdsRef,
      onDragEnd: onDragEndCallback,
    }),
    [register, unregister, onDragEndCallback]
  );

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: () => ({ x: 0, y: 0 }) })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      const droppableId = draggableToDroppable.current.get(active.id as string);
      if (!droppableId) return;
      const order = orderIdsRef.current.get(droppableId) ?? [];
      const sourceIndex = order.indexOf(active.id as string);
      if (sourceIndex === -1) return;
      const destIndex = over ? order.indexOf(over.id as string) : -1;
      const destination =
        over && destIndex !== -1 ? { index: destIndex, droppableId } : null;
      const result: DropResult = {
        draggableId: active.id as string,
        type: 'DEFAULT',
        source: { index: sourceIndex, droppableId },
        destination,
        reason: destination ? 'DROP' : 'CANCEL',
      };
      onDragEndCallback(result);
    },
    [onDragEndCallback]
  );

  return (
    <RbdCompatContext.Provider value={value}>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        {children}
      </DndContext>
    </RbdCompatContext.Provider>
  );
}

// --- Droppable (react-beautiful-dnd API) ---
export function Droppable({
  droppableId,
  children,
}: {
  droppableId: string;
  children: (provided: DroppableProvided) => ReactNode;
}) {
  const { setNodeRef } = useDroppable({ id: droppableId });
  const provided: DroppableProvided = useMemo(
    () => ({
      innerRef: setNodeRef as (el: HTMLElement | null) => void,
      droppableProps: { 'data-droppable-id': droppableId },
      placeholder: null,
    }),
    [setNodeRef, droppableId]
  );
  return (
    <DroppableIdProvider droppableId={droppableId}>
      {children(provided)}
    </DroppableIdProvider>
  );
}

const DroppableIdContext = React.createContext<string | null>(null);

function DroppableIdProvider({
  droppableId,
  children,
}: {
  droppableId: string;
  children: ReactNode;
}) {
  return (
    <DroppableIdContext.Provider value={droppableId}>
      {children}
    </DroppableIdContext.Provider>
  );
}

// --- Draggable (react-beautiful-dnd API) ---
export function Draggable({
  draggableId,
  index,
  children,
}: {
  draggableId: string;
  index: number;
  children: (provided: DraggableProvided, snapshot: DraggableStateSnapshot) => ReactNode;
}) {
  const compat = useRbdCompat();
  const droppableId = useContext(DroppableIdContext);
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: draggableId,
    data: { droppableId: droppableId ?? '', index },
  });

  React.useEffect(() => {
    if (droppableId) compat.register(droppableId, draggableId, index);
    return () => compat.unregister(draggableId);
  }, [compat, droppableId, draggableId, index]);

  const style = transform ? { transform: CSS.Translate.toString(transform) } : undefined;
  const provided: DraggableProvided = useMemo(
    () => ({
      innerRef: setNodeRef as (el: HTMLElement | null) => void,
      draggableProps: {
        ...attributes,
        style,
      } as Record<string, unknown>,
      dragHandleProps: (listeners ?? null) as Record<string, unknown> | null,
    }),
    [setNodeRef, attributes, listeners, style]
  );
  const snapshot: DraggableStateSnapshot = useMemo(
    () => ({ isDragging }),
    [isDragging]
  );
  return <>{children(provided, snapshot)}</>;
}

// --- DndKit list (uses sortable preset; works reliably) ---
function SortableItem({ item }: { item: ListItem }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
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
  const itemIds = items.map((i) => i.id);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      setItems((list) => {
        const oldIndex = list.findIndex((i) => i.id === active.id);
        const newIndex = list.findIndex((i) => i.id === over.id);
        if (oldIndex === -1 || newIndex === -1) return list;
        return arrayMove(list, oldIndex, newIndex);
      });
    }
  }, []);

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
        <ul className="dnd-list droppable-zone">
          {items.map((item) => (
            <SortableItem key={item.id} item={item} />
          ))}
        </ul>
      </SortableContext>
    </DndContext>
  );
}
