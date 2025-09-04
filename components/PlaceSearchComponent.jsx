// components/PlaceSearchComponent.jsx - Componente de búsqueda de lugares
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  TextInput,
  FlatList,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Keyboard,
  Alert
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { mapsAPI } from '../services/api';
import { COLORS } from '../utils/constants';

const PlaceSearchComponent = ({ 
  onPlaceSelect,
  onClose,
  placeholder = "Buscar lugar...",
  initialQuery = "",
  showCurrentLocation = true,
  maxResults = 10,
  countryCode = 'co',
  style = {}
}) => {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  
  const searchTimeoutRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    // Limpiar timeout al desmontar
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Búsqueda con debounce
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (query.length >= 3) {
      searchTimeoutRef.current = setTimeout(() => {
        searchPlaces(query);
      }, 500);
    } else {
      setResults([]);
      setShowResults(false);
    }
  }, [query]);

  const searchPlaces = async (searchQuery) => {
    if (isLoading) return;

    setIsLoading(true);
    try {
      const response = await mapsAPI.searchPlaces(searchQuery, {
        limit: maxResults,
        countrycodes: countryCode
      });

      if (response.data.success) {
        const places = response.data.data.map(place => ({
          id: place.id,
          name: place.name,
          address: formatAddress(place.address),
          latitude: place.lat,
          longitude: place.lon,
          type: place.type,
          category: place.category,
          importance: place.importance
        }));

        setResults(places);
        setShowResults(true);
      } else {
        setResults([]);
        setShowResults(false);
      }
    } catch (error) {
      console.error('Error buscando lugares:', error);
      Alert.alert(
        'Error de búsqueda',
        'No se pudieron cargar los resultados. Verifica tu conexión.',
        [{ text: 'OK' }]
      );
    } finally {
      setIsLoading(false);
    }
  };

  const formatAddress = (address) => {
    if (!address) return '';
    
    const parts = [];
    if (address.road) parts.push(address.road);
    if (address.house_number) parts.push(`#${address.house_number}`);
    if (address.neighbourhood) parts.push(address.neighbourhood);
    if (address.city) parts.push(address.city);
    
    return parts.join(', ');
  };

  const handlePlaceSelect = (place) => {
    setQuery(place.name);
    setShowResults(false);
    Keyboard.dismiss();
    
    // Agregar a búsquedas recientes
    const updatedRecent = [place, ...recentSearches.filter(r => r.id !== place.id)].slice(0, 5);
    setRecentSearches(updatedRecent);
    
    if (onPlaceSelect) {
      onPlaceSelect(place);
    }
  };

  const handleCurrentLocation = () => {
    if (onPlaceSelect) {
      onPlaceSelect({ 
        type: 'current_location',
        name: 'Mi ubicación actual',
        address: 'Ubicación actual'
      });
    }
    setShowResults(false);
    Keyboard.dismiss();
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setShowResults(false);
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const renderPlaceItem = ({ item }) => (
    <TouchableOpacity
      style={styles.resultItem}
      onPress={() => handlePlaceSelect(item)}
    >
      <View style={styles.placeInfo}>
        <Ionicons 
          name={getPlaceIcon(item.type)} 
          size={20} 
          color={COLORS.secondary[600]} 
          style={styles.placeIcon}
        />
        <View style={styles.placeText}>
          <Text style={styles.placeName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.placeAddress} numberOfLines={1}>
            {item.address}
          </Text>
        </View>
      </View>
      <Ionicons 
        name="chevron-forward" 
        size={16} 
        color={COLORS.secondary[400]} 
      />
    </TouchableOpacity>
  );

  const getPlaceIcon = (type) => {
    const iconMap = {
      'restaurant': 'restaurant',
      'bank': 'card',
      'hospital': 'medical',
      'school': 'school',
      'pharmacy': 'medical',
      'fuel': 'car',
      'bus_stop': 'bus',
      'parking': 'car-sport',
      'default': 'location'
    };
    
    return iconMap[type] || iconMap.default;
  };

  return (
    <View style={[styles.container, style]}>
      {/* Barra de búsqueda */}
      <View style={styles.searchBar}>
        <Ionicons 
          name="search" 
          size={20} 
          color={COLORS.secondary[500]} 
          style={styles.searchIcon}
        />
        <TextInput
          ref={inputRef}
          style={styles.searchInput}
          placeholder={placeholder}
          value={query}
          onChangeText={setQuery}
          onFocus={() => setShowResults(results.length > 0)}
          autoCorrect={false}
          clearButtonMode="never"
          returnKeyType="search"
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={clearSearch} style={styles.clearButton}>
            <Ionicons name="close-circle" size={20} color={COLORS.secondary[400]} />
          </TouchableOpacity>
        )}
        {onClose && (
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeButtonText}>Cancelar</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Indicador de carga */}
      {isLoading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="small" color={COLORS.primary[600]} />
          <Text style={styles.loadingText}>Buscando lugares...</Text>
        </View>
      )}

      {/* Resultados de búsqueda */}
      {showResults && (
        <View style={styles.resultsContainer}>
          {showCurrentLocation && (
            <TouchableOpacity
              style={[styles.resultItem, styles.currentLocationItem]}
              onPress={handleCurrentLocation}
            >
              <View style={styles.placeInfo}>
                <Ionicons 
                  name="locate" 
                  size={20} 
                  color={COLORS.primary[600]} 
                  style={styles.placeIcon}
                />
                <View style={styles.placeText}>
                  <Text style={[styles.placeName, { color: COLORS.primary[600] }]}>
                    Mi ubicación actual
                  </Text>
                  <Text style={styles.placeAddress}>
                    Usar ubicación actual del GPS
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          )}

          <FlatList
            data={results}
            keyExtractor={(item) => item.id.toString()}
            renderItem={renderPlaceItem}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            maxHeight={300}
          />

          {results.length === 0 && !isLoading && query.length >= 3 && (
            <View style={styles.noResultsContainer}>
              <Ionicons name="search" size={40} color={COLORS.secondary[300]} />
              <Text style={styles.noResultsText}>
                No se encontraron lugares para "{query}"
              </Text>
              <Text style={styles.noResultsSubtext}>
                Intenta con un término diferente
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Búsquedas recientes */}
      {!showResults && !isLoading && query.length === 0 && recentSearches.length > 0 && (
        <View style={styles.recentContainer}>
          <Text style={styles.recentTitle}>Búsquedas recientes</Text>
          <FlatList
            data={recentSearches}
            keyExtractor={(item) => `recent-${item.id}`}
            renderItem={renderPlaceItem}
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.secondary[200],
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: COLORS.secondary[800],
    paddingVertical: 8,
  },
  clearButton: {
    padding: 5,
    marginLeft: 5,
  },
  closeButton: {
    marginLeft: 10,
    paddingHorizontal: 10,
  },
  closeButtonText: {
    color: COLORS.primary[600],
    fontSize: 16,
    fontWeight: '500',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginLeft: 10,
    fontSize: 14,
    color: COLORS.secondary[600],
  },
  resultsContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.secondary[100],
  },
  currentLocationItem: {
    backgroundColor: COLORS.primary[50],
    borderBottomWidth: 2,
    borderBottomColor: COLORS.primary[200],
  },
  placeInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  placeIcon: {
    marginRight: 12,
  },
  placeText: {
    flex: 1,
  },
  placeName: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.secondary[800],
    marginBottom: 2,
  },
  placeAddress: {
    fontSize: 14,
    color: COLORS.secondary[500],
  },
  noResultsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  noResultsText: {
    fontSize: 16,
    color: COLORS.secondary[600],
    textAlign: 'center',
    marginTop: 15,
    marginBottom: 5,
  },
  noResultsSubtext: {
    fontSize: 14,
    color: COLORS.secondary[400],
    textAlign: 'center',
  },
  recentContainer: {
    flex: 1,
    backgroundColor: COLORS.secondary[50],
  },
  recentTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.secondary[600],
    paddingHorizontal: 15,
    paddingVertical: 10,
    backgroundColor: COLORS.secondary[100],
  },
});

export default PlaceSearchComponent;