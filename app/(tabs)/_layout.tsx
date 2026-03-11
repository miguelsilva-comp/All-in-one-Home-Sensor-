import { Tabs } from 'expo-router';
import React from 'react';
import { StyleSheet, View } from 'react-native';

import { HapticTab } from '@/components/haptic-tab';
import { IconSymbol } from '@/components/ui/icon-symbol';

export default function TabLayout() {
  const activeTintColor = '#7df0dc';
  const inactiveTintColor = '#6f8090';
  const tabBarBorder = 'rgba(125, 240, 220, 0.12)';
  const iconGlow = 'rgba(125, 240, 220, 0.16)';

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: activeTintColor,
        tabBarInactiveTintColor: inactiveTintColor,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarShowLabel: true,
        tabBarLabelStyle: styles.tabBarLabel,
        tabBarItemStyle: styles.tabBarItem,
        tabBarBackground: () => <View style={styles.tabBarBackground} />,
        tabBarStyle: [
          styles.tabBar,
          {
            borderColor: tabBarBorder,
          },
        ],
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconFrame, focused && { backgroundColor: iconGlow }]}> 
              <IconSymbol size={24} name="house.fill" color={color} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'History',
          tabBarIcon: ({ color, focused }) => (
            <View style={[styles.iconFrame, focused && { backgroundColor: iconGlow }]}> 
              <IconSymbol size={24} name="clock.fill" color={color} />
            </View>
          ),
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 16,
    height: 72,
    borderRadius: 24,
    backgroundColor: '#0d1218',
    borderTopWidth: 0,
    borderWidth: 1,
    paddingTop: 8,
    paddingBottom: 10,
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 20,
    elevation: 12,
  },
  tabBarBackground: {
    flex: 1,
    borderRadius: 24,
    backgroundColor: '#0d1218',
  },
  tabBarItem: {
    borderRadius: 18,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.4,
    marginTop: 2,
  },
  iconFrame: {
    width: 40,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

