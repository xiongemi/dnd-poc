import { useState } from 'react';
import { BeautifulDndList } from './lists/BeautifulDndList';
import { PangeaDndList } from './lists/PangeaDndList';
import { DndKitList } from './lists/DndKitList';
import { PragmaticDndList } from './lists/PragmaticDndList';
import { PragmaticMigrationDndList } from './lists/PragmaticMigrationDndList';
import { ReactDndList } from './lists/ReactDndList';
import { INITIAL_ITEMS } from './types';

/**
 * - react-dnd's HTML5Backend conflicts with pragmatic-dnd, so react-dnd is lazy-loaded.
 * - react-beautiful-dnd and pdnd react-beautiful-dnd-migration both use data-rbd-* and
 *   each assigns contextId "0" to their first DragDropContext, so RBD's document.querySelectorAll
 *   finds both lists and they interfere. We only mount one of them at a time (toggle).
 */
function App() {
  const [reactDndEnabled, setReactDndEnabled] = useState(false);
  const [usePragmaticMigration, setUsePragmaticMigration] = useState(false);

  return (
    <>
      <h1>Drag-and-drop comparison</h1>
      <div className="compare-grid">
        <section className="lib-card">
          <h2>react-beautiful-dnd / pdnd migration</h2>
          <p className="subtitle">
            Same RBD API — toggle so only one is mounted (they share contextId otherwise)
          </p>
          <div className="rbd-migration-toggle">
            <button
              type="button"
              className={!usePragmaticMigration ? 'active' : ''}
              onClick={() => setUsePragmaticMigration(false)}
            >
              react-beautiful-dnd
            </button>
            <button
              type="button"
              className={usePragmaticMigration ? 'active' : ''}
              onClick={() => setUsePragmaticMigration(true)}
            >
              pdnd migration (animated)
            </button>
          </div>
          {!usePragmaticMigration ? (
            <BeautifulDndList initialItems={INITIAL_ITEMS} />
          ) : (
            <PragmaticMigrationDndList initialItems={INITIAL_ITEMS} />
          )}
        </section>
        <section className="lib-card">
          <h2>@hello-pangea/dnd</h2>
          <p className="subtitle">Maintained fork, same API</p>
          <PangeaDndList initialItems={INITIAL_ITEMS} />
        </section>
        <section className="lib-card">
          <h2>@atlaskit/pragmatic-drag-and-drop</h2>
          <p className="subtitle">Atlassian, low-level primitives</p>
          <PragmaticDndList initialItems={INITIAL_ITEMS} />
        </section>
        <section className="lib-card">
          <h2>@dnd-kit/core</h2>
          <p className="subtitle">
            <a href="https://dndkit.com/" target="_blank" rel="noreferrer">dnd kit</a> — modern toolkit, sortable preset
          </p>
          <DndKitList initialItems={INITIAL_ITEMS} />
        </section>
        <section className="lib-card">
          <h2>react-dnd</h2>
          <p className="subtitle">HTML5 backend, useDrag / useDrop</p>
          {reactDndEnabled ? (
            <ReactDndList initialItems={INITIAL_ITEMS} />
          ) : (
            <button
              type="button"
              className="enable-react-dnd"
              onClick={() => setReactDndEnabled(true)}
            >
              Enable react-dnd (lazy-loaded to avoid conflicting with pragmatic-dnd)
            </button>
          )}
        </section>
      </div>
    </>
  );
}

export default App;
