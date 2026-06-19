import axios from 'axios';
import { APP_DOMAIN } from '../../helpers/Constants';
import staticAdapter from './staticAdapter';

const apiService = axios.create({
  // Tells the API that's ok to get the cookie in our client
  withCredentials: true,
  baseURL: APP_DOMAIN,
  headers: {
    'Content-Type': 'application/json',
  },
});

// In the standalone (self-contained HTML) build, resolve requests from embedded data instead
// of the network. The flag is injected by esbuild `define` and dead-code-eliminated otherwise.
if (process.env.DESM_STATIC === 'true') { // eslint-disable-line no-undef
  apiService.defaults.adapter = staticAdapter;
}

/**
 * Process the message to show it properly
 * @param {Error} e
 */
export const processMessage = (e) => {
  // Override default message with the generic from the error object
  return e.response?.data?.message || e.response?.data?.error || e.message || 'We found an error!';
};

export default apiService;
