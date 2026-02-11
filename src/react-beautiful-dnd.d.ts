declare module 'react-beautiful-dnd' {
  import type { ReactNode } from 'react';

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

  export function DragDropContext(props: {
    children: ReactNode;
    onDragEnd: (result: DropResult) => void;
  }): JSX.Element;

  export function Droppable(props: {
    droppableId: string;
    children: (provided: DroppableProvided) => ReactNode;
  }): JSX.Element;

  export function Draggable(props: {
    draggableId: string;
    index: number;
    children: (
      provided: DraggableProvided,
      snapshot: DraggableStateSnapshot
    ) => ReactNode;
  }): JSX.Element;
}
