// CARVIA — Parking Detail Screen

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Modal,
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
  Divider,
} from '../components/UIComponents';
import { useTabBarInset } from '../hooks/useTabBarInset';

const HOURS = ['1 hr', '2 hrs', '3 hrs', '4 hrs', '6 hrs', '8 hrs', '12 hrs'];
const HOUR_VALS = [1, 2, 3, 4, 6, 8, 12];

function FloorMap({ availableSpots, totalSpots }) {
  const rows = 4;
  const cols = 6;
  const occupiedCount = totalSpots - availableSpots;
  const spots = Array.from({ length: rows * cols }, (_, i) => ({
    id: i,
    occupied: i < Math.round((occupiedCount / totalSpots) * rows * cols),
  }));
  return (
    <View style={{ gap: 6 }}>
      {Array.from({ length: rows }).map((_, row) => (
        <View key={row} style={{ flexDirection: 'row', gap: 6 }}>
          {Array.from({ length: cols }).map((_, col) => {
            const spot = spots[row * cols + col];
            return (
              <View
                key={col}
                style={{
                  flex: 1,
                  height: 28,
                  borderRadius: 4,
                  backgroundColor: spot.occupied ? 'rgba(255,90,90,0.2)' : 'rgba(47,217,135,0.15)',
                  borderWidth: 1,
                  borderColor: spot.occupied ? 'rgba(255,90,90,0.4)' : 'rgba(47,217,135,0.3)',
                }}
              />
            );
          })}
        </View>
      ))}
      <View style={{ flexDirection: 'row', gap: 16, marginTop: 8 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View style={{ width: 12, height: 12, borderRadius: 2, backgroundColor: 'rgba(47,217,135,0.3)', borderWidth: 1, borderColor: 'rgba(47,217,135,0.5)' }} />
          <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: colors.textSecondary }}>Available</Text>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <View style={{ width: 12, height: 12, borderRadius: 2, backgroundColor: 'rgba(255,90,90,0.2)', borderWidth: 1, borderColor: 'rgba(255,90,90,0.4)' }} />
          <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: colors.textSecondary }}>Occupied</Text>
        </View>
      </View>
    </View>
  );
}

function BookingModal({ visible, spot, onClose, onConfirm }) {
  const insets = useSafeAreaInsets();
  // Reset to 1 hour every time the sheet opens.
  const [selectedHours, setSelectedHours] = useState(0);

  useEffect(() => {
    if (visible) setSelectedHours(0);
  }, [visible]);

  const hours = HOUR_VALS[selectedHours];
  const amount = hours * (spot?.pricePerHour || 0);
  const tax = Math.round(amount * 0.18);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <TouchableOpacity style={modalStyles.overlay} activeOpacity={1} onPress={onClose} />
      <View style={[modalStyles.sheet, { paddingBottom: Math.max(insets.bottom, 12) + 24 }]}>
        <View style={modalStyles.handle} />
        <Text style={modalStyles.title}>Book Parking</Text>
        <Text style={modalStyles.spotName}>{spot?.name}</Text>
        <Text style={modalStyles.sectionLabel}>Select Duration</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 20 }}>
          {HOURS.map((h, i) => (
            <TouchableOpacity
              key={h}
              onPress={() => setSelectedHours(i)}
              style={[modalStyles.hourChip, selectedHours === i && modalStyles.hourChipActive]}
            >
              <Text style={[modalStyles.hourText, selectedHours === i && modalStyles.hourTextActive]}>{h}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
        <View style={modalStyles.priceBreakdown}>
          <View style={modalStyles.priceRow}>
            <Text style={modalStyles.priceLabel}>Parking ({hours} hr × ₹{spot?.pricePerHour})</Text>
            <Text style={modalStyles.priceVal}>₹{amount}</Text>
          </View>
          <View style={modalStyles.priceRow}>
            <Text style={modalStyles.priceLabel}>GST (18%)</Text>
            <Text style={modalStyles.priceVal}>₹{tax}</Text>
          </View>
          <Divider />
          <View style={modalStyles.priceRow}>
            <Text style={[modalStyles.priceLabel, { fontFamily: 'SpaceGrotesk_700Bold', color: colors.textPrimary }]}>Total</Text>
            <Text style={[modalStyles.priceVal, { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 20, color: colors.primary }]}>₹{amount + tax}</Text>
          </View>
        </View>
        <PrimaryButton
          title={`Pay ₹${amount + tax} & Confirm`}
          onPress={() => onConfirm(hours, amount + tax)}
          style={{ marginTop: 8 }}
        />
        <SecondaryButton title="Cancel" onPress={onClose} style={{ marginTop: 10 }} />
      </View>
    </Modal>
  );
}

function ConfirmModal({ visible, booking, spot, onClose }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.75)', alignItems: 'center', justifyContent: 'center' }}>
        <View style={{ backgroundColor: colors.bgCard, borderRadius: 24, padding: 32, margin: 24, alignItems: 'center', borderWidth: 1, borderColor: colors.border }}>
          <LinearGradient colors={['#1E3D2F', '#0D2920']} style={{ width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
            <Text style={{ fontSize: 36 }}>✅</Text>
          </LinearGradient>
          <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 22, color: colors.primary, marginBottom: 8 }}>Booked!</Text>
          <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginBottom: 24 }}>
            Your spot at {spot?.shortName} is confirmed for {booking?.hours} hour{booking?.hours > 1 ? 's' : ''}.
          </Text>
          <View style={{ backgroundColor: colors.bgElevated, borderRadius: 12, padding: 16, width: '100%', marginBottom: 20 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: colors.textSecondary }}>Booking ID</Text>
              <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: 13, color: colors.textPrimary }}>#{booking?.id}</Text>
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: colors.textSecondary }}>Amount Paid</Text>
              <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 13, color: colors.primary }}>₹{booking?.amount}</Text>
            </View>
          </View>
          <PrimaryButton title="Done" onPress={onClose} style={{ width: '100%' }} />
        </View>
      </View>
    </Modal>
  );
}

