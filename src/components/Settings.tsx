import React, { useState, useEffect } from 'react';
import { Save, RefreshCw } from 'lucide-react';
import { testConnection, saveSettings, loadSettings } from '../services/woocommerce';
import { testChatwootConnection, saveChatwootSettings, loadChatwootSettings } from '../services/chatwoot';

const Settings: React.FC = () => {
  const [url, setUrl] = useState('');
  const [consumerKey, setConsumerKey] = useState('');
  const [consumerSecret, setConsumerSecret] = useState('');
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [chatwootApiToken, setChatwootApiToken] = useState('');
  const [chatwootTestStatus, setChatwootTestStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');

  useEffect(() => {
    const loadSavedSettings = async () => {
      const wooSettings = await loadSettings();
      if (wooSettings) {
        setUrl(wooSettings.url);
        setConsumerKey(wooSettings.consumerKey);
        setConsumerSecret(wooSettings.consumerSecret);
      }
      const chatwootSettings = await loadChatwootSettings();
      if (chatwootSettings) {
        setChatwootApiToken(chatwootSettings.apiToken);
      }
    };
    loadSavedSettings();
  }, []);

  const handleSave = async () => {
    await saveSettings({ url, consumerKey, consumerSecret });
    await saveChatwootSettings({ apiToken: chatwootApiToken });
    alert('Settings saved successfully!');
  };

  const handleTestConnection = async () => {
    setTestStatus('testing');
    try {
      await testConnection({ url, consumerKey, consumerSecret });
      setTestStatus('success');
    } catch (error) {
      setTestStatus('error');
    }
  };

  const handleTestChatwootConnection = async () => {
    setChatwootTestStatus('testing');
    try {
      await testChatwootConnection(chatwootApiToken);
      setChatwootTestStatus('success');
    } catch (error) {
      setChatwootTestStatus('error');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-semibold mb-6">Integration Settings</h2>
      <form onSubmit={(e) => e.preventDefault()} className="space-y-4">
        <div>
          <h3 className="text-xl font-semibold mb-4">WooCommerce Settings</h3>
          <div>
            <label htmlFor="url" className="block text-sm font-medium text-gray-700">Website URL</label>
            <input
              type="url"
              id="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              required
            />
          </div>
          <div>
            <label htmlFor="consumerKey" className="block text-sm font-medium text-gray-700">Consumer Key</label>
            <input
              type="text"
              id="consumerKey"
              value={consumerKey}
              onChange={(e) => setConsumerKey(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              required
            />
          </div>
          <div>
            <label htmlFor="consumerSecret" className="block text-sm font-medium text-gray-700">Consumer Secret</label>
            <input
              type="password"
              id="consumerSecret"
              value={consumerSecret}
              onChange={(e) => setConsumerSecret(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              required
            />
          </div>
          <button
            type="button"
            onClick={handleTestConnection}
            className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <RefreshCw className="h-5 w-5 mr-2" /> Test WooCommerce Connection
          </button>
          {testStatus === 'testing' && <p className="mt-2 text-blue-600">Testing connection...</p>}
          {testStatus === 'success' && <p className="mt-2 text-green-600">WooCommerce connection successful!</p>}
          {testStatus === 'error' && <p className="mt-2 text-red-600">WooCommerce connection failed. Please check your settings.</p>}
        </div>
        
        <div>
          <h3 className="text-xl font-semibold mb-4">Chatwoot Settings</h3>
          <div>
            <label htmlFor="chatwootApiToken" className="block text-sm font-medium text-gray-700">Chatwoot API Token</label>
            <input
              type="password"
              id="chatwootApiToken"
              value={chatwootApiToken}
              onChange={(e) => setChatwootApiToken(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              required
            />
          </div>
          <button
            type="button"
            onClick={handleTestChatwootConnection}
            className="mt-2 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <RefreshCw className="h-5 w-5 mr-2" /> Test Chatwoot Connection
          </button>
          {chatwootTestStatus === 'testing' && <p className="mt-2 text-blue-600">Testing Chatwoot connection...</p>}
          {chatwootTestStatus === 'success' && <p className="mt-2 text-green-600">Chatwoot connection successful!</p>}
          {chatwootTestStatus === 'error' && <p className="mt-2 text-red-600">Chatwoot connection failed. Please check your API token.</p>}
        </div>
        
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Save className="h-5 w-5 mr-2" /> Save All Settings
          </button>
        </div>
      </form>
    </div>
  );
};

export default Settings;