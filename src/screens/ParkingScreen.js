// CARVIA — Smart Parking Screen

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Animated,
  Modal,
  Dimensions,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import {
  Chip,
  StatusBadge,
  StarRating,
  AmenityTag,
  EmptyState,
  PrimaryButton,
  SecondaryButton,
} from '../components/UIComponents';
import { useTabBarInset } from '../hooks/useTabBarInset';
import { mockParkingSpots } from '../data/mockData';

const { width } = Dimensions.get('window');

const FILTERS = ['All', 'Open Now', 'EV Charging', 'Covered', 'Under ₹40/hr'];
const SORT_OPTIONS = ['Nearest', 'Price: Low', 'Rating', 'Availability'];

function timeToMinutes(value) {
  const [h, m] = value.split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
}

/** Parses operahours like "06:00 – 23:00" (en dash) and handles overnight ranges. */
function isOpenNow(operatingHours) {
  if (!operatingHours) return true;
  const parts = operatingHours.replace(/[–—]/g, '-').split('-').map((s) => s.trim());
  if (parts.length !== 2) return true;
  const open = timeToMinutes(parts[0]);
  const close = timeToMinutes(parts[1]);
  if (open === null || close === null) return true;
  if (open === 0 && close >= 23 * 60 + 59) return true;
  const now = new Date();
  const mins = now.getHours() * 60 + now.getMinutes();
  if (open === close) return true;
  if (close > open) return mins >= open && mins < close;
  return mins >= open || mins < close;
}

