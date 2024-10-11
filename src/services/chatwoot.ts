import axios from 'axios';

const CHATWOOT_API_URL = 'https://app.chatwoot.com/api/v1';
const SETTINGS_KEY = 'chatwoot_settings';

interface ChatwootSettings {
  apiToken: string;
}

interface ChatwootUserDetails {
  id: number;
  name: string;
  email: string;
  phone_number: string | null;
  created_at: string;
}

export const saveChatwootSettings = async (settings: ChatwootSettings): Promise<void> => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

export const loadChatwootSettings = async (): Promise<ChatwootSettings | null> => {
  const settings = localStorage.getItem(SETTINGS_KEY);
  return settings ? JSON.parse(settings) : null;
};

export const testChatwootConnection = async (apiToken: string): Promise<boolean> => {
  try {
    const response = await axios.get(`${CHATWOOT_API_URL}/profile`, {
      headers: {
        'api-access-token': apiToken,
      },
    });
    return response.status === 200;
  } catch (error) {
    console.error('Chatwoot connection test failed:', error);
    return false;
  }
};

export const fetchChatwootUserDetails = async (email: string | null): Promise<ChatwootUserDetails | null> => {
  if (!email) {
    throw new Error('Email is required to fetch Chatwoot user details');
  }

  const settings = await loadChatwootSettings();
  if (!settings || !settings.apiToken) {
    throw new Error('Chatwoot API access token is not configured');
  }

  try {
    const response = await axios.get(`${CHATWOOT_API_URL}/contacts/search`, {
      params: { q: email },
      headers: {
        'api-access-token': settings.apiToken,
      },
    });

    if (response.data && response.data.payload && response.data.payload.length > 0) {
      return response.data.payload[0];
    }

    return null;
  } catch (error) {
    console.error('Error fetching Chatwoot user details:', error);
    throw error;
  }
};