import axios from 'axios';
import queryString from 'query-string';

/**
 * Fetches a text-based export (e.g. the embeddable HTML snippet) as a string, rather than
 * triggering a file download. Mirrors downloadExportedMappings' request shape.
 */
const fetchExportText = async ({
  alignmentOrder,
  configurationProfile = null,
  domainIds,
  format = 'embed',
  mapping,
  spineOrder,
}) => {
  const params = {
    alignment_order: alignmentOrder,
    configuration_profile_id: configurationProfile?.id,
    domain_ids: domainIds,
    mapping_id: mapping?.id,
    spine_order: spineOrder,
  };

  const response = await axios.get(`/api/v1/mapping_exports.${format}`, {
    params,
    paramsSerializer: (params) => queryString.stringify(params, { arrayFormat: 'bracket' }),
    responseType: 'text',
  });

  return response.data;
};

export default fetchExportText;
