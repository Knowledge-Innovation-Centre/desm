import Offcanvas from 'react-bootstrap/Offcanvas';
import PropertyMappingsFilter from './PropertyMappingsFilter';
import SearchBarActions from './SearchBarActions';
import NotificationDot from '../shared/NotificationDot';

/**
 * @description: Compact search / filter / info controls for the embedded (chrome-less) crosswalk
 * layout, meant to sit in the top tab strip in place of the in-app left Sidebar / BottomNav.
 * Mirrors BottomNav's offcanvas wiring (minus the export button); the Info offcanvas itself lives
 * in PropertiesList and is toggled here via `showInfo`.
 *
 * Props:
 * @param {Array} store - easy-peasy local store tuple ([state, actions])
 * @param {HTMLElement} container - optional Offcanvas portal target (the shadow root mount)
 */
const MappingControls = ({ store, container }) => {
  const [state, actions] = store;
  const { showSearch, showFilters } = state;
  const onCloseSearch = () => actions.setShowSearch(false);

  return (
    <>
      <div className="d-flex gap-2 align-items-start">
        <button
          type="button"
          className="btn btn-light border border-dark-subtle position-relative"
          disabled={!state.isSearchEnabled}
          onClick={() => actions.setShowSearch(!showSearch)}
          title="Search"
        >
          <span className="desm-icon fs-5">search</span>
          <NotificationDot show={state.withSearchInput} type="search" />
        </button>
        <button
          type="button"
          className="btn btn-light border border-dark-subtle position-relative"
          disabled={!state.isFiltersEnabled}
          onClick={() => actions.setShowFilters(!showFilters)}
          title="Filters"
        >
          <span className="desm-icon desm-icon--fill fs-5">filter_alt</span>
          <NotificationDot show={state.withFilters} />
        </button>
        <button
          type="button"
          className="btn btn-light border border-dark-subtle"
          disabled={!state.isInfoEnabled}
          onClick={() => actions.setShowInfo(!state.showInfo)}
          title="Info"
        >
          <span className="desm-icon fs-5">info</span>
        </button>
      </div>

      <Offcanvas
        container={container}
        placement="start"
        show={showSearch}
        onHide={onCloseSearch}
        aria-labelledby="Search"
      >
        <Offcanvas.Header closeButton />
        <Offcanvas.Body>
          <SearchBarActions
            onHide={onCloseSearch}
            onAlignmentOrderChange={actions.setSelectedAlignmentOrderOption}
            onHideSpineTermsWithNoAlignmentsChange={actions.setHideSpineTermsWithNoAlignments}
            onSpineOrderChange={actions.setSelectedSpineOrderOption}
            onType={actions.setPropertiesInputValue}
            propertiesInputValue={state.propertiesInputValue}
            hideSpineTermsWithNoAlignments={state.hideSpineTermsWithNoAlignments}
            selectedAlignmentOrderOption={state.selectedAlignmentOrderOption}
            selectedSpineOrderOption={state.selectedSpineOrderOption}
          />
        </Offcanvas.Body>
      </Offcanvas>

      <Offcanvas
        container={container}
        placement="start"
        show={showFilters}
        onHide={() => actions.setShowFilters(false)}
        aria-labelledby="Filters"
      >
        <Offcanvas.Header closeButton />
        <Offcanvas.Body>
          <PropertyMappingsFilter
            specifications={state.specifications}
            onAlignmentSpecificationSelected={actions.setSelectedAlignmentSpecifications}
            onPredicateSelected={actions.setSelectedPredicates}
            predicates={state.predicates}
            selectedAlignmentOrderOption={state.selectedAlignmentOrderOption}
            selectedAlignmentSpecifications={state.selectedAlignmentSpecifications}
            selectedDomain={state.selectedDomain}
            selectedPredicates={state.selectedPredicates}
            selectedSpineOrderOption={state.selectedSpineOrderOption}
          />
        </Offcanvas.Body>
      </Offcanvas>
    </>
  );
};

export default MappingControls;
