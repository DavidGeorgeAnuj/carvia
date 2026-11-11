// CARVIA — Profile Screen

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';
import { Card, Divider, PrimaryButton, SecondaryButton } from '../components/UIComponents';
import { mockUser, mockStats, mockRecentActivity } from '../data/mockData';

function SettingRow({ icon, label, value, onPress, toggle, toggleValue, onToggle, danger }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={onPress ? 0.75 : 1}
      style={[profStyles.settingRow, danger && { borderColor: colors.error + '30' }]}
    >
      <View style={[profStyles.settingIcon, danger && { backgroundColor: 'rgba(255,90,90,0.1)' }]}>
        <Text style={{ fontSize: 18 }}>{icon}</Text>
      </View>
      <Text style={[profStyles.settingLabel, danger && { color: colors.error }]}>{label}</Text>
      <View style={{ flex: 1 }} />
      {value && <Text style={profStyles.settingValue}>{value}</Text>}
      {toggle && (
        <Switch
          value={toggleValue}
          onValueChange={onToggle}
          trackColor={{ false: colors.border, true: colors.primary }}
          thumbColor={toggleValue ? colors.bg : colors.textSecondary}
        />
      )}
      {!toggle && onPress && <Text style={{ color: colors.textMuted, fontSize: 16 }}>›</Text>}
    </TouchableOpacity>
  );
}

function StatBadge({ icon, value, label, color }) {
  return (
    <View style={profStyles.statBadge}>
      <Text style={{ fontSize: 22 }}>{icon}</Text>
      <Text style={[profStyles.statVal, color && { color }]}>{value}</Text>
      <Text style={profStyles.statLbl}>{label}</Text>
    </View>
  );
}

function VehicleCard({ vehicle }) {
  return (
    <View style={profStyles.vehicleCard}>
      <Text style={{ fontSize: 32 }}>{vehicle.icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={profStyles.vehicleName}>{vehicle.name}</Text>
        <Text style={profStyles.vehiclePlate}>{vehicle.plate}</Text>
        {vehicle.batteryPct !== undefined && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 4 }}>
            <View style={profStyles.batteryBg}>
              <View style={[profStyles.batteryFill, {
                width: `${vehicle.batteryPct}%`,
                backgroundColor: vehicle.batteryPct > 50 ? colors.primary : vehicle.batteryPct > 20 ? colors.warning : colors.error,
              }]} />
            </View>
            <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 11, color: colors.textSecondary }}>{vehicle.batteryPct}%</Text>
          </View>
        )}
      </View>
      {vehicle.isEV && (
        <View style={profStyles.evTag}>
          <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 10, color: colors.primary }}>EV</Text>
        </View>
      )}
    </View>
  );
}

const mockVehicles = [
  { id: 'v1', name: 'Tata Nexon EV Max', plate: 'KA 05 AB 1234', icon: '🚗', isEV: true, batteryPct: 72 },
  { id: 'v2', name: 'Honda Activa 6G', plate: 'KA 05 CD 5678', icon: '🛵', isEV: false },
];