export default function ParkingDetailScreen({ route, navigation }) {
  const { spot, autoBook } = route.params;
  const [bookingModal, setBookingModal] = useState(false);
  const [confirmModal, setConfirmModal] = useState(false);
  const [booking, setBooking] = useState(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const tabBarInset = useTabBarInset();

  useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 400, useNativeDriver: true }).start();
  }, []);

  // "Book Now" on a card jumps straight into the booking sheet.
  useEffect(() => {
    if (autoBook && spot.status !== 'full') {
      setBookingModal(true);
    }
  }, [autoBook, spot.status]);

  const handleConfirm = (hours, amount) => {
    setBookingModal(false);
    setBooking({
      hours,
      amount,
      id: `CV${Math.floor(10000 + Math.random() * 90000)}`,
    });
    setConfirmModal(true);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: colors.bg }} edges={['top']}>
      {/* Back button */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={detailStyles.backBtn} accessibilityLabel="Go back">
        <Text style={detailStyles.backIcon}>←</Text>
      </TouchableOpacity>

      <Animated.ScrollView style={{ opacity: fadeAnim }} contentContainerStyle={{ paddingBottom: tabBarInset + 16 }} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <LinearGradient colors={['#0A2540', '#0D1110']} style={detailStyles.hero}>
          <Text style={detailStyles.heroIcon}>🅿️</Text>
          <Text style={detailStyles.heroName}>{spot.name}</Text>
          <Text style={detailStyles.heroAddr}>{spot.address}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 12 }}>
            <StarRating rating={spot.rating} reviews={spot.totalReviews} size={13} />
            <StatusBadge status={spot.status} />
          </View>
        </LinearGradient>

        <View style={{ padding: 20, gap: 16 }}>
          {/* Key Stats */}
          <Card>
            <View style={{ flexDirection: 'row' }}>
              {[
                { label: 'Price', value: `₹${spot.pricePerHour}/hr`, icon: '💰' },
                { label: 'Available', value: `${spot.availableSpots}/${spot.totalSpots}`, icon: '🅿️' },
                { label: 'Distance', value: spot.distance, icon: '📍' },
              ].map((stat, i) => (
                <React.Fragment key={stat.label}>
                  <View style={{ flex: 1, alignItems: 'center', gap: 4 }}>
                    <Text style={{ fontSize: 20 }}>{stat.icon}</Text>
                    <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 16, color: colors.textPrimary }}>{stat.value}</Text>
                    <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: colors.textSecondary }}>{stat.label}</Text>
                  </View>
                  {i < 2 && <View style={{ width: 1, backgroundColor: colors.border }} />}
                </React.Fragment>
              ))}
            </View>
          </Card>

          {/* Floor map */}
          <Card>
            <Text style={detailStyles.sectionTitle}>Spot Availability</Text>
            <FloorMap availableSpots={spot.availableSpots} totalSpots={spot.totalSpots} />
          </Card>

          {/* Operating hours */}
          <Card>
            <Text style={detailStyles.sectionTitle}>Operating Hours</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8 }}>
              <Text style={{ fontSize: 20 }}>🕐</Text>
              <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 15, color: spot.operatingHours === '00:00 – 23:59' ? colors.primary : colors.textPrimary }}>
                {spot.operatingHours === '00:00 – 23:59' ? '24 / 7 Open' : spot.operatingHours}
              </Text>
            </View>
          </Card>

          {/* Amenities */}
          <Card>
            <Text style={detailStyles.sectionTitle}>Amenities</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 }}>
              {spot.amenities.map((a) => (
                <View key={a} style={detailStyles.amenityItem}>
                  <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 13, color: colors.textPrimary }}>{a}</Text>
                </View>
              ))}
            </View>
          </Card>

          {/* Book CTA */}
          {spot.status !== 'full' ? (
            <PrimaryButton
              title={`Book a Spot — ₹${spot.pricePerHour}/hr`}
              onPress={() => setBookingModal(true)}
            />
          ) : (
            <View style={{ backgroundColor: colors.bgCard, borderRadius: 14, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: colors.error + '40' }}>
              <Text style={{ fontFamily: 'SpaceGrotesk_600SemiBold', fontSize: 16, color: colors.error }}>Parking Full</Text>
              <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 13, color: colors.textSecondary, marginTop: 4 }}>Try again later or find a nearby spot</Text>
            </View>
          )}
        </View>
      </Animated.ScrollView>

      <BookingModal
        visible={bookingModal}
        spot={spot}
        onClose={() => setBookingModal(false)}
        onConfirm={handleConfirm}
      />
      <ConfirmModal
        visible={confirmModal}
        booking={booking}
        spot={spot}
        onClose={() => { setConfirmModal(false); navigation.goBack(); }}
      />
    </SafeAreaView>
  );
}

