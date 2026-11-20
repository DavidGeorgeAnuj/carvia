// CARVIA Main Screen — Google Maps style live map as the central UI
// Unified EV Charging & Smart Parking destination search and selection

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import InteractiveMap from '../components/InteractiveMap';
import { mockEVStations, mockParkingSpots } from '../data/mockData';

const { width } = Dimensions.get('window');

// Combine EV stations and parking spots into a unified destination directory
const ALL_DESTINATIONS = [
  ...mockEVStations.map((s) => ({
    ...s,
    category: 'ev',
    categoryLabel: 'EV Fast Charging',
    badgeIcon: '⚡',
  })),
  ...mockParkingSpots.map((p) => ({
    ...p,
    category: 'parking',
    categoryLabel: 'Smart Parking',
    badgeIcon: '🅿️',
  })),
];

// Quick Area shortcuts for Bengaluru
const BENGALURU_AREAS = [
  { name: 'Koramangala', lat: 12.9352, lng: 77.6245 },
  { name: 'Indiranagar', lat: 12.9784, lng: 77.6408 },
  { name: 'Whitefield', lat: 12.9698, lng: 77.7499 },
  { name: 'HSR Layout', lat: 12.9121, lng: 77.6446 },
  { name: 'MG Road', lat: 12.9756, lng: 77.6066 },
];

const FILTER_PILLS = [
  'All',
  '⚡ EV Charging',
  '🅿️ Parking',
  '🟢 Available',
  '⚡ 50kW+ Fast',
  '🏢 Covered',
  '< ₹40 / Rate',
];

