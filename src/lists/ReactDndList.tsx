import { useState } from 'react';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import type { ListItem } from '../types';

const LIST_ITEM_TYPE = 'list-item';

const reorder = (list: ListItem[], startIndex: number, endIndex: number): ListItem[] => {
  if (startIndex === endIndex) return list;
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

function DraggableRow({
  item,
  index,
  moveItem,
}: {
  item: ListItem;
  index: number;
  moveItem: (fromIndex: number, toIndex: number) => void;
}) {
  const [{ isDragging }, dragRef] = useDrag({
    type: LIST_ITEM_TYPE,
    item: () => ({ id: item.id, index }),
    collect: (monitor) => ({ isDragging: monitor.isDragging() }),
  });

  const [, dropRef] = useDrop({
    accept: LIST_ITEM_TYPE,
    drop: (dragged: { id: string; index: number }) => {
      if (dragged.index !== index) {
        moveItem(dragged.index, index);
      }
    },
  });

  return (
    <li
      ref={(el) => {
        dragRef(el);
        dropRef(el);
      }}
      className={`dnd-item ${isDragging ? 'dragging' : ''}`}
    >
      {item.label}
    </li>
  );
}

export function ReactDndList({ initialItems }: { initialItems: ListItem[] }) {
  const [items, setItems] = useState(initialItems);

  const moveItem = (fromIndex: number, toIndex: number) => {
    setItems((list) => reorder(list, fromIndex, toIndex));
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <ul className="dnd-list droppable-zone">
        {items.map((item, index) => (
          <DraggableRow
            key={item.id}
            item={item}
            index={index}
            moveItem={moveItem}
          />
        ))}
      </ul>
    </DndProvider>
  );
}
