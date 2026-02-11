import { useState, useEffect, useRef } from 'react';
import { draggable, dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { reorder as reorderUtil } from '@atlaskit/pragmatic-drag-and-drop/reorder';
import type { ListItem } from '../types';

type ItemData = { index: number };

export function PragmaticDndList({ initialItems }: { initialItems: ListItem[] }) {
  const [items, setItems] = useState(initialItems);

  return (
    <ul className="dnd-list droppable-zone">
      {items.map((item, index) => (
        <PragmaticDndItem
          key={item.id}
          item={item}
          index={index}
          setItems={setItems}
        />
      ))}
    </ul>
  );
}

function PragmaticDndItem({
  item,
  index,
  setItems,
}: {
  item: ListItem;
  index: number;
  setItems: React.Dispatch<React.SetStateAction<ListItem[]>>;
}) {
  const ref = useRef<HTMLLIElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    return draggable({
      element: el,
      getInitialData: () => ({ index } as ItemData),
    });
  }, [index]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    return dropTargetForElements({
      element: el,
      getData: () => ({ index } as ItemData),
      onDrop: ({ source }) => {
        const sourceData = source.data as ItemData;
        const startIndex = sourceData.index;
        const finishIndex = index;
        if (startIndex === finishIndex) return;
        setItems((list) => reorderUtil({ list, startIndex, finishIndex }));
      },
    });
  }, [index, setItems]);

  return (
    <li ref={ref} className="dnd-item">
      {item.label}
    </li>
  );
}
