import { useState } from 'react';
import { BeautifulDndList } from './lists/BeautifulDndList';
import { PangeaDndList } from './lists/PangeaDndList';
import { PragmaticDndList } from './lists/PragmaticDndList';
import { ReactDndList } from './lists/ReactDndList';
import { INITIAL_ITEMS } from './types';

/**
 * react-dnd's HTML5Backend attaches document-level drag listeners. When it's mounted,
 * those handlers can capture native drag events and break @atlaskit/pragmatic-drag-and-drop
 * (and vice versa). So we lazy-mount the react-dnd list only when the user enables it,
 * so PragmaticDndList works by default.
 */
function App() {
  const [reactDndEnabled, setReactDndEnabled] = useState(false);

  return (
    <>
      <h1>Drag-and-drop comparison</h1>
      <div className="compare-grid">
        <section className="lib-card">
          <h2>react-beautiful-dnd</h2>
          <p className="subtitle">Original (unmaintained)</p>
          <BeautifulDndList initialItems={INITIAL_ITEMS} />
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
