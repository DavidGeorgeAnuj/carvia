// CARVIA — Home Screen

import React, { useRef, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import {
  Card,
  SectionHeader,
  StatusBadge,
  StarRating,
} from '../components/UIComponents';
import { useTabBarInset } from '../hooks/useTabBarInset';
import { mockUser, mockParkingSpots, mockEVStations, mockRecentActivity, mockStats } from '../data/mockData';

const LOCATIONS = ['Koramangala, Bengaluru', 'Indiranagar, Bengaluru', 'Whitefield, Bengaluru', 'HSR Layout, Bengaluru'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

function QuickActionCard({ icon, title, subtitle, gradientColors, onPress }) {
  const scale = useRef(new Animated.Value(1)).current;
  const press = () => {
    Animated.sequence([
      Animated.timing(scale, { toValue: 0.96, duration: 100, useNativeDriver: true }),
      Animated.timing(scale, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
    onPress();
  };
  return (
    <Animated.View style={{ transform: [{ scale }], flex: 1 }}>
      <TouchableOpacity onPress={press} activeOpacity={1} style={{ flex: 1 }}>
        <LinearGradient colors={gradientColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.quickCard}>
          <Text style={styles.quickIcon}>{icon}</Text>
          <Text style={styles.quickTitle}>{title}</Text>
          <Text style={styles.quickSubtitle}>{subtitle}</Text>
          <View style={styles.quickArrow}>
            <Text style={styles.quickArrowText}>→</Text>
          </View>
        </LinearGradient>
      </TouchableOpacity>
    </Animated.View>
  );
}

function StatCard({ icon, value, label }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statIcon}>{icon}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function ActivityItem({ item }) {
  const icon = item.type === 'parking' ? '🅿️' : '⚡';
  return (
    <View style={styles.activityItem}>
      <View style={styles.activityIconWrap}>
        <Text style={{ fontSize: 18 }}>{icon}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.activityTitle}>{item.location}</Text>
        <Text style={styles.activityMeta}>
          {formatDate(item.date)} · {item.duration}
          {item.energyAdded ? ` · ${item.energyAdded}` : ''}
        </Text>
      </View>
      <Text style={styles.activityAmount}>₹{item.amount}</Text>
    </View>
  );
}

function NearbyCard({ item, onPress, type }) {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.88} style={styles.nearbyCard}>
      <View style={styles.nearbyIconArea}>
        <Text style={{ fontSize: 24 }}>{type === 'ev' ? '⚡' : '🅿️'}</Text>
      </View>
      <View style={{ flex: 1, gap: 4 }}>
        <Text style={styles.nearbyName} numberOfLines={1}>{item.shortName}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <StarRating rating={item.rating} size={11} />
          <Text style={styles.nearbyDistance}>{item.distance}</Text>
        </View>
        <Text style={styles.nearbyPrice}>
          {type === 'ev' ? `₹${item.pricePerUnit}/kWh` : `₹${item.pricePerHour}/hr`}
        </Text>
      </View>
      <StatusBadge status={item.status} />
    </TouchableOpacity>
  );
}

function LocationModal({ visible, current, onClose, onSelect }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity activeOpacity={1} style={styles.modalSheet} onPress={() => {}}>
          <View style={styles.modalHandle} />
          <Text style={styles.modalTitle}>Choose Location</Text>
          <Text style={styles.modalSubtitle}>We'll show parking and charging nearby.</Text>
          {LOCATIONS.map((loc) => {
            const selected = current === loc;
            return (
              <TouchableOpacity
                key={loc}
                onPress={() => onSelect(loc)}
                activeOpacity={0.8}
                style={[styles.locationOption, selected && styles.locationOptionActive]}
              >
                <Text style={{ fontSize: 16 }}>📍</Text>
                <Text style={[styles.locationOptionText, selected && { color: colors.primary }]}>{loc}</Text>
                {selected && <Text style={{ color: colors.primary, fontSize: 15 }}>✓</Text>}
              </TouchableOpacity>
            );
          })}
          <TouchableOpacity onPress={onClose} style={styles.modalCloseBtn} activeOpacity={0.8}>
            <Text style={styles.modalCloseText}>Cancel</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

export default function HomeScreen({ navigation }) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(20)).current;
  const tabBarInset = useTabBarInset();
  const [location, setLocation] = useState(LOCATIONS[0]);
  const [locationModal, setLocationModal] = useState(false);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }),
      Animated.timing(slideAnim, { toValue: 0, duration: 600, useNativeDriver: true }),
    ]).start();
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <Animated.ScrollView
        style={{ opacity: fadeAnim, transform: [{ translateY: slideAnim }] }}
        contentContainerStyle={[styles.scroll, { paddingBottom: tabBarInset + 16 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting},</Text>
            <Text style={styles.name}>{mockUser.name.split(' ')[0]} 👋</Text>
          </View>
          <TouchableOpacity
            style={styles.avatar}
            activeOpacity={0.8}
            onPress={() => navigation.navigate('Profile', { screen: 'ProfileMain' })}
            accessibilityLabel="Open profile"
          >
            <Text style={{ fontSize: 20, color: colors.textPrimary, fontFamily: 'SpaceGrotesk_700Bold' }}>
              {mockUser.name.charAt(0)}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Location banner */}
        <View style={styles.locationBanner}>
          <Text style={{ fontSize: 14 }}>📍</Text>
          <Text style={styles.locationText} numberOfLines={1}>{location}</Text>
          <TouchableOpacity onPress={() => setLocationModal(true)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.changeText}>Change</Text>
          </TouchableOpacity>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickRow}>
          <QuickActionCard
            icon="🅿️"
            title="Smart Parking"
            subtitle="Find & book spots"
            gradientColors={['#1A3A5E', '#0F2240']}
            onPress={() => navigation.navigate('Parking', { screen: 'ParkingMain' })}
          />
          <View style={{ width: 12 }} />
          <QuickActionCard
            icon="⚡"
            title="EV Charging"
            subtitle="Charge your vehicle"
            gradientColors={['#0F3024', '#071A14']}
            onPress={() => navigation.navigate('EV', { screen: 'EVMain' })}
          />
        </View>

        {/* Stats Row */}
        <Card style={styles.statsCard}>
          <Text style={styles.statsTitle}>Your Journey</Text>
          <View style={styles.statsRow}>
            <StatCard icon="🏁" value={`₹${(mockStats.totalSpent / 1000).toFixed(1)}k`} label="Total Spent" />
            <View style={styles.statDivider} />
            <StatCard icon="⏱" value={`${mockStats.parkingHours}h`} label="Parked" />
            <View style={styles.statDivider} />
            <StatCard icon="🌱" value={`${mockStats.co2Saved}kg`} label="CO₂ Saved" />
          </View>
        </Card>

        {/* Nearby Parking */}
        <SectionHeader
          title="Nearby Parking"
          action="See all"
          onAction={() => navigation.navigate('Parking', { screen: 'ParkingMain' })}
        />
        {mockParkingSpots.slice(0, 3).map((spot) => (
          <NearbyCard
            key={spot.id}
            item={spot}
            type="parking"
            onPress={() => navigation.navigate('ParkingDetail', { spot })}
          />
        ))}

        {/* Nearby EV */}
        <View style={{ marginTop: 20 }}>
          <SectionHeader
            title="EV Charging Nearby"
            action="See all"
            onAction={() => navigation.navigate('EV', { screen: 'EVMain' })}
          />
          {mockEVStations.slice(0, 2).map((station) => (
            <NearbyCard
              key={station.id}
              item={station}
              type="ev"
              onPress={() => navigation.navigate('EVDetail', { station })}
            />
          ))}
        </View>

        {/* Recent Activity */}
        <View style={{ marginTop: 20 }}>
          <SectionHeader title="Recent Activity" />
          <Card>
            {mockRecentActivity.map((item, i) => (
              <View key={item.id}>
                <ActivityItem item={item} />
                {i < mockRecentActivity.length - 1 && (
                  <View style={styles.activityDivider} />
                )}
              </View>
            ))}
          </Card>
        </View>

        {/* Footer tagline */}
        <View style={styles.footer}>
          <Text style={styles.footerLogo}>CARVIA</Text>
          <Text style={styles.footerTagline}>One platform. Every journey.</Text>
        </View>
      </Animated.ScrollView>

      <LocationModal
        visible={locationModal}
        current={location}
        onClose={() => setLocationModal(false)}
        onSelect={(loc) => { setLocation(loc); setLocationModal(false); }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  scroll: { paddingHorizontal: 20, paddingBottom: 32 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 20 },
  greeting: { fontFamily: 'Inter_400Regular', fontSize: 14, color: colors.textSecondary },
  name: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 24, color: colors.textPrimary, marginTop: 2 },
  avatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: colors.bgCard, borderWidth: 2, borderColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  locationBanner: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.bgCard, borderRadius: 10, paddingVertical: 10, paddingHorizontal: 14, marginBottom: 20, borderWidth: 1, borderColor: colors.border },
  locationText: { flex: 1, fontFamily: 'Inter_500Medium', fontSize: 13, color: colors.textPrimary },
  changeText: { fontFamily: 'Inter_500Medium', fontSize: 12, color: colors.primary },
  quickRow: { flexDirection: 'row', marginBottom: 20 },
  quickCard: { borderRadius: 18, padding: 20, minHeight: 150, justifyContent: 'space-between' },
  quickIcon: { fontSize: 32 },
  quickTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 18, color: '#fff', marginTop: 8 },
  quickSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 12, color: 'rgba(255,255,255,0.65)' },
  quickArrow: { alignSelf: 'flex-end', backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 20, width: 32, height: 32, alignItems: 'center', justifyContent: 'center' },
  quickArrowText: { color: '#fff', fontSize: 16 },
  statsCard: { marginBottom: 24 },
  statsTitle: { fontFamily: 'SpaceGrotesk_600SemiBold', fontSize: 14, color: colors.textSecondary, marginBottom: 14, textTransform: 'uppercase', letterSpacing: 1 },
  statsRow: { flexDirection: 'row', alignItems: 'center' },
  statCard: { flex: 1, alignItems: 'center', gap: 4 },
  statIcon: { fontSize: 20 },
  statValue: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 18, color: colors.textPrimary },
  statLabel: { fontFamily: 'Inter_400Regular', fontSize: 11, color: colors.textSecondary },
  statDivider: { width: 1, height: 40, backgroundColor: colors.border },
  nearbyCard: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: colors.bgCard, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: colors.border },
  nearbyIconArea: { width: 46, height: 46, borderRadius: 12, backgroundColor: colors.bgElevated, alignItems: 'center', justifyContent: 'center' },
  nearbyName: { fontFamily: 'SpaceGrotesk_600SemiBold', fontSize: 14, color: colors.textPrimary },
  nearbyDistance: { fontFamily: 'Inter_400Regular', fontSize: 11, color: colors.textSecondary },
  nearbyPrice: { fontFamily: 'Inter_500Medium', fontSize: 13, color: colors.primary },
  activityItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10 },
  activityIconWrap: { width: 40, height: 40, borderRadius: 10, backgroundColor: colors.bgElevated, alignItems: 'center', justifyContent: 'center' },
  activityTitle: { fontFamily: 'Inter_500Medium', fontSize: 13, color: colors.textPrimary },
  activityMeta: { fontFamily: 'Inter_400Regular', fontSize: 11, color: colors.textSecondary, marginTop: 2 },
  activityAmount: { fontFamily: 'SpaceGrotesk_600SemiBold', fontSize: 14, color: colors.textPrimary },
  activityDivider: { height: 1, backgroundColor: colors.border },
  footer: { alignItems: 'center', paddingTop: 32, paddingBottom: 8, gap: 4 },
  footerLogo: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 16, color: colors.primary, letterSpacing: 2 },
  footerTagline: { fontFamily: 'Inter_400Regular', fontSize: 12, color: colors.textMuted },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.65)', justifyContent: 'flex-end' },
  modalSheet: { backgroundColor: colors.bgElevated, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 32, borderWidth: 1, borderColor: colors.border },
  modalHandle: { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, alignSelf: 'center', marginBottom: 18 },
  modalTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 20, color: colors.textPrimary },
  modalSubtitle: { fontFamily: 'Inter_400Regular', fontSize: 13, color: colors.textSecondary, marginTop: 4, marginBottom: 16 },
  locationOption: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 14, paddingHorizontal: 14, borderRadius: 12, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.bgCard, marginBottom: 10 },
  locationOptionActive: { borderColor: colors.primary, backgroundColor: colors.primaryGlow },
  locationOptionText: { flex: 1, fontFamily: 'Inter_500Medium', fontSize: 14, color: colors.textPrimary },
  modalCloseBtn: { alignItems: 'center', paddingVertical: 12, marginTop: 4 },
  modalCloseText: { fontFamily: 'Inter_500Medium', fontSize: 14, color: colors.textSecondary },
});