function ParkingCard({ spot, onPress, onBook }) {
  const isAvailable = spot.status !== 'full';
  const availPct = Math.round((spot.availableSpots / spot.totalSpots) * 100);

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.88} style={parkStyles.card}>
      {/* Header row */}
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
        <View style={{ flex: 1, marginRight: 10 }}>
          <Text style={parkStyles.cardName} numberOfLines={2}>{spot.name}</Text>
          <Text style={parkStyles.cardAddr} numberOfLines={1}>{spot.address}</Text>
        </View>
        <StatusBadge status={spot.status} />
      </View>

      {/* Stats row */}
      <View style={parkStyles.statsRow}>
        <View style={parkStyles.statItem}>
          <Text style={parkStyles.statVal}>₹{spot.pricePerHour}</Text>
          <Text style={parkStyles.statLbl}>/hour</Text>
        </View>
        <View style={parkStyles.statDivider} />
        <View style={parkStyles.statItem}>
          <Text style={[parkStyles.statVal, { color: spot.status === 'full' ? colors.error : spot.status === 'partial' ? colors.warning : colors.primary }]}>
            {spot.availableSpots}
          </Text>
          <Text style={parkStyles.statLbl}>free spots</Text>
        </View>
        <View style={parkStyles.statDivider} />
        <View style={parkStyles.statItem}>
          <StarRating rating={spot.rating} size={12} />
          <Text style={parkStyles.statLbl}>{spot.totalReviews} reviews</Text>
        </View>
        <View style={parkStyles.statDivider} />
        <View style={parkStyles.statItem}>
          <Text style={parkStyles.statVal}>{spot.distance}</Text>
          <Text style={parkStyles.statLbl}>away</Text>
        </View>
      </View>

      {/* Availability bar */}
      {spot.totalSpots > 0 && (
        <View style={{ marginTop: 12 }}>
          <View style={parkStyles.barBg}>
            <View
              style={[
                parkStyles.barFill,
                {
                  width: `${availPct}%`,
                  backgroundColor: availPct > 40 ? colors.primary : availPct > 15 ? colors.warning : colors.error,
                },
              ]}
            />
          </View>
          <Text style={parkStyles.barLabel}>{availPct}% available</Text>
        </View>
      )}

      {/* Amenities */}
      <View style={parkStyles.amenitiesRow}>
        {spot.amenities.map((a) => <AmenityTag key={a} label={a} />)}
      </View>

      {/* Footer */}
      <View style={parkStyles.cardFooter}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Text style={{ fontSize: 12 }}>🕐</Text>
          <Text style={parkStyles.hours}>{spot.operatingHours}</Text>
        </View>
        <TouchableOpacity onPress={isAvailable ? onBook : undefined} activeOpacity={0.8} disabled={!isAvailable}>
          <LinearGradient
            colors={isAvailable ? ['#2FD987', '#1AAD64'] : ['#333', '#222']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={parkStyles.bookBtn}
          >
            <Text style={[parkStyles.bookBtnText, !isAvailable && { color: colors.textMuted }]}>
              {isAvailable ? 'Book Now' : 'Full'}
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

function FilterSheet({ visible, onClose, filter, onFilter, sort, onSort, count }) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={sheetStyles.overlay} activeOpacity={1} onPress={onClose} />
      <View style={[sheetStyles.sheet, { paddingBottom: Math.max(insets.bottom, 12) + 24 }]}>
        <View style={sheetStyles.handle} />
        <Text style={sheetStyles.title}>Filters & Sort</Text>
        <Text style={sheetStyles.subtitle}>Refine the parking spots shown below.</Text>

        <Text style={sheetStyles.sectionLabel}>Category</Text>
        <View style={sheetStyles.chipWrap}>
          {FILTERS.map((f) => (
            <View key={f} style={{ marginBottom: 8 }}>
              <Chip label={f} active={filter === f} onPress={() => onFilter(f)} />
            </View>
          ))}
        </View>

        <Text style={sheetStyles.sectionLabel}>Sort by</Text>
        <View style={sheetStyles.chipWrap}>
          {SORT_OPTIONS.map((s) => (
            <TouchableOpacity
              key={s}
              onPress={() => onSort(s)}
              style={[sheetStyles.sortChip, sort === s && sheetStyles.sortChipActive]}
            >
              <Text style={[sheetStyles.sortText, sort === s && sheetStyles.sortTextActive]}>{s}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <SecondaryButton
          title="Reset filters"
          onPress={() => { onFilter('All'); onSort('Nearest'); }}
          style={{ marginTop: 12 }}
        />
        <PrimaryButton
          title={`Show ${count} result${count === 1 ? '' : 's'}`}
          onPress={onClose}
          style={{ marginTop: 10 }}
        />
      </View>
    </Modal>
  );
}

export default function ParkingScreen({ navigation }) {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeSort, setActiveSort] = useState('Nearest');
  const [view, setView] = useState('list'); // 'list' | 'map'
  const [filterSheet, setFilterSheet] = useState(false);
  const tabBarInset = useTabBarInset();

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  const filteredSpots = mockParkingSpots.filter((spot) => {
    if (search && !spot.name.toLowerCase().includes(search.toLowerCase()) && !spot.address.toLowerCase().includes(search.toLowerCase())) return false;
    if (activeFilter === 'Open Now') return isOpenNow(spot.operatingHours);
    if (activeFilter === 'EV Charging') return spot.amenities.includes('EV Charging');
    if (activeFilter === 'Covered') return spot.amenities.includes('Covered');
    if (activeFilter === 'Under ₹40/hr') return spot.pricePerHour < 40;
    return true;
  }).sort((a, b) => {
    if (activeSort === 'Nearest') return a.distanceNum - b.distanceNum;
    if (activeSort === 'Price: Low') return a.pricePerHour - b.pricePerHour;
    if (activeSort === 'Rating') return b.rating - a.rating;
    if (activeSort === 'Availability') return b.availableSpots - a.availableSpots;
    return 0;
  });

  const filtersDirty = activeFilter !== 'All' || activeSort !== 'Nearest';
  const pinColWidth = (width - 72) / 3;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Smart Parking</Text>
          <Text style={styles.headerSub}>{filteredSpots.length} spots found near you</Text>
        </View>
        <View style={styles.viewToggle}>
          <TouchableOpacity onPress={() => setView('list')} style={[styles.toggleBtn, view === 'list' && styles.toggleActive]}>
            <Text style={[styles.toggleIcon, view === 'list' && styles.toggleIconActive]}>☰</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setView('map')} style={[styles.toggleBtn, view === 'map' && styles.toggleActive]}>
            <Text style={[styles.toggleIcon, view === 'map' && styles.toggleIconActive]}>⊞</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Search */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search parking location…"
            placeholderTextColor={colors.textMuted}
            style={styles.searchInput}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Text style={{ color: colors.textSecondary, fontSize: 16, paddingHorizontal: 4 }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity style={styles.filterBtn} onPress={() => setFilterSheet(true)} accessibilityLabel="Open filters">
          <Text style={{ fontSize: 20 }}>⚙</Text>
          {filtersDirty && <View style={styles.filterDot} />}
        </TouchableOpacity>
      </View>

      {/* Filter chips */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0, flexShrink: 0 }}
        contentContainerStyle={styles.filterRow}
      >
        {FILTERS.map((f) => (
          <Chip key={f} label={f} active={activeFilter === f} onPress={() => setActiveFilter(f)} />
        ))}
      </ScrollView>

      {/* Sort */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flexGrow: 0, flexShrink: 0 }}
        contentContainerStyle={[styles.filterRow, { paddingTop: 0 }]}
      >
        {SORT_OPTIONS.map((s) => (
          <TouchableOpacity
            key={s}
            onPress={() => setActiveSort(s)}
            style={[styles.sortBtn, activeSort === s && styles.sortBtnActive]}
          >
            <Text style={[styles.sortText, activeSort === s && styles.sortTextActive]}>↕ {s}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Map / List */}
      {view === 'map' ? (
        <View style={styles.mapWrap}>
          <LinearGradient colors={['#0A1F18', '#0D2920']} style={StyleSheet.absoluteFill} />
          <View style={styles.mapHeader}>
            <Text style={{ fontSize: 32 }}>🗺️</Text>
            <Text style={styles.mapTitle}>Map View</Text>
            <Text style={styles.mapSub}>
              {filteredSpots.length} spot{filteredSpots.length === 1 ? '' : 's'} nearby · tap a pin for details
            </Text>
          </View>
          {filteredSpots.map((spot, i) => (
            <TouchableOpacity
              key={spot.id}
              onPress={() => navigation.navigate('ParkingDetail', { spot })}
              style={[styles.mapPin, {
                top: 120 + Math.floor(i / 3) * 48,
                left: 16 + (i % 3) * pinColWidth,
                backgroundColor: spot.status === 'available' ? colors.primary : spot.status === 'partial' ? colors.warning : colors.error,
              }]}
            >
              <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 11, color: colors.bg }}>₹{spot.pricePerHour}</Text>
            </TouchableOpacity>
          ))}
          {filteredSpots.length === 0 && (
            <View style={styles.mapEmpty}>
              <Text style={{ fontSize: 32 }}>🅿️</Text>
              <Text style={styles.mapEmptyText}>No spots match your filters</Text>
            </View>
          )}
        </View>
      ) : (
        <Animated.FlatList
          data={filteredSpots}
          keyExtractor={(item) => item.id}
          style={{ opacity: fadeAnim }}
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: tabBarInset + 16 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState icon="🅿️" title="No spots found" subtitle="Try adjusting your filters or search term." />
          }
          renderItem={({ item }) => (
            <ParkingCard
              spot={item}
              onPress={() => navigation.navigate('ParkingDetail', { spot: item })}
              onBook={() => navigation.navigate('ParkingDetail', { spot: item, autoBook: true })}
            />
          )}
        />
      )}

      <FilterSheet
        visible={filterSheet}
        onClose={() => setFilterSheet(false)}
        filter={activeFilter}
        onFilter={setActiveFilter}
        sort={activeSort}
        onSort={setActiveSort}
        count={filteredSpots.length}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  headerTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 24, color: colors.textPrimary },
  headerSub: { fontFamily: 'Inter_400Regular', fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  viewToggle: { flexDirection: 'row', backgroundColor: colors.bgCard, borderRadius: 10, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  toggleBtn: { paddingHorizontal: 12, paddingVertical: 8 },
  toggleActive: { backgroundColor: colors.bgElevated },
  toggleIcon: { fontSize: 16, color: colors.textMuted },
  toggleIconActive: { color: colors.primary },
  searchRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, gap: 10, marginBottom: 12 },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bgCard, borderRadius: 12, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 14, height: 48 },
  searchIcon: { fontSize: 16, marginRight: 8 },
  searchInput: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 14, color: colors.textPrimary },
  filterBtn: { width: 48, height: 48, backgroundColor: colors.bgCard, borderRadius: 12, borderWidth: 1, borderColor: colors.border, alignItems: 'center', justifyContent: 'center' },
  filterDot: { position: 'absolute', top: 10, right: 10, width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },
  filterRow: { paddingHorizontal: 20, paddingVertical: 8 },
  sortBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8, marginRight: 8, backgroundColor: colors.bgElevated },
  sortBtnActive: { backgroundColor: 'rgba(59,158,255,0.12)' },
  sortText: { fontFamily: 'Inter_400Regular', fontSize: 12, color: colors.textSecondary },
  sortTextActive: { color: colors.secondary, fontFamily: 'Inter_500Medium' },
  mapWrap: { flex: 1, margin: 20, marginTop: 4, borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: colors.border },
  mapHeader: { alignItems: 'center', paddingTop: 18, paddingHorizontal: 20 },
  mapTitle: { fontFamily: 'SpaceGrotesk_600SemiBold', fontSize: 16, color: colors.textPrimary, marginTop: 8 },
  mapSub: { fontFamily: 'Inter_400Regular', fontSize: 12, color: colors.textSecondary, marginTop: 4, textAlign: 'center' },
  mapPin: { position: 'absolute', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  mapEmpty: { position: 'absolute', top: 180, left: 0, right: 0, alignItems: 'center' },
  mapEmptyText: { fontFamily: 'Inter_400Regular', fontSize: 13, color: colors.textSecondary, marginTop: 8 },
});

