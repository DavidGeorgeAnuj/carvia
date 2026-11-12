// CARVIA — EV Station Detail Screen

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import {
  Card,
  PrimaryButton,
  SecondaryButton,
  StatusBadge,
  StarRating,
} from '../components/UIComponents';
import { useTabBarInset } from '../hooks/useTabBarInset';

const CONNECTOR_COLORS = {
  'CCS2': '#3B9EFF',
  'CHAdeMO': '#FF8C00',
  'Type 2 AC': '#2FD987',
  'Ather Grid': '#8B5CF6',
};

function ChargingSessionModal({ visible, station, connector, onClose }) {
  const insets = useSafeAreaInsets();
  const [elapsed, setElapsed] = useState(0);
  const [energy, setEnergy] = useState(0);
  // `active` represents the charging session itself, not the modal visibility.
  // That way minimizing the sheet keeps the timer and energy counting.
  const [active, setActive] = useState(false);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (visible) setActive(true);
  }, [visible]);

  useEffect(() => {
    if (!active) {
      clearInterval(intervalRef.current);
      return undefined;
    }
    intervalRef.current = setInterval(() => {
      setElapsed((e) => e + 1);
      setEnergy((en) => +(en + (connector?.power || 7.2) / 3600).toFixed(4));
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [active, connector]);

  const formatTime = (secs) => {
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const cost = (energy * (station?.pricePerUnit || 15)).toFixed(2);
  const pct = Math.min(100, Math.round((energy / 60) * 100));

  const handleStop = () => {
    setActive(false);
    clearInterval(intervalRef.current);
    Alert.alert(
      'Session Complete',
      `Total: ${energy.toFixed(2)} kWh · ₹${cost}`,
      [{
        text: 'Done',
        onPress: () => {
          setElapsed(0);
          setEnergy(0);
          onClose();
        },
      }],
      { cancelable: false }
    );
  };

  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={sessStyles.overlay} activeOpacity={1} onPress={() => {}} />
      <View style={[sessStyles.sheet, { paddingBottom: Math.max(insets.bottom, 12) + 24 }]}>
        <View style={sessStyles.handle} />

        <View style={{ alignItems: 'center', marginBottom: 24 }}>
          <LinearGradient
            colors={active ? ['#071A14', '#0F3024'] : ['#1A1A1A', '#0D0D0D']}
            style={sessStyles.iconRing}
          >
            <Text style={{ fontSize: 32 }}>⚡</Text>
          </LinearGradient>
          <Text style={sessStyles.sessionTitle}>{active ? 'Charging in Progress' : 'Paused'}</Text>
          <Text style={sessStyles.connectorLabel}>{connector?.type} · {connector?.power} kW</Text>
        </View>

        {/* Timer */}
        <View style={sessStyles.timerBox}>
          <Text style={sessStyles.timerText}>{formatTime(elapsed)}</Text>
          <Text style={sessStyles.timerLabel}>Session Duration</Text>
        </View>

        {/* Progress arc (simple bar) */}
        <View style={{ marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: colors.textSecondary }}>Battery</Text>
            <Text style={{ fontFamily: 'SpaceGrotesk_600SemiBold', fontSize: 12, color: colors.primary }}>{pct}%</Text>
          </View>
          <View style={sessStyles.progressBg}>
            <Animated.View style={[sessStyles.progressFill, { width: `${pct}%` }]} />
          </View>
        </View>

        {/* Stats */}
        <View style={sessStyles.statsRow}>
          <View style={sessStyles.statBox}>
            <Text style={sessStyles.statVal}>{energy.toFixed(2)}</Text>
            <Text style={sessStyles.statLbl}>kWh Added</Text>
          </View>
          <View style={[sessStyles.statBox, { borderLeftWidth: 1, borderRightWidth: 1, borderColor: colors.border }]}>
            <Text style={sessStyles.statVal}>₹{cost}</Text>
            <Text style={sessStyles.statLbl}>Estimated Cost</Text>
          </View>
          <View style={sessStyles.statBox}>
            <Text style={[sessStyles.statVal, { color: colors.primary }]}>{connector?.power} kW</Text>
            <Text style={sessStyles.statLbl}>Charge Rate</Text>
          </View>
        </View>

        {/* Stop button */}
        <TouchableOpacity onPress={handleStop} style={sessStyles.stopBtn}>
          <Text style={sessStyles.stopBtnText}>Stop Charging</Text>
        </TouchableOpacity>
        <SecondaryButton title="Minimize (keeps charging)" onPress={onClose} style={{ marginTop: 10 }} />
      </View>
    </Modal>
  );
}

export default function EVDetailScreen({ route, navigation }) {
  const { station } = route.params;
  const [selectedConnector, setSelectedConnector] = useState(null);
  const [sessionModal, setSessionModal] = useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const tabBarInset = useTabBarInset();

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  const startCharging = () => {
    if (!selectedConnector) {
      Alert.alert('Select Connector', 'Please select a connector type first.');
      return;
    }
    if (selectedConnector.available === 0) {
      Alert.alert('No Chargers Available', 'All chargers of this type are currently occupied.');
      return;
    }
    setSessionModal(true);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={detStyles.backBtn} accessibilityLabel="Go back">
        <Text style={detStyles.backIcon}>←</Text>
      </TouchableOpacity>

      <Animated.ScrollView style={{ opacity: fadeAnim }} contentContainerStyle={{ paddingBottom: tabBarInset + 16 }} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <LinearGradient colors={['#071A14', '#0D1110']} style={detStyles.hero}>
          <View style={detStyles.heroBadge}>
            <Text style={detStyles.heroBadgeText}>{station.network}</Text>
          </View>
          <Text style={detStyles.heroIcon}>⚡</Text>
          <Text style={detStyles.heroName}>{station.name}</Text>
          <Text style={detStyles.heroAddr}>{station.address}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 12 }}>
            <StarRating rating={station.rating} reviews={station.totalReviews} size={13} />
            <StatusBadge status={station.status} />
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 12, marginTop: 16 }}>
            <View style={detStyles.heroPill}>
              <Text style={detStyles.heroPillVal}>₹{station.pricePerUnit}/kWh</Text>
            </View>
            <View style={detStyles.heroPill}>
              <Text style={detStyles.heroPillVal}>Up to {station.maxPower} kW</Text>
            </View>
            <View style={detStyles.heroPill}>
              <Text style={detStyles.heroPillVal}>{station.distance} away</Text>
            </View>
          </View>
        </LinearGradient>

        <View style={{ padding: 20, gap: 16 }}>
          {/* Select connector */}
          <Card>
            <Text style={detStyles.sectionTitle}>Select Connector</Text>
            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 12, color: colors.textSecondary, marginBottom: 14, marginTop: 2 }}>
              Tap a connector to start charging
            </Text>
            {station.connectors.map((c, i) => {
              const col = CONNECTOR_COLORS[c.type] || colors.textSecondary;
              const avail = c.available > 0;
              const selected = selectedConnector === c;
              return (
                <TouchableOpacity
                  key={i}
                  onPress={() => setSelectedConnector(c)}
                  style={[
                    detStyles.connectorRow,
                    selected && { borderColor: col, backgroundColor: col + '10' },
                    !avail && { opacity: 0.6 },
                  ]}
                >
                  <View style={[detStyles.connectorDot, { backgroundColor: avail ? col : colors.error }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={[detStyles.connectorType, { color: col }]}>{c.type}</Text>
                    <Text style={detStyles.connectorPower}>{c.power} kW · {c.available} of {c.total} available</Text>
                  </View>
                  {selected && (
                    <LinearGradient colors={['#2FD987', '#1AAD64']} style={detStyles.selectedTag}>
                      <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 10, color: colors.bg }}>Selected</Text>
                    </LinearGradient>
                  )}
                  {!avail && <Text style={{ fontSize: 11, color: colors.error, fontFamily: 'Inter_500Medium' }}>Full</Text>}
                </TouchableOpacity>
              );
            })}
          </Card>

          {/* Operating hours */}
          <Card>
            <Text style={detStyles.sectionTitle}>Hours & Info</Text>
            <View style={{ gap: 10, marginTop: 10 }}>
              <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                <Text style={{ fontSize: 18 }}>🕐</Text>
                <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 14, color: station.operatingHours === '00:00 – 23:59' ? colors.primary : colors.textPrimary }}>
                  {station.operatingHours === '00:00 – 23:59' ? '24/7 Open' : station.operatingHours}
                </Text>
              </View>
              <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                <Text style={{ fontSize: 18 }}>📍</Text>
                <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: colors.textSecondary, flex: 1 }}>{station.address}</Text>
              </View>
            </View>
          </Card>

          {/* Amenities */}
          <Card>
            <Text style={detStyles.sectionTitle}>Amenities</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 10 }}>
              {station.amenities.map((a) => (
                <View key={a} style={detStyles.amenityPill}>
                  <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 13, color: colors.textPrimary }}>{a}</Text>
                </View>
              ))}
            </View>
          </Card>

          {/* Cost estimator */}
          <Card>
            <Text style={detStyles.sectionTitle}>Cost Estimator</Text>
            <View style={{ marginTop: 10, gap: 8 }}>
              {[20, 40, 60].map((kwh) => (
                <View key={kwh} style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 }}>
                  <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: colors.textSecondary }}>{kwh} kWh added</Text>
                  <Text style={{ fontFamily: 'SpaceGrotesk_600SemiBold', fontSize: 14, color: colors.textPrimary }}>≈ ₹{kwh * station.pricePerUnit}</Text>
                </View>
              ))}
            </View>
          </Card>

          {/* Start charging */}
          <PrimaryButton
            title={selectedConnector ? `⚡ Start Charging — ${selectedConnector.type}` : '⚡ Start Charging'}
            onPress={startCharging}
          />
        </View>
      </Animated.ScrollView>

      <ChargingSessionModal
        visible={sessionModal}
        station={station}
        connector={selectedConnector}
        onClose={() => setSessionModal(false)}
      />
    </SafeAreaView>
  );
}

