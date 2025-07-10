import React, { createContext, useContext, useState, useEffect } from 'react';

interface LocationContextType {
  userCity: string | null;
  isLocationLoading: boolean;
  requestLocation: () => Promise<void>;
  setUserCity: (city: string) => void;
  locationError: string | null;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};

// Mock city detection based on coordinates (in real app, use reverse geocoding API)
const getCityFromCoordinates = (lat: number, lng: number): string => {
  // Mock implementation - in real app, use Google Maps Geocoding API or similar
  const cities = [
    { name: 'Mumbai', lat: 19.0760, lng: 72.8777, radius: 50 },
    { name: 'Delhi', lat: 28.7041, lng: 77.1025, radius: 50 },
    { name: 'Bangalore', lat: 12.9716, lng: 77.5946, radius: 50 },
    { name: 'Chennai', lat: 13.0827, lng: 80.2707, radius: 50 },
    { name: 'Kolkata', lat: 22.5726, lng: 88.3639, radius: 50 },
    { name: 'Hyderabad', lat: 17.3850, lng: 78.4867, radius: 50 }
  ];

  for (const city of cities) {
    const distance = Math.sqrt(
      Math.pow(lat - city.lat, 2) + Math.pow(lng - city.lng, 2)
    );
    if (distance < city.radius / 111) { // Rough conversion to degrees
      return city.name;
    }
  }

  return 'Mumbai'; // Default fallback
};

export const LocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [userCity, setUserCityState] = useState<string | null>(
    localStorage.getItem('userCity')
  );
  const [isLocationLoading, setIsLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const setUserCity = (city: string) => {
    setUserCityState(city);
    localStorage.setItem('userCity', city);
    setLocationError(null);
  };

  const requestLocation = async (): Promise<void> => {
    setIsLocationLoading(true);
    setLocationError(null);

    try {
      if (!navigator.geolocation) {
        throw new Error('Geolocation is not supported by this browser');
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        });
      });

      const { latitude, longitude } = position.coords;
      const detectedCity = getCityFromCoordinates(latitude, longitude);
      setUserCity(detectedCity);
    } catch (error) {
      console.error('Location detection failed:', error);
      setLocationError('Unable to detect location. Please select your city manually.');
    } finally {
      setIsLocationLoading(false);
    }
  };

  // Auto-detect location on first visit
  useEffect(() => {
    if (!userCity && !localStorage.getItem('locationRequested')) {
      localStorage.setItem('locationRequested', 'true');
      requestLocation();
    }
  }, [userCity]);

  return (
    <LocationContext.Provider value={{
      userCity,
      isLocationLoading,
      requestLocation,
      setUserCity,
      locationError
    }}>
      {children}
    </LocationContext.Provider>
  );
};