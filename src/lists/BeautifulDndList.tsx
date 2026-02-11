import { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import type { ListItem } from '../types';

const reorder = (list: ListItem[], startIndex: number, endIndex: number): ListItem[] => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

export function BeautifulDndList({ initialItems }: { initialItems: ListItem[] }) {
  const [items, setItems] = useState(initialItems);

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    setItems((list) => reorder(list, result.source.index, result.destination!.index));
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="list">
        {(provided) => (
          <ul
            className="dnd-list droppable-zone"
            ref={provided.innerRef}
            {...provided.droppableProps}
          >
            {items.map((item, index) => (
              <Draggable key={item.id} draggableId={item.id} index={index}>
                {(provided, snapshot) => (
                  <li
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`dnd-item ${snapshot.isDragging ? 'dragging' : ''}`}
                  >
                    {item.label}
                  </li>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </ul>
        )}
      </Droppable>
    </DragDropContext>
  );
}
