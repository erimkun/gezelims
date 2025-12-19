/**
 * Subcategory Configuration
 * Centralized subcategory mappings and icons
 */

import type { CategoryKey } from './categories.config';

/**
 * Subcategory to category mapping
 * Maps UI subcategory keys to their parent categories
 */
export const SUBCATEGORY_MAPPING: Record<CategoryKey, string[]> = {
  all: [],
  entertainment: [
    'subTheater',
    'subCinema',
    'subShopping',
    'subSpecialEnt'
  ],
  culture: [
    'subMuseums',
    'subCulturalCenters',
    'subArtCenters',
    'subCulturalTourism'
  ],
  food: [
    'subCafes',
    'subRestaurants',
    'subBakery',
    'subFastFood',
    'subSpecialFood',
    'subDrinks'
  ],
  nature: [
    'subParks',
    'subCoastal',
    'subSports',
    'subWalking',
    'subNature'
  ],
  other: [
    'subHealth',
    'subEducation',
    'subReligious',
    'subTransport',
    'subPublic',
    'subAccommodation'
  ]
};

/**
 * Subcategory keyword mapping for POI filtering
 * Maps subcategory keys to GeoJSON subcategory values
 */
export const SUBCATEGORY_KEYWORDS: Record<string, string[]> = {
  // Entertainment
  subTheater: ['Tiyatro', 'Sahne', 'Gösteri Merkezi'],
  subCinema: ['Sinema'],
  subShopping: ['AVM', 'Alışveriş Merkezi', 'Çarşı', 'Pazar'],
  subSpecialEnt: ['Akvaryum', 'Etkinlik', 'Düğün Salonu', 'Nargile Salonu'],
  
  // Culture
  subMuseums: ['Müze'],
  subCulturalCenters: ['Kültür Merkezi', 'Kongre', 'Konferans', 'Yaşam Merkezi'],
  subArtCenters: ['Sanat Atölyesi', 'Galeri', 'Stüdyo'],
  subCulturalTourism: ['Kültür', 'Turizm'],
  
  // Food
  subCafes: ['Kafe', 'Kahve', 'Çay Evi'],
  subRestaurants: ['Lokanta', 'Restoran', 'Kebap', 'Döner', 'Köfte', 'Balık', 'Et'],
  subBakery: ['Pastane', 'Tatlı', 'Fırın', 'Börek', 'Ekmek'],
  subFastFood: ['Fast Food', 'Hamburger', 'Sandviç', 'Tost', 'Büfe'],
  subSpecialFood: ['Pide', 'Mantı', 'Pizza', 'Pasta'],
  subDrinks: ['Bar', 'Pub', 'Meyhane', 'Bira'],
  
  // Nature
  subParks: ['Park', 'Yeşil Alan', 'Meydan'],
  subCoastal: ['Sahil', 'İskele', 'Rıhtım', 'Boğaz', 'Seyir'],
  subSports: ['Spor', 'Basketbol', 'Futbol', 'Fitness', 'Gym', 'Yüzme'],
  subWalking: ['Yürüyüş', 'Koşu', 'Bisiklet'],
  subNature: ['Koruluk', 'Mesire', 'Bahçe', 'Botanik', 'Doğa'],
  
  // Other
  subHealth: ['Hastane', 'Poliklinik', 'Eczane', 'Klinik', 'Sağlık'],
  subEducation: ['Okul', 'Üniversite', 'Kurs', 'Dershane', 'Anaokulu', 'Kreş', 'Eğitim'],
  subReligious: ['Cami', 'Türbe', 'Kilise', 'Sinagog', 'İbadet'],
  subTransport: ['Otobüs', 'Metro', 'Vapur', 'İskele', 'Otopark', 'Durak', 'İstasyon'],
  subPublic: ['Belediye', 'Emniyet', 'İtfaiye', 'PTT', 'Vergi', 'Kamu'],
  subAccommodation: ['Otel', 'Pansiyon', 'Apart', 'Konaklama']
};

/**
 * Get subcategories for a category
 * @param category Category key
 * @returns Array of subcategory keys
 */
export const getSubcategories = (category: CategoryKey): string[] => {
  return SUBCATEGORY_MAPPING[category] || [];
};

/**
 * Get keywords for a subcategory
 * @param subcategory Subcategory key
 * @returns Array of GeoJSON keywords
 */
export const getSubcategoryKeywords = (subcategory: string): string[] => {
  return SUBCATEGORY_KEYWORDS[subcategory] || [];
};

/**
 * Check if POI matches subcategory
 * @param poiSubcategory POI subcategory from GeoJSON
 * @param targetSubcategory Target subcategory key
 * @returns true if matches
 */
export const matchesSubcategory = (
  poiSubcategory: string,
  targetSubcategory: string
): boolean => {
  const keywords = getSubcategoryKeywords(targetSubcategory);
  return keywords.some(keyword => 
    poiSubcategory.toLowerCase().includes(keyword.toLowerCase())
  );
};
