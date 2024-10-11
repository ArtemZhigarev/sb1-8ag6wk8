import axios from 'axios';

interface WooCommerceSettings {
  url: string;
  consumerKey: string;
  consumerSecret: string;
}

const SETTINGS_KEY = 'woocommerce_settings';

export const saveSettings = async (settings: WooCommerceSettings): Promise<void> => {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
};

export const loadSettings = async (): Promise<WooCommerceSettings | null> => {
  const settings = localStorage.getItem(SETTINGS_KEY);
  return settings ? JSON.parse(settings) : null;
};

export const testConnection = async (settings: WooCommerceSettings): Promise<boolean> => {
  try {
    const response = await axios.get(`${settings.url}/wp-json/wc/v3/system_status`, {
      auth: {
        username: settings.consumerKey,
        password: settings.consumerSecret
      }
    });
    return response.status === 200;
  } catch (error) {
    console.error('Connection test failed:', error);
    return false;
  }
};

export const fetchUserOrders = async (email?: string): Promise<any[]> => {
  const settings = await loadSettings();
  if (!settings) throw new Error('WooCommerce settings not found');

  try {
    const response = await axios.get(`${settings.url}/wp-json/wc/v3/orders`, {
      auth: {
        username: settings.consumerKey,
        password: settings.consumerSecret
      },
      params: {
        email: email,
        per_page: 10
      }
    });
    return response.data.map((order: any) => ({
      id: order.id,
      date: new Date(order.date_created).toLocaleDateString(),
      total: order.total,
      status: order.status
    }));
  } catch (error) {
    console.error('Error fetching user orders:', error);
    return [];
  }
};

export const fetchUserDetails = async (email?: string): Promise<any> => {
  const settings = await loadSettings();
  if (!settings) throw new Error('WooCommerce settings not found');

  try {
    const response = await axios.get(`${settings.url}/wp-json/wc/v3/customers`, {
      auth: {
        username: settings.consumerKey,
        password: settings.consumerSecret
      },
      params: {
        email: email,
        per_page: 1
      }
    });

    if (response.data.length > 0) {
      const customer = response.data[0];
      return {
        name: `${customer.first_name} ${customer.last_name}`,
        email: customer.email,
        phone: customer.billing.phone,
        registrationDate: new Date(customer.date_created).toLocaleDateString()
      };
    }

    throw new Error('User not found');
  } catch (error) {
    console.error('Error fetching user details:', error);
    return null;
  }
};

export const searchUserByEmail = async (email: string): Promise<any> => {
  const userDetails = await fetchUserDetails(email);
  const orders = await fetchUserOrders(email);

  return {
    userDetails,
    orders
  };
};

export const fetchProducts = async (page: number = 1, perPage: number = 10): Promise<any[]> => {
  const settings = await loadSettings();
  if (!settings) throw new Error('WooCommerce settings not found');

  try {
    const response = await axios.get(`${settings.url}/wp-json/wc/v3/products`, {
      auth: {
        username: settings.consumerKey,
        password: settings.consumerSecret
      },
      params: {
        page,
        per_page: perPage
      }
    });

    return response.data.map((product: any) => ({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0]?.src || '',
      description: product.short_description
    }));
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
};