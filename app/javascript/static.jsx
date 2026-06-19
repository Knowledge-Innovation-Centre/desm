// Entry point for the standalone (self-contained HTML) export.
//
// Renders the configuration profile's crosswalk view (`MappingView`) with no app chrome,
// fed entirely by the data embedded in `window.__DESM_STATIC__` via the static axios adapter
// (see services/api/staticAdapter.jsx). Wrapped in HashRouter so the in-component query-string
// handling (selected abstract class, deep links) works without a server.

import { createRoot } from 'react-dom/client';
import { useLocalStore } from 'easy-peasy';
import { HashRouter } from 'react-router-dom';
import MappingView from './components/property-mapping-list/MappingView';
import { propertyMappingListStore } from './components/property-mapping-list/stores/propertyMappingListStore';

const StaticApp = () => {
  const data = window.__DESM_STATIC__ || {};
  const store = useLocalStore(() =>
    propertyMappingListStore({ configurationProfile: data.configurationProfile })
  );

  return <MappingView store={store} embedded={true} />;
};

const container = document.getElementById('desm-mapping');
const root = createRoot(container);
root.render(
  <HashRouter>
    <StaticApp />
  </HashRouter>
);
