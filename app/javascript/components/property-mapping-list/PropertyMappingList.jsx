import { useLocalStore } from 'easy-peasy';
import TopNav from '../shared/TopNav';
import TopNavOptions from '../shared/TopNavOptions';
import MappingView from './MappingView';
import { propertyMappingListStore } from './stores/propertyMappingListStore';
import { camelizeLocationSearch } from '../../helpers/queryString';

const PropertyMappingList = (props) => {
  const store = useLocalStore(() => {
    const { cp, abstractClass } = camelizeLocationSearch(props);
    return propertyMappingListStore({ cp, abstractClass });
  });

  const navCenterOptions = () => {
    return <TopNavOptions viewMappings={true} mapSpecification={true} />;
  };

  return (
    <>
      <TopNav centerContent={navCenterOptions} />
      <MappingView store={store} embedded={false} />
    </>
  );
};

export default PropertyMappingList;
