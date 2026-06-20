import { useCallback, useState } from 'react';
import { MultiSelect } from 'react-multi-select-component';
import saveAs from 'file-saver';
import downloadExportedMappings from '../../services/downloadExportedMappings';
import fetchExportText from '../../services/fetchExportText';
import copyToClipboard from '../../helpers/copyToClipboard';
import { processMessage } from '../../services/api/apiService';

const FORMAT_OPTIONS = {
  jsonld: 'JSON-LD',
  ttl: 'Turtle',
  csv: 'CSV',
  html: 'Standalone HTML',
  embed: 'Embeddable snippet',
};

const ExportMappings = ({ configurationProfile, domains, onError }) => {
  const [downloading, setDownloading] = useState(false);
  const [selectedDomains, setSelectedDomains] = useState([]);
  const [selectedFormat, setSelectedFormat] = useState('jsonld');
  // The embeddable-snippet flow shows the result inline (copy/download) instead of file-saving.
  const [snippet, setSnippet] = useState(null);
  const [copied, setCopied] = useState(false);

  const resetSnippet = () => {
    setSnippet(null);
    setCopied(false);
  };

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      setDownloading(true);

      try {
        const domainIds = selectedDomains.map((d) => d.value);

        if (selectedFormat === 'embed') {
          const text = await fetchExportText({ configurationProfile, domainIds, format: 'embed' });
          setSnippet(text);
          setCopied(false);
        } else {
          await downloadExportedMappings({ configurationProfile, domainIds, format: selectedFormat });
        }
      } catch (e) {
        onError?.(processMessage(e));
      }

      setDownloading(false);
    },
    [configurationProfile, selectedDomains, selectedFormat, onError]
  );

  const handleCopy = useCallback(async () => {
    if (await copyToClipboard(snippet)) {
      setCopied(true);
    } else {
      onError?.('Could not copy to clipboard. Select the text and copy manually.');
    }
  }, [snippet, onError]);

  const handleDownloadSnippet = useCallback(() => {
    const name = configurationProfile?.name || 'mapping';
    saveAs(new Blob([snippet], { type: 'text/html' }), `${name}-embed.html`);
  }, [snippet, configurationProfile]);

  return (
    <form className="row" onSubmit={handleSubmit}>
      <label className="form-label">Export mappings from abstract classes:</label>
      <div className="col-12 mb-2">
        <MultiSelect
          disabled={downloading}
          labelledBy="Select domains"
          onChange={(value) => {
            setSelectedDomains(value);
            resetSnippet();
          }}
          options={domains.map((d) => ({ label: d.name, value: d.id }))}
          value={selectedDomains}
        />
      </div>
      <label className="form-label">AS</label>
      <div className="col-12 d-flex gap-2">
        <select
          className="form-select w-75"
          onChange={(e) => {
            setSelectedFormat(e.target.value);
            resetSnippet();
          }}
          value={selectedFormat}
        >
          {Object.entries(FORMAT_OPTIONS).map(([format, label]) => (
            <option key={format} value={format}>
              {label}
            </option>
          ))}
        </select>
        <button
          className="btn btn-primary flex-grow-1"
          disabled={downloading || !selectedDomains.length}
          type="submit"
        >
          {selectedFormat === 'embed' ? 'Generate snippet' : 'Export'}
        </button>
      </div>

      {selectedFormat === 'embed' && snippet ? (
        <div className="col-12 mt-3">
          <label className="form-label">
            Paste this snippet into your CMS&apos;s HTML source editor:
          </label>
          <textarea
            className="form-control mb-2 font-monospace small"
            readOnly
            rows={6}
            value={snippet}
            onFocus={(e) => e.target.select()}
          />
          <div className="d-flex gap-2">
            <button type="button" className="btn btn-primary flex-grow-1" onClick={handleCopy}>
              {copied ? 'Copied!' : 'Copy to clipboard'}
            </button>
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={handleDownloadSnippet}
            >
              Download
            </button>
          </div>
        </div>
      ) : null}
    </form>
  );
};

export default ExportMappings;
