// CARVIA — Custom Tab Bar

import React, { useRef, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors } from '../theme/colors';

const { width } = Dimensions.get('window');

const TABS = [
  { key: 'Home', label: 'Home', icon: '🏠', activeIcon: '🏠' },
  { key: 'Parking', label: 'Parking', icon: '🅿️', activeIcon: '🅿️' },
  { key: 'EV', label: 'Charging', icon: '⚡', activeIcon: '⚡' },
  { key: 'Profile', label: 'Profile', icon: '👤', activeIcon: '👤' },
];

export default function CustomTabBar({ state, descriptors, navigation }) {
  const animations = useRef(TABS.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    TABS.forEach((_, i) => {
      Animated.timing(animations[i], {
        toValue: state.index === i ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    });
  }, [state.index]);

  return (
    <View style={tabStyles.container}>
      <LinearGradient
        colors={['rgba(13,17,16,0)', 'rgba(13,17,16,0.98)', '#0D1110']}
        style={tabStyles.gradient}
        pointerEvents="none"
      />
      <View style={tabStyles.bar}>
        {TABS.map((tab, index) => {
          const isFocused = state.index === index;
          const route = state.routes[index];

          const scale = animations[index].interpolate({
            inputRange: [0, 1],
            outputRange: [0.95, 1.05],
          });

          const translateY = animations[index].interpolate({
            inputRange: [0, 1],
            outputRange: [0, -4],
          });

          return (
            <TouchableOpacity
              key={tab.key}
              onPress={() => navigation.navigate(tab.key)}
              activeOpacity={0.8}
              style={tabStyles.tab}
            >
              <Animated.View style={[tabStyles.tabInner, { transform: [{ scale }, { translateY }] }]}>
                {isFocused && (
                  <View style={tabStyles.activeIndicator} />
                )}
                <Text style={tabStyles.icon}>{tab.icon}</Text>
                <Text style={[tabStyles.label, isFocused && tabStyles.labelActive]}>
                  {tab.label}
                </Text>
              </Animated.View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const tabStyles = StyleSheet.create({
  container: { position: 'absolute', bottom: 0, left: 0, right: 0 },
  gradient: { position: 'absolute', bottom: 0, left: 0, right: 0, height: 100 },
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.bgElevated,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingBottom: 20,
    paddingTop: 10,
    marginHorizontal: 16,
    marginBottom: 10,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: -4 },
    elevation: 20,
  },
  tab: { flex: 1, alignItems: 'center' },
  tabInner: { alignItems: 'center', gap: 4, paddingHorizontal: 10 },
  activeIndicator: {
    position: 'absolute',
    top: -12,
    width: 32,
    height: 3,
    backgroundColor: colors.primary,
    borderRadius: 2,
  },
  icon: { fontSize: 22 },
  label: { fontFamily: 'Inter_500Medium', fontSize: 11, color: colors.tabInactive },
  labelActive: { color: colors.primary, fontFamily: 'Inter_600SemiBold' },
});
