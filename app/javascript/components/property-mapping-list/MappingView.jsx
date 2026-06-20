import { useEffect } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import Offcanvas from 'react-bootstrap/Offcanvas';
import AlertNotice from '../shared/AlertNotice';
import Loader from '../shared/Loader';
import DesmTabs from '../shared/DesmTabs';
import BottomNav from './BottomNav';
import PropertiesList, { buildPropertyCardId } from './PropertiesList';
import Sidebar from './Sidebar';
import MappingControls from './MappingControls';
import ConfigurationProfileSelect from '../shared/ConfigurationProfileSelect';
import { i18n } from '../../utils/i18n';
import { camelizeLocationSearch, updateWithRouter } from '../../helpers/queryString';
import { isEmpty } from 'lodash';
import ExportMappings from '../shared/ExportMappings';
import { TabletAndBelow, Desktop } from '../../utils/mediaQuery';
import classNames from 'classnames';
import { scrollToElement } from '../../utils/scrollToElement';

/**
 * @description: The configuration profile's crosswalk view, shared between the in-app route
 * (`PropertyMappingList`) and the standalone HTML export (`StaticApp`).
 *
 * Props:
 * @param {Array} store - the easy-peasy local store tuple ([state, actions])
 * @param {Boolean} embedded - when true, hides the in-app chrome that can't work standalone
 *   (configuration profile selector, export-download panel). The selector is also unnecessary
 *   because the embedded store is created with its configuration profile preset.
 * @param {HTMLElement} container - optional portal target for Offcanvas panels. Used by the
 *   Shadow DOM embed so offcanvas portals render inside the shadow root instead of document.body.
 */
