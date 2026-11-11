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
  FlatList,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import {
  Card,
  Chip,
  StatusBadge,
  StarRating,
  AmenityTag,
  SectionHeader,
  EmptyState,
} from '../components/UIComponents';
import { mockParkingSpots } from '../data/mockData';

const { width } = Dimensions.get('window');

const FILTERS = ['All', 'Open Now', 'EV Charging', 'Covered', 'Under ₹40/hr'];
const SORT_OPTIONS = ['Nearest', 'Price: Low', 'Rating', 'Availability'];

function ParkingCard({ spot, onPress }) {
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
      </View>
    </TouchableOpacity>
  );
}

export default function ParkingScreen({ navigation }) {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const [activeSort, setActiveSort] = useState('Nearest');
  const [view, setView] = useState('list'); // 'list' | 'map'

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  const filteredSpots = mockParkingSpots.filter((spot) => {
    if (search && !spot.name.toLowerCase().includes(search.toLowerCase()) && !spot.address.toLowerCase().includes(search.toLowerCase())) return false;
    if (activeFilter === 'Open Now') return spot.operatingHours === '00:00 – 23:59' || true; // mock: all open
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
        <TouchableOpacity style={styles.filterBtn}>
          <Text style={{ fontSize: 20 }}>⚙</Text>
        </TouchableOpacity>
      </View>

      {/* Filter chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
        {FILTERS.map((f) => (
          <Chip key={f} label={f} active={activeFilter === f} onPress={() => setActiveFilter(f)} />
        ))}
      </ScrollView>

      {/* Sort */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.filterRow, { paddingTop: 0 }]}>
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

      {/* Map Placeholder */}
      {view === 'map' && (
        <View style={styles.mapPlaceholder}>
          <LinearGradient colors={['#0A1F18', '#0D2920']} style={StyleSheet.absoluteFill} />
          <Text style={{ fontSize: 36 }}>🗺️</Text>
          <Text style={{ fontFamily: 'SpaceGrotesk_600SemiBold', fontSize: 16, color: colors.textPrimary, marginTop: 10 }}>
            Map View
          </Text>
          <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: colors.textSecondary, marginTop: 4 }}>
            Showing {filteredSpots.length} parking spots
          </Text>
          {/* Mock map pins */}
          {filteredSpots.map((spot, i) => (
            <TouchableOpacity
              key={spot.id}
              onPress={() => navigation.navigate('ParkingDetail', { spot })}
              style={[styles.mapPin, {
                top: 60 + (i * 40) % 200,
                left: 40 + (i * 70) % (width - 180),
                backgroundColor: spot.status === 'available' ? colors.primary : spot.status === 'partial' ? colors.warning : colors.error,
              }]}
            >
              <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 11, color: colors.bg }}>₹{spot.pricePerHour}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* List */}
      <Animated.FlatList
        data={filteredSpots}
        keyExtractor={(item) => item.id}
        style={{ opacity: fadeAnim }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState icon="🅿️" title="No spots found" subtitle="Try adjusting your filters or search term." />
        }
        renderItem={({ item }) => (
          <ParkingCard
            spot={item}
            onPress={() => navigation.navigate('ParkingDetail', { spot: item })}
          />
        )}
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
  filterRow: { paddingHorizontal: 20, paddingVertical: 8 },
  sortBtn: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 8, marginRight: 8, backgroundColor: colors.bgElevated },
  sortBtnActive: { backgroundColor: 'rgba(59,158,255,0.12)' },
  sortText: { fontFamily: 'Inter_400Regular', fontSize: 12, color: colors.textSecondary },
  sortTextActive: { color: colors.secondary, fontFamily: 'Inter_500Medium' },
  mapPlaceholder: { margin: 20, height: 220, borderRadius: 16, overflow: 'hidden', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.border },
  mapPin: { position: 'absolute', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
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