export default function ProfileScreen({ navigation }) {
  const [notifications, setNotifications] = useState(true);
  const [locationServices, setLocationServices] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [autoRenew, setAutoRenew] = useState(false);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
        {/* Hero header */}
        <LinearGradient colors={['#071A14', '#0D1110']} style={profStyles.hero}>
          <View style={profStyles.avatarRing}>
            <LinearGradient colors={['#2FD987', '#1AAD64']} style={profStyles.avatarGrad}>
              <Text style={profStyles.avatarText}>{mockUser.name.charAt(0)}</Text>
            </LinearGradient>
          </View>
          <Text style={profStyles.heroName}>{mockUser.name}</Text>
          <Text style={profStyles.heroEmail}>{mockUser.email}</Text>
          <View style={profStyles.tierBadge}>
            <Text style={{ fontSize: 12 }}>⭐</Text>
            <Text style={profStyles.tierText}>CARVIA Pro Member</Text>
          </View>
        </LinearGradient>

        <View style={{ padding: 20, gap: 20 }}>
          {/* Stats */}
          <Card>
            <Text style={profStyles.sectionTitle}>Your Stats</Text>
            <View style={profStyles.statsRow}>
              <StatBadge icon="🅿️" value={mockUser.totalParking} label="Parkings" />
              <StatBadge icon="⚡" value={mockUser.totalEV} label="EV Sessions" color={colors.primary} />
              <StatBadge icon="🌱" value={`${mockStats.co2Saved}kg`} label="CO₂ Saved" color={colors.primary} />
              <StatBadge icon="💰" value={`₹${(mockStats.totalSpent / 1000).toFixed(1)}k`} label="Spent" />
            </View>
          </Card>

          {/* My Vehicles */}
          <View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={profStyles.sectionTitle}>My Vehicles</Text>
              <TouchableOpacity
                onPress={() => Alert.alert('Add Vehicle', 'Vehicle registration coming soon!')}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
              >
                <Text style={{ color: colors.primary, fontSize: 20, fontFamily: 'SpaceGrotesk_700Bold' }}>+</Text>
                <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 13, color: colors.primary }}>Add</Text>
              </TouchableOpacity>
            </View>
            <Card noPadding style={{ overflow: 'hidden' }}>
              {mockVehicles.map((v, i) => (
                <View key={v.id}>
                  <VehicleCard vehicle={v} />
                  {i < mockVehicles.length - 1 && <View style={{ height: 1, backgroundColor: colors.border }} />}
                </View>
              ))}
            </Card>
          </View>

          {/* Payment */}
          <View>
            <Text style={[profStyles.sectionTitle, { marginBottom: 12 }]}>Payment</Text>
            <Card>
              <SettingRow icon="💳" label="Saved Cards" value="1 card" onPress={() => Alert.alert('Cards', 'Payment management coming soon!')} />
              <Divider style={{ marginVertical: 4 }} />
              <SettingRow icon="🧾" label="Transaction History" onPress={() => Alert.alert('History', 'Full transaction history coming soon!')} />
              <Divider style={{ marginVertical: 4 }} />
              <SettingRow icon="🎁" label="CARVIA Credits" value="₹240" onPress={() => {}} />
            </Card>
          </View>

          {/* Preferences */}
          <View>
            <Text style={[profStyles.sectionTitle, { marginBottom: 12 }]}>Preferences</Text>
            <Card>
              <SettingRow icon="🔔" label="Notifications" toggle toggleValue={notifications} onToggle={setNotifications} />
              <Divider style={{ marginVertical: 4 }} />
              <SettingRow icon="📍" label="Location Services" toggle toggleValue={locationServices} onToggle={setLocationServices} />
              <Divider style={{ marginVertical: 4 }} />
              <SettingRow icon="🌙" label="Dark Mode" toggle toggleValue={darkMode} onToggle={setDarkMode} />
              <Divider style={{ marginVertical: 4 }} />
              <SettingRow icon="🔄" label="Auto-renew Parking" toggle toggleValue={autoRenew} onToggle={setAutoRenew} />
            </Card>
          </View>

          {/* Support */}
          <View>
            <Text style={[profStyles.sectionTitle, { marginBottom: 12 }]}>Support</Text>
            <Card>
              <SettingRow icon="💬" label="Help & Support" onPress={() => Alert.alert('Support', 'Chat with our team 24/7!')} />
              <Divider style={{ marginVertical: 4 }} />
              <SettingRow icon="⭐" label="Rate CARVIA" onPress={() => Alert.alert('Rate Us', 'Thanks for supporting CARVIA!')} />
              <Divider style={{ marginVertical: 4 }} />
              <SettingRow icon="📋" label="Privacy Policy" onPress={() => {}} />
              <Divider style={{ marginVertical: 4 }} />
              <SettingRow icon="📄" label="Terms of Service" onPress={() => {}} />
            </Card>
          </View>

          {/* Sign out */}
          <Card>
            <SettingRow icon="🚪" label="Sign Out" danger onPress={() => Alert.alert('Sign Out', 'Sign out of CARVIA?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Sign Out', style: 'destructive', onPress: () => {} },
            ])} />
          </Card>

          {/* Footer */}
          <View style={{ alignItems: 'center', paddingTop: 8 }}>
            <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 14, color: colors.primary, letterSpacing: 2 }}>CARVIA</Text>
            <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: colors.textMuted, marginTop: 4 }}>v1.0.0 · Built for Bharat 🇮🇳</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const profStyles = StyleSheet.create({
  hero: { padding: 32, alignItems: 'center', paddingBottom: 28 },
  avatarRing: { width: 90, height: 90, borderRadius: 45, padding: 3, borderWidth: 2, borderColor: colors.primary, marginBottom: 16 },
  avatarGrad: { flex: 1, borderRadius: 42, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 36, color: colors.bg },
  heroName: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 22, color: colors.textPrimary },
  heroEmail: { fontFamily: 'Inter_400Regular', fontSize: 13, color: colors.textSecondary, marginTop: 4 },
  tierBadge: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.primaryGlow, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 6, marginTop: 14, borderWidth: 1, borderColor: colors.primary + '50' },
  tierText: { fontFamily: 'Inter_600SemiBold', fontSize: 12, color: colors.primary },
  sectionTitle: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 16, color: colors.textPrimary },
  statsRow: { flexDirection: 'row', marginTop: 12, gap: 4 },
  statBadge: { flex: 1, alignItems: 'center', gap: 4, paddingVertical: 8 },
  statVal: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 17, color: colors.textPrimary },
  statLbl: { fontFamily: 'Inter_400Regular', fontSize: 10, color: colors.textSecondary, textAlign: 'center' },
  vehicleCard: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16 },
  vehicleName: { fontFamily: 'SpaceGrotesk_600SemiBold', fontSize: 14, color: colors.textPrimary },
  vehiclePlate: { fontFamily: 'Inter_400Regular', fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  batteryBg: { flex: 1, height: 5, backgroundColor: colors.bgElevated, borderRadius: 3, overflow: 'hidden', maxWidth: 80 },
  batteryFill: { height: '100%', borderRadius: 3 },
  evTag: { backgroundColor: colors.primaryGlow, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, borderWidth: 1, borderColor: colors.primary + '50' },
  settingRow: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 10, borderRadius: 10 },
  settingIcon: { width: 38, height: 38, borderRadius: 10, backgroundColor: colors.bgElevated, alignItems: 'center', justifyContent: 'center' },
  settingLabel: { fontFamily: 'Inter_500Medium', fontSize: 14, color: colors.textPrimary },
  settingValue: { fontFamily: 'Inter_400Regular', fontSize: 13, color: colors.textSecondary, marginRight: 8 },
});