const detStyles = StyleSheet.create({
  backBtn: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 4 },
  backIcon: { fontSize: 24, color: colors.textPrimary },
  hero: { padding: 24, alignItems: 'center' },
  heroBadge: { backgroundColor: colors.primaryGlow, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 5, borderWidth: 1, borderColor: colors.primary + '50', marginBottom: 12 },
  heroBadgeText: { fontFamily: 'Inter_500Medium', fontSize: 11, color: colors.primary },
  heroIcon: { fontSize: 44, marginBottom: 8 },
  heroName: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 20, color: colors.textPrimary, textAlign: 'center' },
  heroAddr: { fontFamily: 'Inter_400Regular', fontSize: 13, color: colors.textSecondary, textAlign: 'center', marginTop: 4 },
  heroPill: { backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 6 },
  heroPillVal: { fontFamily: 'Inter_500Medium', fontSize: 12, color: colors.textPrimary },
  sectionTitle: { fontFamily: 'SpaceGrotesk_600SemiBold', fontSize: 15, color: colors.textPrimary },
  connectorRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14, borderRadius: 12, borderWidth: 1.5, borderColor: colors.border, marginBottom: 10, backgroundColor: colors.bgElevated },
  connectorDot: { width: 10, height: 10, borderRadius: 5 },
  connectorType: { fontFamily: 'Inter_600SemiBold', fontSize: 14 },
  connectorPower: { fontFamily: 'Inter_400Regular', fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  selectedTag: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  amenityPill: { backgroundColor: colors.bgElevated, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, marginRight: 8, marginBottom: 8, borderWidth: 1, borderColor: colors.border },
});

const sessStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: { backgroundColor: colors.bgElevated, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, borderWidth: 1, borderColor: colors.border },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, alignSelf: 'center', marginBottom: 20 },
  iconRing: { width: 90, height: 90, borderRadius: 45, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.primary, marginBottom: 12 },
  sessionTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 20, color: colors.primary },
  connectorLabel: { fontFamily: 'Inter_400Regular', fontSize: 13, color: colors.textSecondary, marginTop: 4 },
  timerBox: { alignItems: 'center', marginBottom: 20 },
  timerText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 48, color: colors.textPrimary, letterSpacing: 2 },
  timerLabel: { fontFamily: 'Inter_400Regular', fontSize: 12, color: colors.textSecondary, marginTop: 4 },
  progressBg: { height: 8, backgroundColor: colors.bgCard, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.primary, borderRadius: 4 },
  statsRow: { flexDirection: 'row', backgroundColor: colors.bgCard, borderRadius: 14, borderWidth: 1, borderColor: colors.border, marginBottom: 20 },
  statBox: { flex: 1, alignItems: 'center', paddingVertical: 14 },
  statVal: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 18, color: colors.textPrimary },
  statLbl: { fontFamily: 'Inter_400Regular', fontSize: 11, color: colors.textSecondary, marginTop: 4 },
  stopBtn: { backgroundColor: 'rgba(255,90,90,0.12)', borderRadius: 14, paddingVertical: 16, alignItems: 'center', borderWidth: 1.5, borderColor: 'rgba(255,90,90,0.4)' },
  stopBtnText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 16, color: colors.error },
});
