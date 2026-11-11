// CARVIA — EV Charging Screen

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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import {
  Chip,
  StatusBadge,
  StarRating,
  AmenityTag,
  EmptyState,
} from '../components/UIComponents';
import { mockEVStations } from '../data/mockData';

const EV_FILTERS = ['All', 'Fast Charge (DC)', 'Slow Charge (AC)', '24/7 Open', 'Available Now'];
const CONNECTOR_COLORS = {
  'CCS2': '#3B9EFF',
  'CHAdeMO': '#FF8C00',
  'Type 2 AC': '#2FD987',
  'Ather Grid': '#8B5CF6',
};

function ConnectorBadge({ connector }) {
  const col = CONNECTOR_COLORS[connector.type] || colors.textSecondary;
  const avail = connector.available > 0;
  return (
    <View style={[connStyles.badge, { borderColor: col + '60', backgroundColor: col + '15' }]}>
      <View style={[connStyles.dot, { backgroundColor: avail ? col : colors.error }]} />
      <View>
        <Text style={[connStyles.type, { color: col }]}>{connector.type}</Text>
        <Text style={connStyles.power}>{connector.power} kW · {connector.available}/{connector.total} free</Text>
      </View>
    </View>
  );
}

const connStyles = StyleSheet.create({
  badge: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 10, borderWidth: 1, marginRight: 8, marginBottom: 8 },
  dot: { width: 7, height: 7, borderRadius: 3.5 },
  type: { fontFamily: 'Inter_600SemiBold', fontSize: 12 },
  power: { fontFamily: 'Inter_400Regular', fontSize: 10, color: colors.textSecondary, marginTop: 1 },
});

function EVCard({ station, onPress }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.88} style={evStyles.card}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 10 }}>
        <View style={{ flex: 1, marginRight: 10 }}>
          <Text style={evStyles.name} numberOfLines={2}>{station.name}</Text>
          <Text style={evStyles.addr} numberOfLines={1}>{station.address}</Text>
          <Text style={evStyles.network}>{station.network}</Text>
        </View>
        <StatusBadge status={station.status} />
      </View>

      {/* Stats */}
      <View style={evStyles.statsRow}>
        <View style={evStyles.statItem}>
          <Text style={evStyles.statVal}>₹{station.pricePerUnit}</Text>
          <Text style={evStyles.statLbl}>/kWh</Text>
        </View>
        <View style={evStyles.statDivider} />
        <View style={evStyles.statItem}>
          <Text style={[evStyles.statVal, { color: station.availableChargers > 0 ? colors.primary : colors.error }]}>
            {station.availableChargers}/{station.totalChargers}
          </Text>
          <Text style={evStyles.statLbl}>chargers free</Text>
        </View>
        <View style={evStyles.statDivider} />
        <View style={evStyles.statItem}>
          <Text style={[evStyles.statVal, { color: colors.secondary }]}>
            {station.maxPower >= 50 ? `${station.maxPower}` : `${station.minPower}`} kW
          </Text>
          <Text style={evStyles.statLbl}>{station.maxPower >= 50 ? 'max power' : 'AC power'}</Text>
        </View>
        <View style={evStyles.statDivider} />
        <View style={evStyles.statItem}>
          <StarRating rating={station.rating} size={12} />
          <Text style={evStyles.statLbl}>{station.distance}</Text>
        </View>
      </View>

      {/* Connectors */}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 12 }}>
        {station.connectors.map((c, i) => (
          <ConnectorBadge key={i} connector={c} />
        ))}
      </View>

      {/* Footer */}
      <View style={evStyles.footer}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <Text style={{ fontSize: 12 }}>🕐</Text>
          <Text style={evStyles.hours}>{station.operatingHours === '00:00 – 23:59' ? '24/7' : station.operatingHours}</Text>
        </View>
        <LinearGradient
          colors={station.availableChargers > 0 ? ['#2FD987', '#1AAD64'] : ['#333', '#222']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={evStyles.startBtn}
        >
          <Text style={[evStyles.startBtnText, station.availableChargers === 0 && { color: colors.textMuted }]}>
            {station.availableChargers > 0 ? '⚡ Start Charging' : 'All Occupied'}
          </Text>
        </LinearGradient>
      </View>
    </TouchableOpacity>
  );
}

