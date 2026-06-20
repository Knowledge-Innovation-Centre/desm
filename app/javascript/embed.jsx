// Entry point for the embeddable HTML snippet.
//
// Unlike the standalone build (static.jsx), this mounts the crosswalk view into a Shadow DOM
// so it is isolated from the host page's styles without an <iframe>. It exposes a global
// `window.DesmEmbedRender({ host, data, css })` that the snippet's bootstrap script calls:
// it attaches a shadow root to the host element, injects the (shadow-scoped) CSS, sets the
// embedded data global the static API adapter reads, and renders the React tree.
//
// Uses MemoryRouter (not HashRouter) so the widget never touches the host page's URL.
// The shadow mount node is passed as the Offcanvas `container` so react-bootstrap portals
// (Info legend, mobile search/filters) render inside the shadow root instead of document.body.
//
// Limitation: one embedded widget per page (it sets the shared `window.__DESM_STATIC__`).

import { createRoot } from 'react-dom/client';
import { useLocalStore } from 'easy-peasy';
import { MemoryRouter } from 'react-router-dom';
import MappingView from './components/property-mapping-list/MappingView';
import { propertyMappingListStore } from './components/property-mapping-list/stores/propertyMappingListStore';

const EmbedApp = ({ container }) => {
  const data = window.__DESM_STATIC__ || {};
  const store = useLocalStore(() =>
    propertyMappingListStore({ configurationProfile: data.configurationProfile })
  );

  return <MappingView store={store} embedded={true} container={container} />;
};

window.DesmEmbedRender = ({ host, data, css }) => {
  if (!host || host.dataset.desmRendered) return;
  host.dataset.desmRendered = 'true';

  window.__DESM_STATIC__ = data;

  const shadow = host.shadowRoot || host.attachShadow({ mode: 'open' });
  const style = document.createElement('style');
  style.textContent = css;
  shadow.appendChild(style);

  const mount = document.createElement('div');
  shadow.appendChild(mount);

  createRoot(mount).render(
    <MemoryRouter>
      <EmbedApp container={mount} />
    </MemoryRouter>
  );
};