const detailStyles = StyleSheet.create({
  backBtn: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 4 },
  backIcon: { fontSize: 24, color: colors.textPrimary },
  hero: { padding: 24, alignItems: 'center' },
  heroIcon: { fontSize: 48, marginBottom: 8 },
  heroName: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 20, color: colors.textPrimary, textAlign: 'center' },
  heroAddr: { fontFamily: 'Inter_400Regular', fontSize: 13, color: colors.textSecondary, textAlign: 'center', marginTop: 4 },
  sectionTitle: { fontFamily: 'SpaceGrotesk_600SemiBold', fontSize: 15, color: colors.textPrimary, marginBottom: 4 },
  amenityItem: { backgroundColor: colors.bgElevated, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6, marginRight: 8, marginBottom: 8, borderWidth: 1, borderColor: colors.border },
});

const modalStyles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)' },
  sheet: { backgroundColor: colors.bgElevated, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, borderWidth: 1, borderColor: colors.border },
  handle: { width: 40, height: 4, borderRadius: 2, backgroundColor: colors.border, alignSelf: 'center', marginBottom: 20 },
  title: { fontFamily: 'SpaceGrotesk_700Bold', fontSize: 20, color: colors.textPrimary, marginBottom: 4 },
  spotName: { fontFamily: 'Inter_400Regular', fontSize: 13, color: colors.textSecondary, marginBottom: 20 },
  sectionLabel: { fontFamily: 'SpaceGrotesk_600SemiBold', fontSize: 14, color: colors.textSecondary, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.8 },
  hourChip: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 10, borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.bgCard, marginRight: 10 },
  hourChipActive: { borderColor: colors.primary, backgroundColor: colors.primaryGlow },
  hourText: { fontFamily: 'Inter_500Medium', fontSize: 14, color: colors.textSecondary },
  hourTextActive: { color: colors.primary, fontFamily: 'Inter_600SemiBold' },
  priceBreakdown: { backgroundColor: colors.bgCard, borderRadius: 14, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: colors.border },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  priceLabel: { fontFamily: 'Inter_400Regular', fontSize: 14, color: colors.textSecondary },
  priceVal: { fontFamily: 'Inter_500Medium', fontSize: 15, color: colors.textPrimary },
});