const MappingView = ({ store, embedded = false, container }) => {
  const location = useLocation();
  const history = useHistory();
  const routerProps = { location, history };
  const { hash } = location;
  const [state, actions] = store;
  const {
    configurationProfile,
    domains,
    specifications,
    predicates,
    selectedDomain,
    hideSpineTermsWithNoAlignments,
    propertiesInputValue,
    propertyIds,
    sidebarCollapsed,
    selectedAlignmentOrderOption,
    selectedAlignmentSpecifications,
    selectedPredicates,
    selectedSpineOrderOption,
    showInfo,
    showExport,
  } = state;
  const updateQueryString = updateWithRouter(routerProps);

  const handleSelectedData = () => {
    if (isEmpty(domains)) return;

    let selectedAbstractClass = state.abstractClass
      ? domains.find((d) => d.name.toLowerCase() == state.abstractClass.toLowerCase())
      : domains[0];
    selectedAbstractClass ||= domains[0];
    actions.setSelectedDomain(selectedAbstractClass);
    updateQueryString(
      { abstractClass: selectedAbstractClass?.name },
      { replace: !state.abstractClass }
    );
  };

  useEffect(() => {
    loadData();
  }, [configurationProfile?.id]);
  useEffect(() => {
    handleSelectedData();
  }, [domains]);
  useEffect(() => {
    loadSpecifications();
  }, [configurationProfile?.id, selectedDomain]);
  useEffect(() => {
    // TODO: need to handle configurationProfile change too
    const { abstractClass } = camelizeLocationSearch(routerProps);
    if (
      abstractClass &&
      selectedDomain &&
      abstractClass.toLowerCase() !== selectedDomain.name.toLowerCase()
    ) {
      const selectedAbstractClass = domains.find(
        (d) => d.name.toLowerCase() == abstractClass.toLowerCase()
      );
      if (selectedAbstractClass) actions.setSelectedDomain(selectedAbstractClass);
    }
  }, [location.search]);

  useEffect(() => {
    if (propertyIds.length) {
      scrollToElement(hash, buildPropertyCardId);
    }
  }, [hash, propertyIds]);

  const updateSelectedDomain = (id) => {
    const selectedDomain = domains.find((domain) => domain.id == id);
    actions.updateSelectedDomain(selectedDomain);
    updateQueryString({ abstractClass: selectedDomain.name });
  };

  const updateSelectedConfigurationProfile = (configurationProfile) => {
    actions.updateSelectedConfigurationProfile(configurationProfile);
    if (configurationProfile) {
      updateQueryString({ cp: configurationProfile.id.toString() });
    }
  };

  const loadData = async () => {
    if (!configurationProfile) {
      return;
    }
    await actions.fetchDataFromAPI();
  };

  const loadSpecifications = async () => {
    if (!configurationProfile || !selectedDomain) {
      return;
    }

    actions.handleFetchSpecifications({
      configurationProfileId: configurationProfile.id,
      domainId: selectedDomain.id,
    });
  };

  // Embedded (standalone file / snippet) has no app shell, so it drops the nav/sidebar offsets
  // that `desm-content*` carries and puts the search/filter/info controls in the top tab strip.
  const clsMainContent = embedded
    ? 'w-auto'
    : classNames('w-auto desm-content desm-content__shared-mapping', {
        'desm-content--collapsed': sidebarCollapsed && configurationProfile?.withSharedMappings,
        'desm-content--expanded': !sidebarCollapsed && configurationProfile?.withSharedMappings,
      });

  const desmTabs = (
    <DesmTabs
      onTabClick={(id) => updateSelectedDomain(id)}
      selectedId={selectedDomain?.id}
      values={domains}
      isAllTermsCollapsed={state.isAllTermsCollapsed}
      isAllTermsExpanded={state.isAllTermsExpanded}
      collapseAllTerms={actions.collapseAllTerms}
      expandAllTerms={actions.expandAllTerms}
    />
  );

  const body = (
    <>
      {!embedded && (
        <Desktop>
          {configurationProfile?.withSharedMappings ? (
            <Sidebar store={store} embedded={embedded} />
          ) : null}
        </Desktop>
      )}
      <div className={clsMainContent} role="main">
        <div className="container-fluid">
          {state.hasErrors ? (
            <AlertNotice message={state.errors} onClose={actions.clearErrors} />
          ) : null}

          {!embedded && (
            <div className="row">
              <div className="col pt-3">
                {state.withoutSharedMappings && (
                  <div className="w-100">
                    <AlertNotice
                      withTitle={false}
                      message={i18n.t('ui.view_mapping.no_mappings.current_profile')}
                      cssClass="alert-warning"
                    />
                  </div>
                )}
                <ConfigurationProfileSelect
                  onSubmit={updateSelectedConfigurationProfile}
                  requestType="indexWithSharedMappings"
                  selectedConfigurationProfileId={state.selectedConfigurationProfileId(null)}
                  withoutUserConfigurationProfile={true}
                />
                <Offcanvas
                  placement="start"
                  show={showExport}
                  onHide={() => actions.setShowExport(false)}
                  aria-labelledby="Export"
                >
                  <Offcanvas.Header closeButton />
                  <Offcanvas.Body>
                    <ExportMappings configurationProfile={configurationProfile} domains={domains} />
                  </Offcanvas.Body>
                </Offcanvas>
              </div>
            </div>
          )}
        </div>
        {configurationProfile?.withSharedMappings &&
          (state.loading && !selectedDomain ? (
            <Loader />
          ) : (
            <>
              <div
                className={classNames(
                  'container-fluid border-top border-bottom border-dark-subtle py-3 desm-tabs bg-white z-3',
                  { 'position-sticky': !embedded }
                )}
              >
                {embedded ? (
                  <div className="d-flex justify-content-between align-items-start gap-3">
                    <div className="flex-grow-1" style={{ minWidth: 0 }}>
                      {desmTabs}
                    </div>
                    <MappingControls store={store} container={container} />
                  </div>
                ) : (
                  desmTabs
                )}
              </div>
              {selectedDomain ? (
                <div className="desm-mapping-list__wrapper container-fluid py-3 ">
                  <PropertiesList
                    container={container}
                    hideSpineTermsWithNoAlignments={hideSpineTermsWithNoAlignments}
                    inputValue={propertiesInputValue}
                    configurationProfile={configurationProfile}
                    domains={domains}
                    specifications={specifications}
                    predicates={predicates}
                    selectedAlignmentOrderOption={selectedAlignmentOrderOption}
                    selectedAlignmentSpecifications={selectedAlignmentSpecifications}
                    selectedDomain={selectedDomain}
                    selectedPredicates={selectedPredicates}
                    selectedSpineOrderOption={selectedSpineOrderOption}
                    showInfo={showInfo}
                    setShowInfo={actions.setShowInfo}
                    collapsedTerms={state.collapsedTerms}
                    onToggleTermCollapse={actions.toggleTermCollapse}
                    onUpdateProperties={actions.setPropertyIds}
                  />
                </div>
              ) : null}
            </>
          ))}
      </div>
      {!embedded && (
        <TabletAndBelow>
          {configurationProfile ? <BottomNav store={store} embedded={embedded} /> : null}
        </TabletAndBelow>
      )}
    </>
  );

  return embedded ? <div className="desm-embed-view">{body}</div> : body;
};

export default MappingView;
