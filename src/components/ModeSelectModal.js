// CARVIA Startup Mode Selector Modal
// Pops up on initial launch to ask: "What are you looking for today? EV Charging or Parking"

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';

const { width } = Dimensions.get('window');

export default function ModeSelectModal({ visible, onSelectMode }) {
  if (!visible) return null;

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.content}>
          {/* Brand header */}
          <View style={styles.brandBadge}>
            <Text style={styles.brandText}>CARVIA</Text>
          </View>

          <Text style={styles.title}>What are you looking for today?</Text>
          <Text style={styles.subtitle}>
            Choose your mode to view live map locations, real-time availability, and instant bookings.
          </Text>

          {/* EV Charging Card */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => onSelectMode('ev')}
            style={styles.cardWrapper}
          >
            <LinearGradient
              colors={['#071F17', '#0F3024']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.card, { borderColor: colors.primary }]}
            >
              <View style={styles.cardHeader}>
                <View style={[styles.iconWrap, { backgroundColor: colors.primaryGlow }]}>
                  <Text style={{ fontSize: 26 }}>⚡</Text>
                </View>
                <View style={styles.recommendedBadge}>
                  <Text style={styles.recommendedText}>SUPERCHARGERS</Text>
                </View>
              </View>

              <Text style={styles.cardTitle}>EV Charging</Text>
              <Text style={styles.cardDesc}>
                Find DC fast chargers (50–150 kW), live connector status (CCS2/Type 2), battery telemetry, and instant sessions.
              </Text>

              <View style={styles.cardFooter}>
                <Text style={[styles.cardAction, { color: colors.primary }]}>Explore Charging Map →</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>

          {/* Smart Parking Card */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => onSelectMode('parking')}
            style={[styles.cardWrapper, { marginTop: 14 }]}
          >
            <LinearGradient
              colors={['#0F2240', '#1A3A5E']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.card, { borderColor: colors.secondary }]}
            >
              <View style={styles.cardHeader}>
                <View style={[styles.iconWrap, { backgroundColor: 'rgba(59, 158, 255, 0.15)' }]}>
                  <Text style={{ fontSize: 26 }}>🅿️</Text>
                </View>
                <View style={[styles.recommendedBadge, { borderColor: colors.secondary }]}>
                  <Text style={[styles.recommendedText, { color: colors.secondary }]}>RESERVED SPOTS</Text>
                </View>
              </View>

              <Text style={styles.cardTitle}>Smart Parking</Text>
              <Text style={styles.cardDesc}>
                Search covered mall & corporate parking, real-time vacant bays, hourly rates, and reserve your spot in advance.
              </Text>

              <View style={styles.cardFooter}>
                <Text style={[styles.cardAction, { color: colors.secondary }]}>Explore Parking Map →</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 8, 7, 0.92)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: colors.bgCard,
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.6,
    shadowRadius: 30,
    elevation: 24,
  },
  brandBadge: {
    backgroundColor: colors.primaryGlow,
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: colors.primary + '50',
    marginBottom: 12,
  },
  brandText: {
    color: colors.primary,
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 12,
    letterSpacing: 2,
  },
  title: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 22,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontFamily: 'Inter_400Regular',
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  cardWrapper: {
    width: '100%',
  },
  card: {
    borderRadius: 18,
    padding: 18,
    borderWidth: 1.5,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recommendedBadge: {
    borderWidth: 1,
    borderColor: colors.primary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  recommendedText: {
    color: colors.primary,
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 9,
    letterSpacing: 0.8,
  },
  cardTitle: {
    fontFamily: 'SpaceGrotesk_700Bold',
    fontSize: 18,
    color: '#fff',
    marginBottom: 6,
  },
  cardDesc: {
    fontFamily: 'Inter_400Regular',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.72)',
    lineHeight: 17,
    marginBottom: 14,
  },
  cardFooter: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 10,
  },
  cardAction: {
    fontFamily: 'SpaceGrotesk_600SemiBold',
    fontSize: 13,
  },
});
