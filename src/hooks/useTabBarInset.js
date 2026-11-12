import { useSafeAreaInsets } from 'react-native-safe-area-context';

// Height of the floating tab bar content (excluding the bottom safe-area inset).
export const TAB_BAR_HEIGHT = 72;

/**
 * Bottom padding a scrollable screen needs so its content is not hidden
 * behind the floating tab bar.
 */
export function useTabBarInset() {
  const insets = useSafeAreaInsets();
  return TAB_BAR_HEIGHT + Math.max(insets.bottom, 8) + 16;
}
