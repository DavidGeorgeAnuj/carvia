// CARVIA — Reusable UI Components

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';

// ─── CARVIA Logo / Wordmark ───────────────────────────────────────────────────
export function CarviaLogo({ size = 'md', style }) {
  const fontSize = size === 'lg' ? 28 : size === 'sm' ? 16 : 22;
  return (
    <Text style={[{ fontSize, fontFamily: 'SpaceGrotesk_700Bold', color: colors.textPrimary, letterSpacing: 1.5 }, style]}>
      CARVIA
    </Text>
  );
}

// ─── Primary Button ───────────────────────────────────────────────────────────
export function PrimaryButton({ title, onPress, loading, disabled, style, textStyle, icon }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.85}
      style={[btnStyles.base, disabled && btnStyles.disabled, style]}
    >
      <LinearGradient
        colors={['#2FD987', '#1AAD64']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={btnStyles.gradient}
      >
        {loading ? (
          <ActivityIndicator color={colors.textInverse} size="small" />
        ) : (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            {icon}
            <Text style={[btnStyles.text, textStyle]}>{title}</Text>
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
}

const btnStyles = StyleSheet.create({
  base: { borderRadius: 14, overflow: 'hidden' },
  gradient: { paddingVertical: 16, paddingHorizontal: 24, alignItems: 'center', justifyContent: 'center' },
  text: { color: '#0D1110', fontFamily: 'SpaceGrotesk_600SemiBold', fontSize: 16, letterSpacing: 0.3 },
  disabled: { opacity: 0.5 },
});

// ─── Secondary / Outline Button ───────────────────────────────────────────────
export function SecondaryButton({ title, onPress, style, textStyle, icon }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[secBtnStyles.base, style]}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {icon}
        <Text style={[secBtnStyles.text, textStyle]}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
}

const secBtnStyles = StyleSheet.create({
  base: {
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: colors.border,
    paddingVertical: 14,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.bgCard,
  },
  text: { color: colors.textPrimary, fontFamily: 'SpaceGrotesk_600SemiBold', fontSize: 16 },
});

// ─── Card ─────────────────────────────────────────────────────────────────────
export function Card({ children, style, onPress, noPadding }) {
  const content = (
    <View style={[cardStyles.card, noPadding && { padding: 0 }, style]}>
      {children}
    </View>
  );
  if (onPress) {
    return (
      <TouchableOpacity onPress={onPress} activeOpacity={0.9}>
        {content}
      </TouchableOpacity>
    );
  }
  return content;
}

const cardStyles = StyleSheet.create({
  card: {
    backgroundColor: colors.bgCard,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
});

// ─── Chip / Badge ─────────────────────────────────────────────────────────────
export function Chip({ label, active, onPress, style }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        chipStyles.base,
        active && chipStyles.active,
        style,
      ]}
    >
      <Text style={[chipStyles.text, active && chipStyles.activeText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const chipStyles = StyleSheet.create({
  base: {
    borderRadius: 20,
    paddingVertical: 7,
    paddingHorizontal: 16,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.bgElevated,
    marginRight: 8,
  },
  active: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryGlow,
  },
  text: {
    fontFamily: 'Inter_500Medium',
    fontSize: 13,
    color: colors.textSecondary,
  },
  activeText: { color: colors.primary },
});

// ─── Status Badge ─────────────────────────────────────────────────────────────
export function StatusBadge({ status }) {
  const map = {
    available: { label: 'Available', color: colors.available, bg: 'rgba(47,217,135,0.12)' },
    partial: { label: 'Limited', color: colors.warning, bg: 'rgba(255,185,48,0.12)' },
    full: { label: 'Full', color: colors.error, bg: 'rgba(255,90,90,0.12)' },
    occupied: { label: 'Occupied', color: colors.error, bg: 'rgba(255,90,90,0.12)' },
  };
  const s = map[status] || map.available;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: s.bg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 }}>
      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: s.color }} />
      <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 11, color: s.color }}>{s.label}</Text>
    </View>
  );
}

// ─── Star Rating ──────────────────────────────────────────────────────────────
export function StarRating({ rating, reviews, size = 12 }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
      <Text style={{ color: '#FFB930', fontSize: size }}>★</Text>
      <Text style={{ fontFamily: 'Inter_600SemiBold', fontSize: size, color: colors.textPrimary }}>{rating}</Text>
      {reviews && (
        <Text style={{ fontFamily: 'Inter_400Regular', fontSize: size - 1, color: colors.textSecondary }}>({reviews})</Text>
      )}
    </View>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────
export function SectionHeader({ title, action, onAction }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
      <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 18, color: colors.textPrimary }}>{title}</Text>
      {action && (
        <TouchableOpacity onPress={onAction}>
          <Text style={{ fontFamily: 'Inter_500Medium', fontSize: 14, color: colors.primary }}>{action}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// ─── Amenity Tag ──────────────────────────────────────────────────────────────
export function AmenityTag({ label }) {
  return (
    <View style={{ backgroundColor: colors.bgElevated, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, marginRight: 6, marginBottom: 6 }}>
      <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 11, color: colors.textSecondary }}>{label}</Text>
    </View>
  );
}

// ─── Divider ──────────────────────────────────────────────────────────────────
export function Divider({ style }) {
  return <View style={[{ height: 1, backgroundColor: colors.border, marginVertical: 12 }, style]} />;
}

// ─── Empty State ──────────────────────────────────────────────────────────────
export function EmptyState({ icon, title, subtitle }) {
  return (
    <View style={{ alignItems: 'center', paddingVertical: 48, gap: 12 }}>
      <Text style={{ fontSize: 48 }}>{icon}</Text>
      <Text style={{ fontFamily: 'SpaceGrotesk_700Bold', fontSize: 18, color: colors.textPrimary, textAlign: 'center' }}>{title}</Text>
      {subtitle && <Text style={{ fontFamily: 'Inter_400Regular', fontSize: 14, color: colors.textSecondary, textAlign: 'center', paddingHorizontal: 24 }}>{subtitle}</Text>}
    </View>
  );
}
