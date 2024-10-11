import React, { useState, useEffect } from 'react';
import { ShoppingBag, User, Search, Package, Link as LinkIcon, RefreshCw } from 'lucide-react';
import { fetchUserOrders, fetchUserDetails, fetchProducts, loadSettings } from '../services/woocommerce';
import { fetchChatwootUserDetails, loadChatwootSettings } from '../services/chatwoot';

interface Order {
  id: number;
  date: string;
  total: string;
  status: string;
}

interface UserDetails {
  name: string;
  email: string;
  phone?: string;
  registrationDate: string;
}

interface Product {
  id: number;
  name: string;
  price: string;
  image: string;
  description: string;
}

interface DashboardProps {
  chatwootEmail: string | null;
}

const Dashboard: React.FC<DashboardProps> = ({ chatwootEmail }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchEmail, setSearchEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'user' | 'orders' | 'products'>('user');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [copiedProductId, setCopiedProductId] = useState<number | null>(null);
  const [productSearch, setProductSearch] = useState('');
  const [chatwootConfigured, setChatwootConfigured] = useState(false);
  const [chatwootLoading, setChatwootLoading] = useState(false);
  const [chatwootError, setChatwootError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const settings = await loadSettings();
        if (!settings) {
          setError('WooCommerce settings not found. Please configure the settings first.');
          setLoading(false);
          return;
        }

        if (chatwootEmail) {
          const userDetailsData = await fetchUserDetails(chatwootEmail);
          setUserDetails(userDetailsData);
          const ordersData = await fetchUserOrders(chatwootEmail);
          setOrders(ordersData);
        }

        const productsData = await fetchProducts(page);
        setProducts(productsData);
        setHasMore(productsData.length === 10);
      } catch (err) {
        setError('Error fetching data. Please try again.');
      }
      setLoading(false);
    };

    fetchData();
  }, [chatwootEmail, page]);

  useEffect(() => {
    const checkChatwootSettings = async () => {
      const settings = await loadChatwootSettings();
      setChatwootConfigured(!!settings && !!settings.apiToken);
    };
    checkChatwootSettings();
  }, []);

  const handleSearch = async () => {
    setLoading(true);
    try {
      const userDetailsData = await fetchUserDetails(searchEmail);
      setUserDetails(userDetailsData);
      const ordersData = await fetchUserOrders(searchEmail);
      setOrders(ordersData);
      setError(null);
    } catch (err) {
      setError('Error searching for user. Please try again.');
    }
    setLoading(false);
  };

  const handleLoadMore = () => {
    setPage((prevPage) => prevPage + 1);
  };

  const handleCopyLink = async (productId: number) => {
    const settings = await loadSettings();
    if (settings) {
      const productLink = `${settings.url}/product/${productId}`;
      navigator.clipboard.writeText(productLink).then(() => {
        setCopiedProductId(productId);
        setTimeout(() => setCopiedProductId(null), 2000);
      });
    } else {
      setError('WooCommerce settings not found. Unable to generate product link.');
    }
  };

  const handleChatwootRequest = async () => {
    if (!chatwootConfigured) {
      setChatwootError('Chatwoot API is not configured. Please set up the API token in the Settings page.');
      return;
    }

    setChatwootLoading(true);
    setChatwootError(null);
    try {
      const chatwootUserDetails = await fetchChatwootUserDetails(chatwootEmail);
      if (chatwootUserDetails) {
        setUserDetails({
          name: `${chatwootUserDetails.name}`,
          email: chatwootUserDetails.email,
          phone: chatwootUserDetails.phone_number || undefined,
          registrationDate: new Date(chatwootUserDetails.created_at).toLocaleDateString(),
        });
        setSearchEmail(chatwootUserDetails.email);
        // Fetch orders for the Chatwoot user
        const ordersData = await fetchUserOrders(chatwootUserDetails.email);
        setOrders(ordersData);
      } else {
        setChatwootError('No user details found in Chatwoot');
      }
    } catch (error) {
      setChatwootError('Error fetching Chatwoot user details. Please try again.');
    }
    setChatwootLoading(false);
  };

  const filteredProducts = products.filter((product) =>
    product.name.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex space-x-4 mb-6">
          <button
            onClick={() => setActiveTab('user')}
            className={`px-4 py-2 rounded-md ${
              activeTab === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            <User className="inline-block mr-2" /> User Details
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-md ${
              activeTab === 'orders' ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            <ShoppingBag className="inline-block mr-2" /> Orders
          </button>
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 rounded-md ${
              activeTab === 'products' ? 'bg-blue-500 text-white' : 'bg-gray-200'
            }`}
          >
            <Package className="inline-block mr-2" /> Products
          </button>
        </div>

        <button
          onClick={handleChatwootRequest}
          disabled={!chatwootEmail || chatwootLoading || !chatwootConfigured}
          className={`mb-4 bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 ${
            (!chatwootEmail || chatwootLoading || !chatwootConfigured) && 'opacity-50 cursor-not-allowed'
          }`}
        >
          <RefreshCw className="inline-block mr-2" />
          {chatwootLoading ? 'Loading...' : 'Get Chatwoot User Details'}
        </button>
        {!chatwootConfigured && (
          <p className="text-yellow-500 mb-4">Chatwoot API is not configured. Please set up the API token in the Settings page.</p>
        )}
        {chatwootError && <p className="text-red-500 mb-4">{chatwootError}</p>}

        {activeTab === 'user' && (
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <User className="mr-2" /> User Details
            </h2>
            <div className="flex mb-4">
              <input
                type="email"
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                placeholder="Search by email"
                className="flex-grow px-4 py-2 border rounded-l-md"
              />
              <button
                onClick={handleSearch}
                className="bg-blue-500 text-white px-4 py-2 rounded-r-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <Search className="inline-block" />
              </button>
            </div>
            {userDetails ? (
              <div>
                <p><strong>Name:</strong> {userDetails.name}</p>
                <p><strong>Email:</strong> {userDetails.email}</p>
                <p><strong>Phone:</strong> {userDetails.phone || 'N/A'}</p>
                <p><strong>Registration Date:</strong> {userDetails.registrationDate}</p>
              </div>
            ) : (
              <p>No user details available.</p>
            )}
          </div>
        )}

        {activeTab === 'orders' && (
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <ShoppingBag className="mr-2" /> Orders
            </h2>
            {orders.length > 0 ? (
              <table className="min-w-full">
                <thead>
                  <tr>
                    <th className="px-4 py-2">Order ID</th>
                    <th className="px-4 py-2">Date</th>
                    <th className="px-4 py-2">Total</th>
                    <th className="px-4 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.id}>
                      <td className="border px-4 py-2">{order.id}</td>
                      <td className="border px-4 py-2">{order.date}</td>
                      <td className="border px-4 py-2">${order.total}</td>
                      <td className="border px-4 py-2">{order.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>No orders found.</p>
            )}
          </div>
        )}

        {activeTab === 'products' && (
          <div>
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <Package className="mr-2" /> Products
            </h2>
            <div className="mb-4">
              <input
                type="text"
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                placeholder="Search products by name"
                className="w-full px-4 py-2 border rounded-md"
              />
            </div>
            {loading ? (
              <p>Loading products...</p>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredProducts.map((product) => (
                    <div key={product.id} className="border rounded-lg p-4">
                      <img src={product.image} alt={product.name} className="w-full h-48 object-cover mb-2 rounded" />
                      <h3 className="font-semibold">
                        {product.name} <span className="text-sm text-gray-500">(ID: {product.id})</span>
                      </h3>
                      <p className="text-gray-600">${product.price}</p>
                      <p className="text-sm text-gray-500 mt-2" dangerouslySetInnerHTML={{ __html: product.description }}></p>
                      <button
                        onClick={() => handleCopyLink(product.id)}
                        className={`mt-2 px-3 py-1 rounded-md text-sm font-medium ${
                          copiedProductId === product.id
                            ? 'bg-green-500 text-white'
                            : 'bg-blue-500 text-white hover:bg-blue-600'
                        } focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200`}
                      >
                        <LinkIcon className="inline-block h-4 w-4 mr-1" />
                        {copiedProductId === product.id ? 'Copied!' : 'Copy Link'}
                      </button>
                    </div>
                  ))}
                </div>
                {hasMore && filteredProducts.length === products.length && (
                  <button
                    onClick={handleLoadMore}
                    className="mt-4 bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    Load More
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {error && <p className="text-red-500 mt-4">{error}</p>}
      </div>
    </div>
  );
};

export default Dashboard;