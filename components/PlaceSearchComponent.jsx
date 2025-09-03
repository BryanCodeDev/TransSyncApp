// components/PlaceSearchComponent.jsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert
} from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../utils/constants';
import mapService from '../services/mapService';

const PlaceSearchComponent = ({ 
  onPlaceSelected, 
  placeholder = "Buscar lugar...", 
  currentLocation = null,
  showNearbyPlaces = true 
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const searchTimeout = useRef(null);

  useEffect(() => {
    if (currentLocation && showNearbyPlaces) {
      loadNearbyPlaces();
    }
  }, [currentLocation]);

  const loadNearbyPlaces = async () => {
    if (!currentLocation) return;
    
    try {
      const response = await mapService.getPopularPlaces(
        currentLocation.lat,
        currentLocation.lon
      );
      
      if (response.success) {
        setNearbyPlaces(response.data);
      }
    } catch (error) {
      console.error('Error cargando lugares cercanos:', error);
    }
  };

  const searchPlaces = async (searchQuery) => {
    if (searchQuery.length < 3) {
      setResults([]);
      return;
    }

    setLoading(true);
    
    try {
      const response = await mapService.searchPlaces(searchQuery, {
        limit: 8,
        countrycodes: 'co'
      });

      if (response.success) {
        setResults(response.data);
      } else {
        setResults([]);
        Alert.alert('Error', 'No se pudieron cargar los resultados');
      }
    } catch (error) {
      console.error('Error buscando lugares:', error);
      setResults([]);
      Alert.alert('Error', 'Error de conexión al buscar lugares');
    } finally {
      setLoading(false);
    }
  };

  const handleQueryChange = (text) => {
    setQuery(text);
    setShowResults(text.length > 0);

    // Cancelar búsqueda anterior
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    // Buscar con delay para evitar muchas requests
    searchTimeout.current = setTimeout(() => {
      searchPlaces(text);
    }, 500);
  };

  const handlePlaceSelect = (place) => {
    setQuery(place.name);
    setShowResults(false);
    setResults([]);
    
    if (onPlaceSelected) {
      onPlaceSelected(place);
    }
  };

  const formatAddress = (address) => {
    const parts = [];
    if (address.road) parts.push(address.road);
    if (address.city) parts.push(address.city);
    if (address.state) parts.push(address.state);
    return parts.join(', ') || 'Dirección no disponible';
  };

  const renderPlaceItem = ({ item }) => (
    <TouchableOpacity
      style={styles.resultItem}
      onPress={() => handlePlaceSelect(item)}
      activeOpacity={0.7}
    >
      <View style={styles.resultContent}>
        <Text style={styles.placeName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.placeAddress} numberOfLines={2}>
          {formatAddress(item.address)}
        </Text>
        {item.type && (
          <View style={styles.typeContainer}>
            <Text style={styles.placeType}>{item.type}</Text>
          </View>
        )}
      </View>
      <View style={styles.distanceContainer}>
        {currentLocation && (
          <Text style={styles.distanceText}>
            {mapService.formatDistance(
              mapService.calculateDistance(
                currentLocation.lat,
                currentLocation.lon,
                item.lat,
                item.lon
              )
            )}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  const renderNearbyCategory = ({ item }) => (
    <View style={styles.nearbyCategory}>
      <Text style={styles.categoryTitle}>{item.category}</Text>
      <View style={styles.categoryPlaces}>
        {item.places.map((place, index) => (
          <TouchableOpacity
            key={index}
            style={styles.nearbyPlace}
            onPress={() => handlePlaceSelect(place)}
            activeOpacity={0.7}
          >
            <Text style={styles.nearbyPlaceName} numberOfLines={1}>
              {place.name}
            </Text>
            <Text style={styles.nearbyPlaceDistance}>
              {currentLocation && mapService.formatDistance(
                mapService.calculateDistance(
                  currentLocation.lat,
                  currentLocation.lon,
                  place.lat,
                  place.lon
                )
              )}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder={placeholder}
          placeholderTextColor={COLORS.secondary[400]}
          value={query}
          onChangeText={handleQueryChange}
          onFocus={() => setShowResults(query.length > 0)}
          returnKeyType="search"
        />
        {loading && (
          <ActivityIndicator
            size="small"
            color={COLORS.primary[500]}
            style={styles.loadingIndicator}
          />
        )}
      </View>

      {showResults && (
        <View style={styles.resultsContainer}>
          {results.length > 0 ? (
            <FlatList
              data={results}
              renderItem={renderPlaceItem}
              keyExtractor={(item) => item.id.toString()}
              style={styles.resultsList}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            />
          ) : !loading && query.length >= 3 ? (
            <View style={styles.noResultsContainer}>
              <Text style={styles.noResultsText}>
                No se encontraron resultados para "{query}"
              </Text>
            </View>
          ) : null}
        </View>
      )}

      {!showResults && nearbyPlaces.length > 0 && (
        <View style={styles.nearbyContainer}>
          <Text style={styles.nearbyTitle}>Lugares cercanos</Text>
          <FlatList
            data={nearbyPlaces}
            renderItem={renderNearbyCategory}
            keyExtractor={(item, index) => index.toString()}
            showsVerticalScrollIndicator={false}
            style={styles.nearbyList}
          />
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    marginHorizontal: SPACING.md,
    marginVertical: SPACING.sm,
    ...SHADOWS.medium,
  },
  searchInput: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.base,
    color: COLORS.secondary[900],
    paddingVertical: SPACING.xs,
  },
  loadingIndicator: {
    marginLeft: SPACING.sm,
  },
  resultsContainer: {
    backgroundColor: COLORS.white,
    marginHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    maxHeight: 300,
    ...SHADOWS.medium,
  },
  resultsList: {
    maxHeight: 300,
  },
  resultItem: {
    flexDirection: 'row',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.secondary[100],
  },
  resultContent: {
    flex: 1,
  },
  placeName: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.secondary[900],
    marginBottom: SPACING.xs,
  },
  placeAddress: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.secondary[600],
    lineHeight: 18,
  },
  typeContainer: {
    alignSelf: 'flex-start',
    marginTop: SPACING.xs,
  },
  placeType: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.primary[600],
    backgroundColor: COLORS.primary[50],
    paddingHorizontal: SPACING.sm,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
    textTransform: 'capitalize',
  },
  distanceContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 60,
  },
  distanceText: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.secondary[500],
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  noResultsContainer: {
    padding: SPACING.lg,
    alignItems: 'center',
  },
  noResultsText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.secondary[600],
    textAlign: 'center',
  },
  nearbyContainer: {
    flex: 1,
    paddingHorizontal: SPACING.md,
    paddingTop: SPACING.md,
  },
  nearbyTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.secondary[900],
    marginBottom: SPACING.md,
  },
  nearbyList: {
    flex: 1,
  },
  nearbyCategory: {
    marginBottom: SPACING.lg,
  },
  categoryTitle: {
    fontSize: TYPOGRAPHY.sizes.base,
    fontWeight: TYPOGRAPHY.weights.medium,
    color: COLORS.secondary[800],
    marginBottom: SPACING.sm,
  },
  categoryPlaces: {
    gap: SPACING.xs,
  },
  nearbyPlace: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.secondary[50],
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  nearbyPlaceName: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.secondary[800],
    marginRight: SPACING.sm,
  },
  nearbyPlaceDistance: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.secondary[500],
    fontWeight: TYPOGRAPHY.weights.medium,
  },
});

export default PlaceSearchComponent;