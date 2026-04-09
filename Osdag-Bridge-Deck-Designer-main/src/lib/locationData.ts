// Location data for 5 major Indian cities with wind, seismic, and temperature data
// Based on IRC codes and Indian meteorological data

export interface LocationData {
  state: string;
  district: string;
  basicWindSpeed: number; // m/s
  seismicZone: string;
  zoneFactor: number;
  maxTemp: number; // °C
  minTemp: number; // °C
}

export const locationDatabase: LocationData[] = [
  {
    state: 'Maharashtra',
    district: 'Mumbai',
    basicWindSpeed: 44,
    seismicZone: 'III',
    zoneFactor: 0.16,
    maxTemp: 42,
    minTemp: 15,
  },
  {
    state: 'Delhi',
    district: 'New Delhi',
    basicWindSpeed: 47,
    seismicZone: 'IV',
    zoneFactor: 0.24,
    maxTemp: 47,
    minTemp: 2,
  },
  {
    state: 'Tamil Nadu',
    district: 'Chennai',
    basicWindSpeed: 50,
    seismicZone: 'III',
    zoneFactor: 0.16,
    maxTemp: 45,
    minTemp: 18,
  },
  {
    state: 'Karnataka',
    district: 'Bangalore',
    basicWindSpeed: 33,
    seismicZone: 'II',
    zoneFactor: 0.10,
    maxTemp: 38,
    minTemp: 12,
  },
  {
    state: 'West Bengal',
    district: 'Kolkata',
    basicWindSpeed: 50,
    seismicZone: 'III',
    zoneFactor: 0.16,
    maxTemp: 43,
    minTemp: 8,
  },
];

export const getStates = (): string[] => {
  return [...new Set(locationDatabase.map((loc) => loc.state))];
};

export const getDistrictsByState = (state: string): string[] => {
  return locationDatabase
    .filter((loc) => loc.state === state)
    .map((loc) => loc.district);
};

export const getLocationData = (state: string, district: string): LocationData | undefined => {
  return locationDatabase.find(
    (loc) => loc.state === state && loc.district === district
  );
};

// Steel grades for girder and cross bracing
export const steelGrades = ['E250', 'E350', 'E450'];

// Concrete grades for deck
export const concreteGrades = ['M25', 'M30', 'M35', 'M40', 'M45', 'M50', 'M55', 'M60'];

// Footpath options
export const footpathOptions = ['None', 'Single-Sided', 'Both'];
