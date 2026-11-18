// CARVIA Main Screen — Google Maps style live map as the central UI
// Supports seamless switching between EV Charging and Smart Parking modes

import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  Dimensions,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import InteractiveMap from '../components/InteractiveMap';
import ModeSelectModal from '../components/ModeSelectModal';
import { mockEVStations, mockParkingSpots } from '../data/mockData';

const { width } = Dimensions.get('window');

// Filter presets
const EV_FILTERS = ['All', '⚡ 50kW+ Fast', '🚀 120kW+ Ultra', '🟢 Available', '🔌 CCS2', '24/7 Open'];
const PARKING_FILTERS = ['All', '🟢 Available', '🏢 Covered', '🛡️ CCTV', '⚡ EV Ready', '< ₹40/hr'];

// Quick Area shortcuts for Bengaluru
const BENGALURU_AREAS = [
  { name: 'Koramangala', lat: 12.9352, lng: 77.6245 },
  { name: 'Indiranagar', lat: 12.9784, lng: 77.6408 },
  { name: 'Whitefield', lat: 12.9698, lng: 77.7499 },
  { name: 'HSR Layout', lat: 12.9121, lng: 77.6446 },
  { name: 'MG Road', lat: 12.9756, lng: 77.6066 },
];

export default function MapMainScreen({ navigation }) {
  // Mode state: 'ev' | 'parking'
  const [mode, setMode] = useState('ev');
  const [showModeModal, setShowModeModal] = useState(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [selectedLocation, setSelectedLocation] = useState(null);

  // Booking / Charging Modals
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingHours, setBookingHours] = useState(2);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);

  const [showChargeModal, setShowChargeModal] = useState(false);
  const [chargeTimer, setChargeTimer] = useState(0);
  const [chargeActive, setChargeActive] = useState(false);

  // Get raw list based on mode
  const rawLocations = mode === 'ev' ? mockEVStations : mockParkingSpots;

  // Filtered locations
  const filteredLocations = useMemo(() => {
    return rawLocations.filter((item) => {
      // Search matching
      if (searchQuery.trim().length > 0) {
        const q = searchQuery.toLowerCase();
        const matchesName = item.name.toLowerCase().includes(q);
        const matchesAddr = item.address.toLowerCase().includes(q);
        const matchesNet = item.network ? item.network.toLowerCase().includes(q) : false;
        if (!matchesName && !matchesAddr && !matchesNet) return false;
      }

      // Filter pills
      if (mode === 'ev') {
        if (activeFilter === '⚡ 50kW+ Fast') return (item.maxPower || 0) >= 50;
        if (activeFilter === '🚀 120kW+ Ultra') return (item.maxPower || 0) >= 120;
        if (activeFilter === '🟢 Available') return item.availableChargers > 0 || item.status === 'available';
        if (activeFilter === '🔌 CCS2') return item.connectors?.some((c) => c.type === 'CCS2');
        if (activeFilter === '24/7 Open') return item.operatingHours === '00:00 – 23:59';
      } else {
        if (activeFilter === '🟢 Available') return item.availableSpots > 0 || item.status === 'available';
        if (activeFilter === '🏢 Covered') return item.amenities?.includes('Covered');
        if (activeFilter === '🛡️ CCTV') return item.amenities?.includes('CCTV');
        if (activeFilter === '⚡ EV Ready') return item.amenities?.includes('EV Charging');
        if (activeFilter === '< ₹40/hr') return item.pricePerHour <= 40;
      }

      return true;
    });
  }, [rawLocations, searchQuery, activeFilter, mode]);

  const handleSelectMode = (newMode) => {
    setMode(newMode);
    setShowModeModal(false);
    setSelectedLocation(null);
    setActiveFilter('All');
  };

  const handleStartBooking = () => {
    setShowBookingModal(true);
    setBookingConfirmed(false);
  };

  const handleStartCharging = () => {
    setShowChargeModal(true);
    setChargeActive(true);
    setChargeTimer(0);
  };

  return (
    <View style={styles.container}>
      {/* 1. Fullscreen Interactive Map */}
      <InteractiveMap
        locations={filteredLocations}
        mode={mode}
        selectedLocation={selectedLocation}
        onSelectLocation={setSelectedLocation}
        center={[12.9352, 77.6245]}
        zoom={13}
      />

      {/* 2. Floating Top Header & Search Bar */}
      <SafeAreaView style={styles.floatingHeader} edges={['top']}>
        {/* Mode Switcher Pill */}
        <View style={styles.modePillContainer}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => handleSelectMode('ev')}
            style={[styles.modeTab, mode === 'ev' && styles.modeTabActiveEV]}
          >
            <Text style={[styles.modeTabText, mode === 'ev' && styles.modeTabTextActiveEV]}>
              ⚡ EV Charging
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => handleSelectMode('parking')}
            style={[styles.modeTab, mode === 'parking' && styles.modeTabActiveParking]}
          >
            <Text style={[styles.modeTabText, mode === 'parking' && styles.modeTabTextActiveParking]}>
              🅿️ Smart Parking
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <View style={styles.searchBox}>
          <Text style={{ fontSize: 16, marginRight: 8 }}>🔍</Text>
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={
              mode === 'ev'
                ? 'Search chargers, areas (Koramangala, Whitefield)...'
                : 'Search parking spots, malls, areas...'
            }
            placeholderTextColor={colors.textMuted}
            style={styles.searchInput}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')} style={{ padding: 4 }}>
              <Text style={{ color: colors.textSecondary, fontSize: 14 }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Quick Bengaluru Area Chips */}
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
              }}
              style={styles.areaChip}
            >
              <Text style={styles.areaChipText}>📍 {area.name}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Filter Chips Row */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScroll}
        >
          {(mode === 'ev' ? EV_FILTERS : PARKING_FILTERS).map((filter) => {
            const isActive = activeFilter === filter;
            return (
              <TouchableOpacity
                key={filter}
                onPress={() => setActiveFilter(filter)}
                style={[
                  styles.filterChip,
                  isActive && (mode === 'ev' ? styles.filterChipActiveEV : styles.filterChipActiveParking),
                ]}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    isActive && styles.filterChipTextActive,
                  ]}
                >
                  {filter}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </SafeAreaView>

      {/* 3. Floating Location Recenter Button */}
      <View style={styles.floatingControls}>
        <TouchableOpacity
          onPress={() => {
            setSelectedLocation(null);
            setSearchQuery('');
          }}
          style={styles.floatingBtn}
        >
          <Text style={{ fontSize: 20 }}>🎯</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setShowModeModal(true)}
          style={[styles.floatingBtn, { marginTop: 10 }]}
        >
          <Text style={{ fontSize: 18 }}>🔀</Text>
        </TouchableOpacity>
      </View>

      {/* 4. Bottom Sliding Location Preview Sheet (When a pin is tapped) */}
      {selectedLocation && (
        <View style={styles.bottomSheet}>
          <LinearGradient
            colors={['#141918', '#0D1110']}
            style={styles.bottomSheetGradient}
          >
            {/* Header */}
            <View style={styles.sheetHeader}>
              <View style={{ flex: 1, marginRight: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                  <Text style={styles.sheetBadge}>
                    {mode === 'ev' ? (selectedLocation.network || 'EV CHARGING') : 'SMART PARKING'}
                  </Text>
                  <Text style={styles.sheetRating}>★ {selectedLocation.rating}</Text>
                </View>
                <Text style={styles.sheetTitle} numberOfLines={1}>
                  {selectedLocation.name}
                </Text>
                <Text style={styles.sheetAddress} numberOfLines={1}>
                  {selectedLocation.address}
                </Text>
              </View>

              <TouchableOpacity
                onPress={() => setSelectedLocation(null)}
                style={styles.closeBtn}
              >
                <Text style={{ color: colors.textSecondary, fontSize: 16 }}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Key Metrics Row */}
            <View style={styles.metricsRow}>
              {mode === 'ev' ? (
                <>
                  <View style={styles.metricItem}>
                    <Text style={styles.metricVal}>₹{selectedLocation.pricePerUnit || 16}</Text>
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
                    <Text style={styles.metricLbl}>max power</Text>
                  </View>
                  <View style={styles.metricDivider} />
                  <View style={styles.metricItem}>
                    <Text style={styles.metricVal}>{selectedLocation.distance || '1.2 km'}</Text>
                    <Text style={styles.metricLbl}>away</Text>
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
                    <Text style={[styles.metricVal, { color: colors.primary }]}>
                      {selectedLocation.availableSpots || 42} free
                    </Text>
                    <Text style={styles.metricLbl}>spots left</Text>
                  </View>
                  <View style={styles.metricDivider} />
                  <View style={styles.metricItem}>
                    <Text style={styles.metricVal}>{selectedLocation.operatingHours ? '24/7' : 'Covered'}</Text>
                    <Text style={styles.metricLbl}>type</Text>
                  </View>
                  <View style={styles.metricDivider} />
                  <View style={styles.metricItem}>
                    <Text style={styles.metricVal}>{selectedLocation.distance || '0.8 km'}</Text>
                    <Text style={styles.metricLbl}>away</Text>
                  </View>
                </>
              )}
            </View>

            {/* Action Buttons */}
            <View style={styles.actionRow}>
              {mode === 'ev' ? (
                <TouchableOpacity
                  onPress={handleStartCharging}
                  style={styles.primaryActionBtn}
                >
                  <LinearGradient
                    colors={['#2FD987', '#1AAD64']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.actionGradient}
                  >
                    <Text style={styles.primaryActionText}>⚡ Start Charging</Text>
                  </LinearGradient>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  onPress={handleStartBooking}
                  style={styles.primaryActionBtn}
                >
                  <LinearGradient
                    colors={['#3B9EFF', '#1A73E8']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.actionGradient}
                  >
                    <Text style={styles.primaryActionText}>🅿️ Reserve Spot</Text>
                  </LinearGradient>
                </TouchableOpacity>
              )}

              <TouchableOpacity
                onPress={() => {
                  if (mode === 'ev') {
                    navigation.navigate('EVDetail', { station: selectedLocation });
                  } else {
                    navigation.navigate('ParkingDetail', { spot: selectedLocation });
                  }
                }}
                style={styles.secondaryActionBtn}
              >
                <Text style={styles.secondaryActionText}>Details</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>
      )}

      {/* 5. Startup / Mode Selector Modal */}
      <ModeSelectModal
        visible={showModeModal}
        onSelectMode={handleSelectMode}
      />

      {/* 6. Live EV Charging Simulation Modal */}
      <Modal visible={showChargeModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            <Text style={styles.modalTitle}>⚡ Live EV Charging</Text>
            <Text style={styles.modalSub}>{selectedLocation?.name}</Text>

            <View style={styles.chargeRing}>
              <Text style={styles.chargePercent}>67%</Text>
              <Text style={styles.chargeRate}>48.2 kW Rate</Text>
            </View>

            <View style={styles.chargeStatsRow}>
              <View style={styles.chargeStatBox}>
                <Text style={styles.chargeStatVal}>14.8 kWh</Text>
                <Text style={styles.chargeStatLbl}>Delivered</Text>
              </View>
              <View style={styles.chargeStatBox}>
                <Text style={styles.chargeStatVal}>₹236.80</Text>
                <Text style={styles.chargeStatLbl}>Live Cost</Text>
              </View>
              <View style={styles.chargeStatBox}>
                <Text style={styles.chargeStatVal}>18m 30s</Text>
                <Text style={styles.chargeStatLbl}>Elapsed</Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={() => setShowChargeModal(false)}
              style={styles.stopChargeBtn}
            >
              <Text style={styles.stopChargeText}>STOP CHARGING</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 7. Smart Parking Booking Modal */}
      <Modal visible={showBookingModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHandle} />
            {bookingConfirmed ? (
              <View style={{ alignItems: 'center', paddingVertical: 20 }}>
                <Text style={{ fontSize: 44, marginBottom: 12 }}>✅</Text>
                <Text style={styles.modalTitle}>Spot Reserved!</Text>
                <Text style={styles.modalSub}>
                  Slot #B2-14 at {selectedLocation?.name}
                </Text>
                <Text style={{ color: colors.primary, fontFamily: 'SpaceGrotesk_700Bold', fontSize: 16, marginTop: 10 }}>
                  Valid for {bookingHours} Hours · ₹{bookingHours * (selectedLocation?.pricePerHour || 40)}
                </Text>
                <TouchableOpacity
                  onPress={() => setShowBookingModal(false)}
                  style={[styles.primaryActionBtn, { marginTop: 24, width: '100%' }]}
                >
                  <LinearGradient
                    colors={['#2FD987', '#1AAD64']}
                    style={styles.actionGradient}
                  >
                    <Text style={styles.primaryActionText}>Done</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <Text style={styles.modalTitle}>🅿️ Reserve Parking Spot</Text>
                <Text style={styles.modalSub}>{selectedLocation?.name}</Text>

                <Text style={styles.durationTitle}>Select Duration</Text>
                <View style={styles.hourChipRow}>
                  {[1, 2, 4, 8].map((h) => (
                    <TouchableOpacity
                      key={h}
                      onPress={() => setBookingHours(h)}
                      style={[styles.hourChip, bookingHours === h && styles.hourChipActive]}
                    >
                      <Text style={[styles.hourChipText, bookingHours === h && styles.hourChipTextActive]}>
                        {h} {h === 1 ? 'Hour' : 'Hours'}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={styles.priceRow}>
                  <Text style={styles.priceLbl}>Total (₹{selectedLocation?.pricePerHour || 40} × {bookingHours}h):</Text>
                  <Text style={styles.priceValue}>₹{bookingHours * (selectedLocation?.pricePerHour || 40)}</Text>
                </View>

                <TouchableOpacity
                  onPress={() => setBookingConfirmed(true)}
                  style={[styles.primaryActionBtn, { marginTop: 16 }]}
                >
                  <LinearGradient
                    colors={['#3B9EFF', '#1A73E8']}
                    style={styles.actionGradient}
                  >
                    <Text style={styles.primaryActionText}>
                      Pay ₹{bookingHours * (selectedLocation?.pricePerHour || 40)} & Confirm
                    </Text>
                  </LinearGradient>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
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
  modePillContainer: {
    flexDirection: 'row',
    backgroundColor: 'rgba(20, 25, 24, 0.92)',
    borderRadius: 30,
    padding: 4,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 8,
  },
  modeTab: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: 24,
  },
  modeTabActiveEV: {
    backgroundColor: colors.primaryGlow,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  modeTabActiveParking: {
    backgroundColor: 'rgba(59, 158, 255, 0.15)',
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  modeTabText: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 13,
    color: colors.textSecondary,
  },
  modeTabTextActiveEV: {
    color: colors.primary,
  },
  modeTabTextActiveParking: {
    color: colors.secondary,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(26, 32, 30, 0.95)',
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
  },
  searchInput: {
    flex: 1,
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: colors.textPrimary,
  },
  areaScroll: {
    paddingVertical: 8,
    gap: 8,
  },
  areaChip: {
    backgroundColor: 'rgba(20, 25, 24, 0.9)',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 5,
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
    backgroundColor: 'rgba(20, 25, 24, 0.9)',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActiveEV: {
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
    fontFamily: 'Inter_600SemiBold',
  },
  floatingControls: {
    position: 'absolute',
    right: 16,
    bottom: 230,
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
    bottom: 75,
    left: 12,
    right: 12,
    zIndex: 100,
  },
  bottomSheetGradient: {
    borderRadius: 20,
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
  sheetBadge: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 10,
    color: colors.primary,
    letterSpacing: 1,
  },
  sheetRating: {
    fontFamily: 'Inter_600SemiBold',
    fontSize: 11,
    color: colors.warning,
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
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.bgElevated,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metricsRow: {
    flexDirection: 'row',
    backgroundColor: colors.bgElevated,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginBottom: 14,
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
    borderRadius: 12,
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
    paddingHorizontal: 20,
    borderRadius: 12,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.bgElevated,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  modalHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 20,
    color: colors.textPrimary,
  },
  modalSub: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
    marginBottom: 20,
  },
  chargeRing: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: colors.primary,
    alignSelf: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    backgroundColor: colors.primaryGlow,
  },
  chargePercent: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 28,
    color: colors.textPrimary,
  },
  chargeRate: {
    fontFamily: 'Inter_400Regular',
    fontSize: 11,
    color: colors.primary,
  },
  chargeStatsRow: {
    flexDirection: 'row',
    gap: 10,
    marginVertical: 20,
  },
  chargeStatBox: {
    flex: 1,
    backgroundColor: colors.bgCard,
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  chargeStatVal: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 16,
    color: colors.primary,
  },
  chargeStatLbl: {
    fontFamily: 'Inter_400Regular',
    fontSize: 10,
    color: colors.textSecondary,
    marginTop: 2,
  },
  stopChargeBtn: {
    backgroundColor: 'rgba(255, 90, 90, 0.15)',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.error,
    paddingVertical: 14,
    alignItems: 'center',
  },
  stopChargeText: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 14,
    color: colors.error,
  },
  durationTitle: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 14,
    color: colors.textPrimary,
    marginBottom: 10,
  },
  hourChipRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 18,
  },
  hourChip: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
    backgroundColor: colors.bgCard,
    borderWidth: 1,
    borderColor: colors.border,
  },
  hourChipActive: {
    borderColor: colors.secondary,
    backgroundColor: 'rgba(59, 158, 255, 0.15)',
  },
  hourChipText: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: colors.textSecondary,
  },
  hourChipTextActive: {
    color: colors.secondary,
    fontFamily: 'Inter_600SemiBold',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  priceLbl: {
    fontFamily: 'Inter_400Regular',
    fontSize: 14,
    color: colors.textSecondary,
  },
  priceValue: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 16,
    color: colors.textPrimary,
  },
});
