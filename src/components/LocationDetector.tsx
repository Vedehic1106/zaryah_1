import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Navigation, X, Check } from 'lucide-react';
import { useLocation } from '../contexts/LocationContext';
import { useApp } from '../contexts/AppContext';

export const LocationDetector: React.FC = () => {
  const { 
    userCity, 
    isLocationLoading, 
    requestLocation, 
    setUserCity, 
    locationError 
  } = useLocation();
  const { products } = useApp();
  const [showLocationModal, setShowLocationModal] = useState(!userCity);
  const [selectedCity, setSelectedCity] = useState('');
  const [locationErrorState, setLocationError] = useState('');

  const cities = [
    'Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Kolkata', 'Pune', 'Jaipur', 'Surat',
    'Lucknow', 'Kanpur', 'Nagpur', 'Indore', 'Thane', 'Bhopal', 'Visakhapatnam', 'Pimpri-Chinchwad', 'Patna',
    'Vadodara', 'Ghaziabad', 'Ludhiana', 'Agra', 'Nashik', 'Faridabad', 'Meerut', 'Rajkot', 'Kalyan-Dombivli',
    'Vasai-Virar', 'Varanasi', 'Srinagar', 'Aurangabad', 'Dhanbad', 'Amritsar', 'Navi Mumbai', 'Allahabad',
    'Ranchi', 'Howrah', 'Coimbatore', 'Jabalpur', 'Gwalior', 'Vijayawada', 'Jodhpur', 'Madurai', 'Raipur',
    'Kota', 'Guwahati', 'Chandigarh', 'Solapur', 'Hubli–Dharwad', 'Bareilly', 'Moradabad', 'Mysore', 'Gurgaon',
    'Aligarh', 'Jalandhar', 'Tiruchirappalli', 'Bhubaneswar', 'Salem', 'Mira-Bhayandar', 'Thiruvananthapuram',
    'Bhiwandi', 'Saharanpur', 'Guntur', 'Amravati', 'Noida', 'Jamshedpur', 'Bhilai', 'Cuttack', 'Firozabad',
    'Kochi', 'Nellore', 'Bhavnagar', 'Dehradun', 'Durgapur', 'Asansol', 'Rourkela', 'Nanded', 'Kolhapur',
    'Ajmer', 'Akola', 'Gulbarga', 'Jamnagar', 'Ujjain', 'Loni', 'Siliguri', 'Jhansi', 'Ulhasnagar', 'Nellore',
    'Jammu', 'Sangli-Miraj & Kupwad', 'Belgaum', 'Mangalore', 'Ambattur', 'Tirunelveli', 'Malegaon', 'Gaya',
    'Jalgaon', 'Udaipur', 'Maheshtala', 'Davanagere', 'Kozhikode', 'Kurnool', 'Rajpur Sonarpur', 'Bokaro',
    'South Dumdum', 'Bellary', 'Patiala', 'Gopalpur', 'Agartala', 'Bhagalpur', 'Muzaffarnagar', 'Bhatpara',
    'Panihati', 'Latur', 'Dhule', 'Rohtak', 'Korba', 'Bhilwara', 'Berhampur', 'Muzaffarpur', 'Ahmednagar',
    'Mathura', 'Kollam', 'Avadi', 'Kadapa', 'Anantapur', 'Kamarhati', 'Bilaspur', 'Sambalpur', 'Shahjahanpur',
    'Satara', 'Bijapur', 'Rampur', 'Shivamogga', 'Chandrapur', 'Junagadh', 'Thrissur', 'Alwar', 'Bardhaman',
    'Kulti', 'Nizamabad', 'Parbhani', 'Tumkur', 'Khammam', 'Ozhukarai', 'Bihar Sharif', 'Panipat', 'Darbhanga',
    'Bally', 'Aizawl', 'Dewas', 'Ichalkaranji', 'Karnal', 'Bathinda', 'Jalna', 'Eluru', 'Barasat', 'Kirari Suleman Nagar',
    'Purnia', 'Satna', 'Mau', 'Sonipat', 'Farrukhabad', 'Sagar', 'Rourkela Industrial Township', 'Durg', 'Imphal',
    'Ratlam', 'Hapur', 'Arrah', 'Anantapuram', 'Karimnagar', 'Etawah', 'Ambernath', 'North Dumdum', 'Bharatpur',
    'Begusarai', 'New Delhi'
  ];

  const handleManualSelection = () => {
    if (selectedCity) {
      setUserCity(selectedCity);
      setShowLocationModal(false);
    }
  };

  const handleAutoDetect = async () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not supported by your browser.');
      return;
    }
    setLocationError('');
    try {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const { latitude, longitude } = position.coords;
        // Use Nominatim API for reverse geocoding
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
        );
        const data = await response.json();
        const detectedCity = data.address?.city || data.address?.town || data.address?.village || data.address?.state_district || '';
        // Fuzzy match to your city list
        const matchedCity = cities.find(city =>
          city.toLowerCase().replace(/[^a-z]/g, '') === detectedCity.toLowerCase().replace(/[^a-z]/g, '')
        );
        if (matchedCity) {
          setSelectedCity(matchedCity);
          setUserCity(matchedCity);
          setShowLocationModal(false);
        } else {
          setLocationError('Could not detect a supported city. Please select manually.');
        }
      }, (error) => {
        setLocationError('Could not get your location. Please select manually.');
      });
    } catch (err) {
      setLocationError('Could not get your location. Please select manually.');
    }
  };

  if (!showLocationModal && userCity) {
    return (
      <div className="fixed bottom-4 right-4 z-40">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-xl shadow-lg border border-primary-200 p-3 flex items-center space-x-2"
        >
          <MapPin className="w-4 h-4 text-primary-600" />
          <span className="text-sm font-medium text-primary-700">{userCity}</span>
          <button
            onClick={() => setShowLocationModal(true)}
            className="text-xs text-primary-600 hover:text-primary-700 font-medium"
          >
            Change
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <AnimatePresence>
      {showLocationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-cream-50 rounded-3xl p-12 w-full max-w-lg border border-blush-100 shadow-2xl"
          >
            <div className="text-center mb-8">
              <div className="bg-primary-600 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <MapPin className="w-12 h-12 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-primary-900 mb-3">
                What's your location?
              </h2>
              <p className="text-lg text-primary-600">
                We'll show you instant delivery options in your area
              </p>
            </div>

            {(locationError || locationErrorState) && (
              <div className="bg-red-50 border border-red-200 text-red-600 p-4 rounded-lg mb-6 text-base">
                {locationError || locationErrorState}
              </div>
            )}

            {/* Auto-detect button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAutoDetect}
              disabled={isLocationLoading}
              className="w-full bg-primary-600 hover:bg-primary-700 text-white py-4 px-6 rounded-2xl text-lg font-bold hover:shadow-lg transition-all disabled:opacity-50 mb-6 flex items-center justify-center space-x-3"
            >
              {isLocationLoading ? (
                <>
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  <span>Detecting...</span>
                </>
              ) : (
                <>
                  <Navigation className="w-6 h-6" />
                  <span>Auto-detect my location</span>
                </>
              )}
            </motion.button>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-primary-200" />
              </div>
              <div className="relative flex justify-center text-lg">
                <span className="px-3 bg-cream-50 text-primary-500">or choose manually</span>
              </div>
            </div>

            {/* Manual selection */}
            <div className="space-y-4 mb-8">
              <label className="block text-lg font-semibold text-primary-800 mb-2">
                Select your city
              </label>
              {cities.length > 0 ? (
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full border border-primary-200 rounded-2xl px-5 py-4 text-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                >
                  <option value="">Choose a city</option>
                  {cities.map(city => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              ) : (
                <div className="text-primary-500 text-base">No cities available.</div>
              )}
            </div>

            <div className="flex space-x-4">
              {userCity && (
                <button
                  onClick={() => setShowLocationModal(false)}
                  className="flex-1 bg-primary-100 text-primary-700 py-4 px-6 rounded-2xl text-lg font-semibold hover:bg-primary-200 transition-colors"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={handleManualSelection}
                disabled={!selectedCity}
                className="flex-1 bg-primary-600 hover:bg-primary-700 text-white py-4 px-6 rounded-2xl text-lg font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};