export default function MapMainScreen({ navigation }) {
  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState(null);

  // Filtered destinations on the map
  const visibleLocations = useMemo(() => {
    return ALL_DESTINATIONS.filter((item) => {
      // 1. Filter pill criteria
      if (activeFilter === '⚡ EV Charging' && item.category !== 'ev') return false;
      if (activeFilter === '🅿️ Parking' && item.category !== 'parking') return false;
      if (activeFilter === '🟢 Available') {
        const isAvail = item.category === 'ev'
          ? (item.availableChargers > 0 || item.status === 'available')
          : (item.availableSpots > 0 || item.status === 'available');
        if (!isAvail) return false;
      }
      if (activeFilter === '⚡ 50kW+ Fast') {
        if (item.category !== 'ev' || (item.maxPower || 0) < 50) return false;
      }
      if (activeFilter === '🏢 Covered') {
        if (item.category !== 'parking' || !item.amenities?.includes('Covered')) return false;
      }
      if (activeFilter === '< ₹40 / Rate') {
        if (item.category === 'ev' && (item.pricePerUnit || 0) > 40) return false;
        if (item.category === 'parking' && (item.pricePerHour || 0) > 40) return false;
      }

      // 2. Search query matching
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = item.name.toLowerCase().includes(q) || (item.shortName && item.shortName.toLowerCase().includes(q));
        const matchesAddr = item.address.toLowerCase().includes(q);
        const matchesNet = item.network ? item.network.toLowerCase().includes(q) : false;
        if (!matchesName && !matchesAddr && !matchesNet) return false;
      }

      return true;
    });
  }, [searchQuery, activeFilter]);

  // Google Maps style live search results dropdown
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase().trim();
    return ALL_DESTINATIONS.filter((item) => {
      const matchesName = item.name.toLowerCase().includes(q) || (item.shortName && item.shortName.toLowerCase().includes(q));
      const matchesAddr = item.address.toLowerCase().includes(q);
      const matchesNet = item.network ? item.network.toLowerCase().includes(q) : false;
      return matchesName || matchesAddr || matchesNet;
    }).slice(0, 5);
  }, [searchQuery]);

  const handleSelectSearchResult = (dest) => {
    setSelectedLocation(dest);
    setIsSearchFocused(false);
  };

  const handleNavigateToDetail = (dest, autoAction = false) => {
    if (dest.category === 'ev') {
      navigation.navigate('EVDetail', { station: dest });
    } else {
      navigation.navigate('ParkingDetail', { spot: dest, autoBook: autoAction });
    }
  };

  return (
    <View style={styles.container}>
      {/* 1. Fullscreen Google Map with Dynamic EV & Parking Markers */}
      <InteractiveMap
        locations={visibleLocations}
        selectedLocation={selectedLocation}
        onSelectLocation={setSelectedLocation}
        center={[12.9352, 77.6245]}
        zoom={13}
      />

      {/* 2. Floating Header & Google Maps-Style Search Bar */}
      <SafeAreaView style={styles.floatingHeader} edges={['top']} pointerEvents="box-none">
        {/* Search Bar Input */}
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            value={searchQuery}
            onChangeText={(text) => {
              setSearchQuery(text);
              if (!isSearchFocused) setIsSearchFocused(true);
            }}
            onFocus={() => setIsSearchFocused(true)}
            placeholder="Search EV chargers, parking, places in Bengaluru..."
            placeholderTextColor={colors.textMuted}
            style={styles.searchInput}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery('');
                setIsSearchFocused(false);
              }}
              style={styles.clearSearchBtn}
            >
              <Text style={styles.clearSearchText}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Google Maps Live Autocomplete / Destination Search Results Dropdown */}
        {isSearchFocused && searchResults.length > 0 && (
          <View style={styles.searchResultsDropdown}>
            <ScrollView
              keyboardShouldPersistTaps="handled"
              style={{ maxHeight: 280 }}
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.dropdownHeaderLabel}>SUGGESTED DESTINATIONS</Text>
              {searchResults.map((dest) => {
                const isEV = dest.category === 'ev';
                return (
                  <TouchableOpacity
                    key={dest.id}
                    onPress={() => handleSelectSearchResult(dest)}
                    style={styles.searchResultItem}
                    activeOpacity={0.7}
                  >
                    <View style={[styles.resultIconCircle, isEV ? styles.iconCircleEV : styles.iconCircleParking]}>
                      <Text style={{ fontSize: 16 }}>{isEV ? '⚡' : '🅿️'}</Text>
                    </View>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Text style={styles.resultItemName} numberOfLines={1}>
                        {dest.name}
                      </Text>
                      <Text style={styles.resultItemAddress} numberOfLines={1}>
                        📍 {dest.address}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={[styles.resultBadgeText, isEV ? { color: colors.primary } : { color: colors.secondary }]}>
                        {isEV ? `₹${dest.pricePerUnit}/kWh` : `₹${dest.pricePerHour}/hr`}
                      </Text>
                      <Text style={styles.resultDistText}>{dest.distance}</Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        )}

        {/* Quick Area Chips (Koramangala, Indiranagar, etc.) */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.areaScroll}
        >
          {BENGALURU_AREAS.map((area) => (
            <TouchableOpacity
              key={area.name}
              onPress={() => {
                setSearchQuery(area.name);
                setIsSearchFocused(false);
              }}
              style={styles.areaChip}
            >
              <Text style={styles.areaChipText}>📍 {area.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Filter Pills (All, EV Charging, Parking, etc.) */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {FILTER_PILLS.map((pill) => {
            const isActive = activeFilter === pill;
            const isEVFilter = pill.includes('⚡') || pill.includes('EV');
            const isParkingFilter = pill.includes('🅿️') || pill.includes('Covered');

            return (
              <TouchableOpacity
                key={pill}
                onPress={() => setActiveFilter(pill)}
                style={[
                  styles.filterChip,
                  isActive && (isParkingFilter ? styles.filterChipActiveParking : styles.filterChipActive),
                ]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    isActive && styles.filterChipTextActive,
                  ]}
                >
                  {pill}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </SafeAreaView>

      {/* 3. Floating Recenter / Clear Selection Button */}
      <View style={styles.floatingControls}>
        <TouchableOpacity
          onPress={() => {
            setSelectedLocation(null);
            setSearchQuery('');
            setIsSearchFocused(false);
          }}
          style={styles.floatingBtn}
          accessibilityLabel="Recenter Map"
        >
          <Text style={{ fontSize: 20 }}>🎯</Text>
        </TouchableOpacity>
      </View>

      {/* 4. Google Maps-Style Destination Selection Preview Card */}
      {selectedLocation && (
        <View style={styles.bottomSheet} pointerEvents="box-none">
          <LinearGradient
            colors={['#161D1A', '#0D1110']}
            style={styles.bottomSheetGradient}
          >
            {/* Header / Category Badge & Rating */}
            <View style={styles.sheetHeader}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                  <View
                    style={[
                      styles.categoryBadgeContainer,
                      selectedLocation.category === 'ev' ? styles.badgeEV : styles.badgeParking,
                    ]}
                  >
                    <Text
                      style={[
                        styles.sheetBadge,
                        selectedLocation.category === 'ev' ? { color: colors.primary } : { color: colors.secondary },
                      ]}
                    >
                      {selectedLocation.category === 'ev'
                        ? `⚡ ${selectedLocation.network || 'EV CHARGING'}`
                        : `🅿️ SMART PARKING`}
                    </Text>
                  </View>
                  <Text style={styles.sheetRating}>★ {selectedLocation.rating}</Text>
                  <Text style={styles.reviewCount}>({selectedLocation.totalReviews || 120}+ reviews)</Text>
                </View>

                <Text style={styles.sheetTitle} numberOfLines={1}>
                  {selectedLocation.name}
                </Text>
                <Text style={styles.sheetAddress} numberOfLines={1}>
                  📍 {selectedLocation.address} · {selectedLocation.distance} away
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => setSelectedLocation(null)}
                style={styles.closeBtn}
                accessibilityLabel="Close Preview"
              >
                <Text style={{ color: colors.textSecondary, fontSize: 16 }}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Quick Metrics Row */}
            <View style={styles.metricsRow}>
              {selectedLocation.category === 'ev' ? (
                <>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricVal}>₹{selectedLocation.pricePerUnit || 15}</Text>
                    <Text style={styles.metricLbl}>/ kWh</Text>
                  </View>
                  <View style={styles.metricDivider} />
                  <View style={styles.metricItem}>
                    <Text style={[styles.metricVal, { color: colors.primary }]}>
                      {selectedLocation.availableChargers || 2} free
                    </Text>
                    <Text style={styles.metricLbl}>chargers</Text>
                  </View>
                  <View style={styles.metricDivider} />
                  <View style={styles.metricItem}>
                    <Text style={[styles.metricVal, { color: colors.secondary }]}>
                      {selectedLocation.maxPower || 60} kW
                    </Text>
                    <Text style={styles.metricLbl}>fast speed</Text>
                  </View>
                  <View style={styles.metricDivider} />
                  <View style={styles.metricItem}>
                    <Text style={styles.metricVal}>{selectedLocation.distance || '0.6 km'}</Text>
                    <Text style={styles.metricLbl}>distance</Text>
                  </View>
                </>
              ) : (
                <>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricVal}>₹{selectedLocation.pricePerHour || 40}</Text>
                    <Text style={styles.metricLbl}>/ hour</Text>
                  </View>
                  <View style={styles.metricDivider} />
                  <View style={styles.metricItem}>
                    <Text style={[styles.metricVal, { color: colors.secondary }]}>
                      {selectedLocation.availableSpots || 42} free
                    </Text>
                    <Text style={styles.metricLbl}>spots left</Text>
                  </View>
                  <View style={styles.metricDivider} />
                  <View style={styles.metricItem}>
                    <Text style={styles.metricVal}>{selectedLocation.operatingHours ? '24/7' : 'Covered'}</Text>
                    <Text style={styles.metricLbl}>facility</Text>
                  </View>
                  <View style={styles.metricDivider} />
                  <View style={styles.metricItem}>
                    <Text style={styles.metricVal}>{selectedLocation.distance || '0.4 km'}</Text>
                    <Text style={styles.metricLbl}>distance</Text>
                  </View>
                </>
              )}
            </View>

            {/* Google Maps Destination Action Buttons — Direct Navigation to Detail/Booking */}
            <View style={styles.actionRow}>
              <TouchableOpacity
                onPress={() => handleNavigateToDetail(selectedLocation, true)}
                style={styles.primaryActionBtn}
                activeOpacity={0.85}
              >
                <LinearGradient
                  colors={
                    selectedLocation.category === 'ev'
                      ? ['#2FD987', '#1AAD64']
                      : ['#3B9EFF', '#1A73E8']
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.actionGradient}
                >
                  <Text style={styles.primaryActionText}>
                    {selectedLocation.category === 'ev' ? '⚡ Start Charging' : '🅿️ Book Spot Now'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleNavigateToDetail(selectedLocation, false)}
                style={styles.secondaryActionBtn}
                activeOpacity={0.8}
              >
                <Text style={styles.secondaryActionText}>View Full Page</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  floatingHeader: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(20, 25, 24, 0.96)',
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 50,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 4 },
    elevation: 10,
  },
  searchIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Inter_500Medium',
    fontSize: 14,
    color: colors.textPrimary,
  },
  clearSearchBtn: {
    padding: 6,
  },
  clearSearchText: {
    color: colors.textSecondary,
    fontSize: 15,
    fontFamily: 'Inter_600SemiBold',
  },
  searchResultsDropdown: {
    backgroundColor: 'rgba(20, 25, 24, 0.98)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 12,
    shadowColor: '#000',
    shadowOpacity: 0.6,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 15,
  },
  dropdownHeaderLabel: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 10,
    color: colors.textMuted,
    letterSpacing: 1.2,
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  resultIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconCircleEV: {
    backgroundColor: 'rgba(47, 217, 135, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(47, 217, 135, 0.3)',
  },
  iconCircleParking: {
    backgroundColor: 'rgba(59, 158, 255, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(59, 158, 255, 0.3)',
  },
  resultItemName: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 14,
    color: colors.textPrimary,
  },
  resultItemAddress: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  resultBadgeText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 13,
  },
  resultDistText: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  areaScroll: {
    paddingVertical: 8,
    gap: 8,
  },
  areaChip: {
    backgroundColor: 'rgba(20, 25, 24, 0.92)',
    borderRadius: 20,
    paddingHorizontal: 13,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  areaChipText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: colors.textSecondary,
  },
  filterScroll: {
    paddingBottom: 4,
    gap: 8,
  },
  filterChip: {
    backgroundColor: 'rgba(20, 25, 24, 0.92)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterChipActiveParking: {
    backgroundColor: colors.secondary,
    borderColor: colors.secondary,
  },
  filterChipText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 12,
    color: colors.textSecondary,
  },
  filterChipTextActive: {
    color: colors.bg,
    fontFamily: 'Inter_700Bold',
  },
  floatingControls: {
    position: 'absolute',
    right: 16,
    bottom: 250,
    zIndex: 90,
  },
  floatingBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  bottomSheet: {
    position: 'absolute',
    bottom: 85,
    left: 14,
    right: 14,
    zIndex: 100,
  },
  bottomSheetGradient: {
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.6,
    shadowRadius: 20,
    elevation: 16,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  categoryBadgeContainer: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeEV: {
    backgroundColor: 'rgba(47, 217, 135, 0.15)',
  },
  badgeParking: {
    backgroundColor: 'rgba(59, 158, 255, 0.15)',
  },
  sheetBadge: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 10,
    letterSpacing: 0.8,
  },
  sheetRating: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 12,
    color: colors.warning,
  },
  reviewCount: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: colors.textMuted,
  },
  sheetTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 17,
    color: colors.textPrimary,
  },
  sheetAddress: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  metricsRow: {
    flexDirection: 'row',
    backgroundColor: colors.bgElevated,
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.04)',
  },
  metricItem: {
    flex: 1,
    alignItems: 'center',
  },
  metricVal: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 14,
    color: colors.textPrimary,
  },
  metricLbl: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
  },
  metricDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.border,
    alignSelf: 'center',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
  },
  primaryActionBtn: {
    flex: 1,
    borderRadius: 14,
    overflow: 'hidden',
  },
  actionGradient: {
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryActionText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 14,
    color: '#0D1110',
  },
  secondaryActionBtn: {
    paddingHorizontal: 18,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bgElevated,
  },
  secondaryActionText: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 13,
    color: colors.textPrimary,
  },
});
