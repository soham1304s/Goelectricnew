import { useState, useEffect } from 'react';
import { Edit2, Check, X, DollarSign, TrendingUp, TrendingDown } from 'lucide-react';
import AdminLayout from './AdminLayout';
import { useTheme } from '../../context/ThemeContext';
import { getCarRates, updateCarRate, updateAllCarRates } from '../../services/adminService';
import { fetchCarRates, updateCarRates as saveCarRates, clearRateCache } from '../../services/rateService';

const PricingPage = () => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Car rates - fetched from admin/backend
  const [carRates, setCarRates] = useState([]);

  const [editingId, setEditingId] = useState(null);
  const [editingData, setEditingData] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(true);

  // Fetch rates on component mount
  useEffect(() => {
    fetchRates();
    
    // Remove auto-refresh interval to prevent overwriting user edits
    // const interval = setInterval(fetchRates, 5000);
    // return () => clearInterval(interval);
  }, []);

  const fetchRates = async () => {
    try {
      setLoading(true);
      // Clear any cached rates first
      clearRateCache();
      
      // Fetch from backend with cache busting
      const rates = await fetchCarRates(true); // force refresh from server
      console.log('📊 All rates from API:', rates);
      
      if (rates && Array.isArray(rates)) {
        // Log each car's ID to see what we're working with
        console.log('📋 All car IDs and names:');
        rates.forEach((r, i) => {
          console.log(`  ${i}: id="${r.id}", name="${r.name}"`);
        });
        
        // Show only Economy and Premium
        const filteredRates = rates.filter(rate => 
          rate.id === 'economy' || rate.id === 'premium'
        );
        console.log('🎯 Showing only economy and premium:', filteredRates.map(r => ({id: r.id, name: r.name})));
        setCarRates(filteredRates);
      } else {
        setErrorMessage('Invalid rates data received');
      }
    } catch (error) {
      console.error('Error fetching rates:', error);
      setErrorMessage('Failed to fetch rates');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (rate) => {
    setEditingId(rate.id);
    setEditingData({ ...rate });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditingData({});
  };

  const handleSave = async (id) => {
    if (!editingData.baseRate || editingData.baseRate <= 0) {
      setErrorMessage('Please enter a valid rate');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    if (!editingData.maxPassengers || editingData.maxPassengers <= 0) {
      setErrorMessage('Please enter valid passengers count');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    const updatedRates = carRates.map((rate) =>
      rate.id === id ? { ...editingData } : rate
    );
    
    console.log('Saving updated rates to backend:', updatedRates);
    
    try {
      // Save all rates to backend through rateService
      const saveResponse = await saveCarRates(updatedRates);
      console.log('Backend response:', saveResponse);
      
      // Clear cache immediately
      clearRateCache();
      
      // Small delay to ensure backend processed the update
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Refetch rates from backend to ensure sync
      const refreshedRates = await fetchCarRates(true);
      console.log('Refreshed rates from backend:', refreshedRates);
      
      // Filter to show only economy and premium
      const filteredRates = refreshedRates.filter(rate => 
        rate.id === 'economy' || rate.id === 'premium'
      );
      setCarRates(filteredRates);
      setSuccessMessage('Rates updated and broadcast to all pages!');
      console.log('Rate cache cleared - all pages will fetch updated rates');
    } catch (error) {
      setErrorMessage('Failed to update rates: ' + error.message);
      console.error('Error details:', error);
      // Revert changes on error
      await fetchRates();
    }
    
    setTimeout(() => setSuccessMessage(''), 3000);
    setEditingId(null);
    setEditingData({});
  };

  const handleInputChange = (field, value) => {
    const isNumericField = field === 'baseRate' || field === 'maxPassengers';
    const parsedValue = isNumericField
      ? (value === '' ? '' : Number(value))
      : value;

    setEditingData((prev) => ({
      ...prev,
      [field]: parsedValue,
    }));
  };

  const handleRateAdjustment = async (percentage, direction, id = null) => {
    const updatedRates = carRates.map((rate) => {
      if (id && rate.id !== id) return rate;

      const multiplier = direction === 'increase' ? 1 + percentage / 100 : 1 - percentage / 100;
      const nextRate = Math.round(rate.baseRate * multiplier * 100) / 100;
      return { ...rate, baseRate: Math.max(nextRate, 0.01) };
    });

    try {
      const response = await updateAllCarRates(updatedRates);
      if (response.success) {
        // Clear cache immediately
        clearRateCache();
        
        // Small delay to ensure backend processed the update
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Refetch to sync frontend with backend
        const refreshedRates = await fetchCarRates(true);
        // Filter to show only economy and premium
        const filteredRates = refreshedRates.filter(rate => 
          rate.id === 'economy' || rate.id === 'premium'
        );
        setCarRates(filteredRates);
        
        setSuccessMessage(
          id
            ? `Rate ${direction === 'increase' ? 'increased' : 'decreased'} by ${percentage}%!`
            : `All rates ${direction === 'increase' ? 'increased' : 'decreased'} by ${percentage}%!`
        );
        setTimeout(() => setSuccessMessage(''), 3000);
        return;
      }
      
      setErrorMessage('Failed to update rates');
      setTimeout(() => setErrorMessage(''), 3000);
      await fetchRates();
    } catch (error) {
      console.error('Error updating rates:', error);
      setErrorMessage('Failed to update rates');
      setTimeout(() => setErrorMessage(''), 3000);
      await fetchRates();
    }
  };

  const getTotalRevenue = () => {
    return carRates.reduce((sum, rate) => sum + rate.baseRate, 0);
  };

  const getAverageRate = () => {
    if (!carRates.length) return 0;
    return getTotalRevenue() / carRates.length;
  };

  return (
    <AdminLayout>
      <div className={`min-h-screen w-full px-2 sm:px-4 lg:px-6 py-4 sm:py-6 ${isDark ? 'bg-gray-900' : 'bg-gray-50'}`}>
        <div className="w-full max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6 sm:mb-8">
            <h1 className={`text-2xl sm:text-3xl font-bold mb-1 sm:mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Pricing Management
            </h1>
            <p className={`text-sm sm:text-base ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Manage and update car rates for different vehicle types
            </p>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
            </div>
          )}

          {!loading && (
            <>
              {/* Success/Error Messages */}
              {successMessage && (
                <div className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg bg-green-500/20 border border-green-500 text-green-600 text-sm sm:text-base">
                  <p className="font-medium">{successMessage}</p>
                </div>
              )}
              {errorMessage && (
                <div className="mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg bg-red-500/20 border border-red-500 text-red-600 text-sm sm:text-base">
                  <p className="font-medium">{errorMessage}</p>
                </div>
              )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            <div className={`p-4 sm:p-6 rounded-lg shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs sm:text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Total Car Types
                  </p>
                  <p className={`text-2xl sm:text-3xl font-bold mt-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    {carRates.length}
                  </p>
                </div>
                <div className="bg-emerald-500/20 p-3 sm:p-4 rounded-lg">
                  <DollarSign className="text-emerald-500 h-6 w-6 sm:h-8 sm:w-8" />
                </div>
              </div>
            </div>

            <div className={`p-4 sm:p-6 rounded-lg shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs sm:text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Average Rate
                  </p>
                  <p className={`text-2xl sm:text-3xl font-bold mt-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    ₹{getAverageRate().toFixed(2)}/km
                  </p>
                </div>
                <div className="bg-blue-500/20 p-3 sm:p-4 rounded-lg">
                  <TrendingUp className="text-blue-500 h-6 w-6 sm:h-8 sm:w-8" />
                </div>
              </div>
            </div>

            <div className={`p-4 sm:p-6 rounded-lg shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <p className={`text-xs sm:text-sm font-medium ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Total Rate Value
                  </p>
                  <p className={`text-2xl sm:text-3xl font-bold mt-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                    ₹{getTotalRevenue().toFixed(2)}
                  </p>
                </div>
                <div className="bg-purple-500/20 p-3 sm:p-4 rounded-lg">
                  <DollarSign className="text-purple-500 h-6 w-6 sm:h-8 sm:w-8" />
                </div>
              </div>
            </div>
          </div>

          {/* Rates Table/Cards */}
          <div className={`rounded-lg shadow-lg overflow-hidden ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
            <div className={`p-4 sm:p-6 border-b ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
              <h2 className={`text-lg sm:text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Vehicle Rates
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs sm:text-sm">
                <thead className={isDark ? 'bg-gray-700' : 'bg-gray-50'}>
                  <tr>
                    <th className={`px-3 sm:px-6 py-2 sm:py-4 text-left text-xs sm:text-sm font-semibold ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                      Vehicle Type
                    </th>
                    <th className={`px-3 sm:px-6 py-2 sm:py-4 text-left text-xs sm:text-sm font-semibold ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                      Base Rate
                    </th>
                    <th className={`px-3 sm:px-6 py-2 sm:py-4 text-left text-xs sm:text-sm font-semibold ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                      Passengers
                    </th>
                    <th className={`px-3 sm:px-6 py-2 sm:py-4 text-left text-xs sm:text-sm font-semibold hidden sm:table-cell ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                      Description
                    </th>
                    <th className={`px-3 sm:px-6 py-2 sm:py-4 text-left text-xs sm:text-sm font-semibold ${isDark ? 'text-gray-200' : 'text-gray-900'}`}>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {carRates.map((rate) => (
                    <tr
                      key={rate.id}
                      className={`border-t ${isDark ? 'border-gray-700 hover:bg-gray-700/50' : 'border-gray-200 hover:bg-gray-50'} transition-colors`}
                    >
                      <td className={`px-3 sm:px-6 py-2 sm:py-4 font-medium text-xs sm:text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {editingId === rate.id ? (
                          <input
                            type="text"
                            value={editingData.name}
                            onChange={(e) => handleInputChange('name', e.target.value)}
                            className={`px-2 py-1 text-xs sm:text-sm rounded border ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                          />
                        ) : (
                          <span>{rate.name || (rate.id === 'economy' ? 'Economy' : rate.id === 'premium' ? 'Premium' : rate.id)}</span>
                        )}
                      </td>
                      <td className={`px-3 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {editingId === rate.id ? (
                          <input
                            type="number"
                            step="0.1"
                            value={Number.isFinite(editingData.baseRate) ? editingData.baseRate : ''}
                            onChange={(e) => handleInputChange('baseRate', e.target.value)}
                            className={`px-2 py-1 text-xs sm:text-sm rounded border w-20 sm:w-24 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                          />
                        ) : (
                          <span className="font-semibold text-emerald-500">₹{rate.baseRate.toFixed(2)}/km</span>
                        )}
                      </td>
                      <td className={`px-3 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                        {editingId === rate.id ? (
                          <input
                            type="number"
                            value={Number.isFinite(editingData.maxPassengers) ? editingData.maxPassengers : ''}
                            onChange={(e) => handleInputChange('maxPassengers', e.target.value)}
                            className={`px-2 py-1 text-xs sm:text-sm rounded border w-14 sm:w-16 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                          />
                        ) : (
                          `${rate.maxPassengers} seats`
                        )}
                      </td>
                      <td className={`px-3 sm:px-6 py-2 sm:py-4 text-xs sm:text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'} hidden sm:table-cell`}>
                        {editingId === rate.id ? (
                          <input
                            type="text"
                            value={editingData.description}
                            onChange={(e) => handleInputChange('description', e.target.value)}
                            className={`px-2 py-1 text-xs sm:text-sm rounded border w-40 sm:w-48 ${isDark ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300'} focus:outline-none focus:ring-2 focus:ring-emerald-500`}
                          />
                        ) : (
                          rate.description
                        )}
                      </td>
                      <td className="px-3 sm:px-6 py-2 sm:py-4">
                        {editingId === rate.id ? (
                          <div className="flex gap-1 sm:gap-2">
                            <button
                              onClick={() => handleSave(rate.id)}
                              className="p-1.5 sm:p-2 rounded bg-green-500 hover:bg-green-600 text-white transition-colors"
                              title="Save"
                            >
                              <Check className="h-3 w-3 sm:h-4 sm:w-4" />
                            </button>
                            <button
                              onClick={handleCancel}
                              className={`p-1.5 sm:p-2 rounded ${isDark ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-300 hover:bg-gray-400'} text-white transition-colors`}
                              title="Cancel"
                            >
                              <X className="h-3 w-3 sm:h-4 sm:w-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex gap-1 sm:gap-2">
                            <button
                              onClick={() => handleEdit(rate)}
                              className="p-1.5 sm:p-2 rounded bg-blue-500 hover:bg-blue-600 text-white transition-colors"
                              title="Edit"
                            >
                              <Edit2 className="h-3 w-3 sm:h-4 sm:w-4" />
                            </button>
                            <button
                              onClick={() => handleRateAdjustment(10, 'increase', rate.id)}
                              className="p-1.5 sm:p-2 rounded bg-emerald-500 hover:bg-emerald-600 text-white transition-colors"
                              title="Increase 10%"
                            >
                              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
                            </button>
                            <button
                              onClick={() => handleRateAdjustment(10, 'decrease', rate.id)}
                              className="p-1.5 sm:p-2 rounded bg-orange-500 hover:bg-orange-600 text-white transition-colors"
                              title="Decrease 10%"
                            >
                              <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className={`p-4 sm:p-6 rounded-lg shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <h3 className={`text-base sm:text-lg font-bold mb-3 sm:mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Mass Increase Rate
              </h3>
              <div className="space-y-2 sm:space-y-3">
                <button
                  onClick={() => handleRateAdjustment(5, 'increase')}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white font-medium transition-colors"
                >
                  Increase All by 5%
                </button>
                <button
                  onClick={() => handleRateAdjustment(10, 'increase')}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-medium transition-colors"
                >
                  Increase All by 10%
                </button>
              </div>
            </div>

            <div className={`p-4 sm:p-6 rounded-lg shadow-lg ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
              <h3 className={`text-base sm:text-lg font-bold mb-3 sm:mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                Mass Decrease Rate
              </h3>
              <div className="space-y-2 sm:space-y-3">
                <button
                  onClick={() => handleRateAdjustment(5, 'decrease')}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-medium transition-colors"
                >
                  Decrease All by 5%
                </button>
                <button
                  onClick={() => handleRateAdjustment(10, 'decrease')}
                  className="w-full px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-medium transition-colors"
                >
                  Decrease All by 10%
                </button>
              </div>
            </div>
          </div>
            </>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default PricingPage;