const parkStyles = StyleSheet.create({
  card: { backgroundColor: colors.bgCard, borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: colors.border },
  cardName: { fontFamily: 'SpaceGrotesk_600SemiBold', fontSize: 15, color: colors.textPrimary },
  cardAddr: { fontFamily: 'Inter_400Regular', fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  statsRow: { flexDirection: 'row', alignItems: 'center', marginTop: 12 },
  statItem: { flex: 1, alignItems: 'center', gap: 2 },
  statVal: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 16, color: colors.textPrimary },
  statLbl: { fontFamily: 'Inter_400Regular', fontSize: 10, color: colors.textSecondary },
  statDivider: { width: 1, height: 32, backgroundColor: colors.border },
  barBg: { height: 5, backgroundColor: colors.bgElevated, borderRadius: 3, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 3 },
  barLabel: { fontFamily: 'Inter_400Regular', fontSize: 10, color: colors.textSecondary, marginTop: 4, textAlign: 'right' },
  amenitiesRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border },
  hours: { fontFamily: 'Inter_400Regular', fontSize: 12, color: colors.textSecondary },
  bookBtn: { paddingHorizontal: 20, paddingVertical: 8, borderRadius: 20 },
  bookBtnText: { fontFamily: 'SpaceGrotesk_600SemiBold', fontSize: 13, color: colors.bg },
});

const sheetStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)' },
  sheet: { backgroundColor: colors.bgElevated, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, borderWidth: 1, borderColor: colors.border },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, alignSelf: 'center', marginBottom: 18 },
  title: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 20, color: colors.textPrimary },
  subtitle: { fontFamily: 'Inter_400Regular', fontSize: 13, color: colors.textSecondary, marginTop: 4, marginBottom: 18 },
  sectionLabel: { fontFamily: 'SpaceGrotesk_600SemiBold', fontSize: 13, color: colors.textSecondary, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 8 },
  sortChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bgCard, marginRight: 8, marginBottom: 8 },
  sortChipActive: { borderColor: colors.primary, backgroundColor: colors.primaryGlow },
  sortText: { fontFamily: 'Inter_500Medium', fontSize: 13, color: colors.textSecondary },
  sortTextActive: { color: colors.primary, fontFamily: 'Inter_600SemiBold' },
});