export default function EVScreen({ navigation }) {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('All');
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }).start();
  }, []);

  const filteredStations = mockEVStations.filter((s) => {
    if (search && !s.name.toLowerCase().includes(search.toLowerCase()) && !s.address.toLowerCase().includes(search.toLowerCase())) return false;
    if (activeFilter === 'Fast Charge (DC)') return s.maxPower >= 50;
    if (activeFilter === 'Slow Charge (AC)') return s.maxPower < 50;
    if (activeFilter === '24/7 Open') return s.operatingHours === '00:00 – 23:59';
    if (activeFilter === 'Available Now') return s.availableChargers > 0;
    return true;
  });

  // Summary stats
  const totalFree = filteredStations.reduce((sum, s) => sum + s.availableChargers, 0);
  const totalChargers = filteredStations.reduce((sum, s) => sum + s.totalChargers, 0);

  return (
    <SafeAreaView style={evListStyles.safe} edges={['top']}>
      {/* Header */}
      <LinearGradient colors={['#071A14', colors.bg]} style={evListStyles.headerGrad}>
        <View style={evListStyles.header}>
          <View>
            <Text style={evListStyles.headerTitle}>EV Charging</Text>
            <Text style={evListStyles.headerSub}>{totalFree} of {totalChargers} chargers available</Text>
          </View>
          <View style={evListStyles.evIcon}>
            <Text style={{ fontSize: 22 }}>⚡</Text>
          </View>
        </View>

        {/* Quick stat pills */}
        <View style={evListStyles.pillRow}>
          {[
            { label: 'Stations', val: filteredStations.length },
            { label: 'Free Now', val: totalFree, highlight: true },
            { label: 'DC Fast', val: filteredStations.filter(s => s.maxPower >= 50).length },
          ].map((p) => (
            <View key={p.label} style={[evListStyles.pill, p.highlight && { borderColor: colors.primary, backgroundColor: colors.primaryGlow }]}>
              <Text style={[evListStyles.pillVal, p.highlight && { color: colors.primary }]}>{p.val}</Text>
              <Text style={evListStyles.pillLabel}>{p.label}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>

      {/* Search */}
      <View style={evListStyles.searchRow}>
        <View style={evListStyles.searchBox}>
          <Text style={{ fontSize: 16, marginRight: 8 }}>🔍</Text>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search EV stations…"
            placeholderTextColor={colors.textMuted}
            style={evListStyles.searchInput}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Text style={{ color: colors.textSecondary, fontSize: 16, paddingHorizontal: 4 }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filters */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={evListStyles.filterRow}>
        {EV_FILTERS.map((f) => (
          <Chip key={f} label={f} active={activeFilter === f} onPress={() => setActiveFilter(f)} />
        ))}
      </ScrollView>

      {/* Station list */}
      <Animated.FlatList
        data={filteredStations}
        keyExtractor={(item) => item.id}
        style={{ opacity: fadeAnim }}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <EmptyState icon="⚡" title="No stations found" subtitle="Try adjusting your filters." />
        }
        renderItem={({ item }) => (
          <EVCard
            station={item}
            onPress={() => navigation.navigate('EVDetail', { station: item })}
          />
        )}
      />
    </SafeAreaView>
  );
}

const evListStyles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  headerGrad: { paddingBottom: 16 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 },
  headerTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 24, color: colors.textPrimary },
  headerSub: { fontFamily: 'Inter_400Regular', fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  evIcon: { width: 46, height: 46, borderRadius: 23, backgroundColor: colors.primaryGlow, borderWidth: 1.5, borderColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  pillRow: { flexDirection: 'row', paddingHorizontal: 20, gap: 10 },
  pill: { flex: 1, backgroundColor: colors.bgCard, borderRadius: 10, padding: 10, alignItems: 'center', borderWidth: 1, borderColor: colors.border },
  pillVal: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 18, color: colors.textPrimary },
  pillLabel: { fontFamily: 'Inter_400Regular', fontSize: 11, color: colors.textSecondary },
  searchRow: { paddingHorizontal: 20, paddingVertical: 12 },
  searchBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bgCard, borderRadius: 12, borderWidth: 1, borderColor: colors.border, paddingHorizontal: 14, height: 48 },
  searchInput: { flex: 1, fontFamily: 'Inter_400Regular', fontSize: 14, color: colors.textPrimary },
  filterRow: { paddingHorizontal: 20, paddingBottom: 12 },
});

const evStyles = StyleSheet.create({
  card: { backgroundColor: colors.bgCard, borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: colors.border },
  name: { fontFamily: 'SpaceGrotesk_600SemiBold', fontSize: 15, color: colors.textPrimary },
  addr: { fontFamily: 'Inter_400Regular', fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  network: { fontFamily: 'Inter_400Regular', fontSize: 11, color: colors.primary, marginTop: 3 },
  statsRow: { flexDirection: 'row', alignItems: 'center' },
  statItem: { flex: 1, alignItems: 'center', gap: 2 },
  statVal: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 16, color: colors.textPrimary },
  statLbl: { fontFamily: 'Inter_400Regular', fontSize: 10, color: colors.textSecondary },
  statDivider: { width: 1, height: 32, backgroundColor: colors.border },
  footer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.border },
  hours: { fontFamily: 'Inter_400Regular', fontSize: 12, color: colors.textSecondary },
  startBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  startBtnText: { fontFamily: 'SpaceGrotesk_600SemiBold', fontSize: 13, color: colors.bg },
});
