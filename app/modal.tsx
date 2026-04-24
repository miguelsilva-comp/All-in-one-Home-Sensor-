import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  getCurrentHumidity,
  getCurrentPressure,
  getCurrentTemperature,
  HIGH_TEMPERATURE_THRESHOLD,
  setCurrentHumidity,
  setCurrentPressure,
  setCurrentTemperature,
  subscribeToHumidity,
  subscribeToPressure,
  subscribeToTemperature
} from '@/constants/sensor-data';
import {
  addNotificationReceivedListener,
  addNotificationResponseListener,
  configureNotifications,
  getExpoPushToken,
  getNotificationPermissionStatus,
  hasNotificationPermission,
  removeNotificationSubscription,
  requestNotificationPermissions,
  sendLocalNotification,
} from '@/hooks/use-notifications';

type PermissionState = 'idle' | 'checking' | 'granted' | 'denied' | 'unsupported';

export default function ModalScreen() {
  const [permissionState, setPermissionState] = useState<PermissionState>('idle');
  const [currentTemperature, setCurrentTemperatureDisplay] = useState<number>(getCurrentTemperature());
  const [currentHumidity, setCurrentHumidityDisplay] = useState<number>(getCurrentHumidity());
  const [currentPressure, setCurrentPressureDisplay] = useState<number>(getCurrentPressure());
  const [lastReceivedTitle, setLastReceivedTitle] = useState<string | null>(null);
  const [lastOpenedTitle, setLastOpenedTitle] = useState<string | null>(null);
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);
  const [expoPushTokenMessage, setExpoPushTokenMessage] = useState<string>('No token requested yet.');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      setPermissionState('checking');

      try {
        await configureNotifications();
        const status = await getNotificationPermissionStatus();

        if (!mounted) {
          return;
        }

        if (status === 'granted') {
          setPermissionState('granted');
          setExpoPushTokenMessage((previous) =>
            expoPushToken ? previous : 'Notifications are enabled. Open the app on a physical device to fetch a push token.'
          );
          return;
        }

        if (status === 'unsupported') {
          setPermissionState('unsupported');
          return;
        }

        setPermissionState('denied');
      } catch (error) {
        if (mounted) {
          setPermissionState('denied');
        }
        console.warn('Failed to initialize notification settings', error);
      }
    };

    initialize();

    const receivedSubscription = addNotificationReceivedListener((event) => {
      const title = event.request.content.title ?? 'Notification received';
      setLastReceivedTitle(title);
    });

    const responseSubscription = addNotificationResponseListener((response) => {
      const title = response.notification.request.content.title ?? 'Notification opened';
      setLastOpenedTitle(title);
    });

    return () => {
      mounted = false;
      removeNotificationSubscription(receivedSubscription);
      removeNotificationSubscription(responseSubscription);
    };
  }, []);

  const permissionDescription = useMemo(() => {
    if (permissionState === 'checking') {
      return 'Checking current notification permission...';
    }

    if (permissionState === 'granted') {
      return 'Notifications are enabled.';
    }

    if (permissionState === 'unsupported') {
      return 'Notifications are not supported on web preview.';
    }

    if (permissionState === 'denied') {
      return 'Notifications are disabled or not granted yet.';
    }

    return 'Notification status has not been checked yet.';
  }, [permissionState]);

  useEffect(() => {
    return subscribeToTemperature((nextTemperature) => {
      setCurrentTemperatureDisplay(nextTemperature);
    });
  }, []);

  useEffect(() => {
    return subscribeToHumidity((nextHumidity) => {
      setCurrentHumidityDisplay(nextHumidity);
    });
  }, []);

  useEffect(() => {
    return subscribeToPressure((nextPressure) => {
      setCurrentPressureDisplay(nextPressure);
    });
  }, []);

  const handleEnableNotifications = async () => {
    setIsBusy(true);
    setStatusMessage(null);
    setExpoPushTokenMessage('Requesting notification permission and fetching push token...');

    try {
      const granted = await requestNotificationPermissions();
      const status = await getNotificationPermissionStatus();

      if (status === 'unsupported') {
        setPermissionState('unsupported');
        setExpoPushToken(null);
        setExpoPushTokenMessage('Expo push tokens are not available in web preview.');
        setStatusMessage('Notifications are not supported in web preview.');
        return;
      }

      if (!granted) {
        setPermissionState('denied');
        setExpoPushToken(null);
        setExpoPushTokenMessage('No Expo push token because permission was not granted.');
        setStatusMessage('Permission was not granted. Enable notifications in your device settings to receive alerts.');
        return;
      }

      setPermissionState('granted');
      const token = await getExpoPushToken();
      setExpoPushToken(token);
      setExpoPushTokenMessage(
        token
          ? `Expo push token updated: ${token}`
          : 'Notifications enabled, but no Expo push token was returned on this device.'
      );
      setStatusMessage(token ? 'Notifications enabled and Expo push token retrieved.' : 'Notifications enabled, but no Expo push token was available.');
    } catch (error) {
      setPermissionState('denied');
      setExpoPushToken(null);
      setExpoPushTokenMessage('Unable to fetch the Expo push token right now.');
      setStatusMessage('Unable to enable notifications right now. Try again later.');
      console.warn('Failed to enable notifications', error);
    } finally {
      setIsBusy(false);
    }
  };

  const handleSendTestAlert = async () => {
    setIsBusy(true);
    setStatusMessage(null);

    try {
      const granted = await hasNotificationPermission();

      if (!granted) {
        setStatusMessage('Notification permission is required before sending a test alert.');
        return;
      }

      await sendLocalNotification({
        title: 'Home sensor test alert',
        body: 'This is a test notification from your home sensor app.',
        data: {
          source: 'modal-test-button',
          type: 'test-alert',
        },
      });

      setStatusMessage('Test alert sent successfully.');
    } catch (error) {
      setStatusMessage('Unable to send the test alert right now.');
      console.warn('Failed to send test alert', error);
    } finally {
      setIsBusy(false);
    }
  };

  const handleSimulateHighTemperature = async () => {
    setIsBusy(true);
    setStatusMessage(null);

    const simulatedTemperature = 27.2;

    try {
      setCurrentTemperature(simulatedTemperature);

      setStatusMessage(
        `Simulated temperature set to ${simulatedTemperature.toFixed(1)}°C. If notifications are enabled, the high-temperature alert should trigger once.`
      );
    } catch (error) {
      setStatusMessage('Unable to simulate the high-temperature alert right now.');
      console.warn('Failed to simulate high temperature alert', error);
    } finally {
      setIsBusy(false);
    }
  };

  const handleResetTemperatureBelowThreshold = async () => {
    setIsBusy(true);
    setStatusMessage(null);

    const resetTemperature = 24.0;

    try {
      setCurrentTemperature(resetTemperature);
      setStatusMessage(
        `Temperature reset to ${resetTemperature.toFixed(1)}°C (below ${HIGH_TEMPERATURE_THRESHOLD}°C). You can simulate high temperature again to retrigger the alert.`
      );
    } catch (error) {
      setStatusMessage('Unable to reset the simulated temperature right now.');
      console.warn('Failed to reset simulated temperature', error);
    } finally {
      setIsBusy(false);
    }
  };

  const handleSimulateHighHumidity = async () => {
    setIsBusy(true);
    setStatusMessage(null);

    const simulatedHumidity = 65.0;

    try {
      setCurrentHumidity(simulatedHumidity);
      setStatusMessage(`Simulated humidity set to ${simulatedHumidity.toFixed(1)}%.`);
    } catch (error) {
      setStatusMessage('Unable to simulate the high-humidity alert right now.');
      console.warn('Failed to simulate high humidity alert', error);
    } finally {
      setIsBusy(false);
    }
  };

  const handleResetHumidityBelowThreshold = async () => {
    setIsBusy(true);
    setStatusMessage(null);

    const resetHumidity = 50.0;

    try {
      setCurrentHumidity(resetHumidity);
      setStatusMessage(`Humidity reset to ${resetHumidity.toFixed(1)}%. You can simulate high humidity again to retrigger the alert.`);
    } catch (error) {
      setStatusMessage('Unable to reset the simulated humidity right now.');
      console.warn('Failed to reset simulated humidity', error);
    } finally {
      setIsBusy(false);
    }
  };

  const handleSimulateLowPressure = async () => {
    setIsBusy(true);
    setStatusMessage(null);

    const simulatedPressure = 998;

    try {
      setCurrentPressure(simulatedPressure);
      setStatusMessage(`Simulated pressure set to ${simulatedPressure} hPa.`);
    } catch (error) {
      setStatusMessage('Unable to simulate the low-pressure alert right now.');
      console.warn('Failed to simulate low pressure alert', error);
    } finally {
      setIsBusy(false);
    }
  };

  const handleResetPressureAboveThreshold = async () => {
    setIsBusy(true);
    setStatusMessage(null);

    const resetPressure = 1012;

    try {
      setCurrentPressure(resetPressure);
      setStatusMessage(`Pressure reset to ${resetPressure} hPa. You can simulate low pressure again to retrigger the alert.`);
    } catch (error) {
      setStatusMessage('Unable to reset the simulated pressure right now.');
      console.warn('Failed to reset simulated pressure', error);
    } finally {
      setIsBusy(false);
    }
  };

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.kicker}>NOTIFICATIONS</Text>
        <Text style={styles.title}>Sensor Alert Settings</Text>
        <Text style={styles.subtitle}>Status and listener wiring are ready. Action buttons will be connected in the next steps.</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Permission Status</Text>
        <Text style={styles.cardBody}>{permissionDescription}</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Notification Events</Text>
        <Text style={styles.cardBody}>Last received: {lastReceivedTitle ?? 'None yet'}</Text>
        <Text style={styles.cardBody}>Last opened: {lastOpenedTitle ?? 'None yet'}</Text>
      </View>

      <View style={styles.sectionBlock}>
        <Text style={styles.sectionLabel}>TEMPERATURE</Text>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Current Simulated Temperature</Text>
          <Text style={styles.currentTemperatureValue}>{currentTemperature.toFixed(1)}°C</Text>
          <Text style={styles.cardBody}>Use the simulate/reset buttons below to change this value for threshold testing.</Text>
        </View>

        <View style={styles.actionsGroup}>
          <Pressable
            disabled={isBusy || permissionState === 'unsupported'}
            onPress={handleSimulateHighTemperature}
            style={({ pressed }) => [
              styles.button,
              styles.buttonSecondary,
              (pressed || isBusy || permissionState === 'unsupported') && styles.buttonDisabled,
            ]}>
            <Text style={styles.buttonSecondaryText}>Simulate high temperature (27.2°C)</Text>
          </Pressable>

          <Pressable
            disabled={isBusy || permissionState === 'unsupported'}
            onPress={handleResetTemperatureBelowThreshold}
            style={({ pressed }) => [
              styles.button,
              styles.buttonSecondary,
              (pressed || isBusy || permissionState === 'unsupported') && styles.buttonDisabled,
            ]}>
            <Text style={styles.buttonSecondaryText}>Reset temperature below threshold (24.0°C)</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.sectionBlock}>
        <Text style={styles.sectionLabel}>HUMIDITY</Text>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Current Simulated Humidity</Text>
          <Text style={styles.currentTemperatureValue}>{currentHumidity.toFixed(1)}%</Text>
          <Text style={styles.cardBody}>Use the humidity buttons below to test the high-humidity alert flow.</Text>
        </View>

        <View style={styles.actionsGroup}>
          <Pressable
            disabled={isBusy || permissionState === 'unsupported'}
            onPress={handleSimulateHighHumidity}
            style={({ pressed }) => [
              styles.button,
              styles.buttonSecondary,
              (pressed || isBusy || permissionState === 'unsupported') && styles.buttonDisabled,
            ]}>
            <Text style={styles.buttonSecondaryText}>Simulate high humidity (65.0%)</Text>
          </Pressable>

          <Pressable
            disabled={isBusy || permissionState === 'unsupported'}
            onPress={handleResetHumidityBelowThreshold}
            style={({ pressed }) => [
              styles.button,
              styles.buttonSecondary,
              (pressed || isBusy || permissionState === 'unsupported') && styles.buttonDisabled,
            ]}>
            <Text style={styles.buttonSecondaryText}>Reset humidity below threshold (50.0%)</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.sectionBlock}>
        <Text style={styles.sectionLabel}>PRESSURE</Text>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Current Simulated Pressure</Text>
          <Text style={styles.currentTemperatureValue}>{currentPressure.toFixed(0)} hPa</Text>
          <Text style={styles.cardBody}>Use the pressure buttons below to test the low-pressure alert flow.</Text>
        </View>

        <View style={styles.actionsGroup}>
          <Pressable
            disabled={isBusy || permissionState === 'unsupported'}
            onPress={handleSimulateLowPressure}
            style={({ pressed }) => [
              styles.button,
              styles.buttonSecondary,
              (pressed || isBusy || permissionState === 'unsupported') && styles.buttonDisabled,
            ]}>
            <Text style={styles.buttonSecondaryText}>Simulate low pressure (998 hPa)</Text>
          </Pressable>

          <Pressable
            disabled={isBusy || permissionState === 'unsupported'}
            onPress={handleResetPressureAboveThreshold}
            style={({ pressed }) => [
              styles.button,
              styles.buttonSecondary,
              (pressed || isBusy || permissionState === 'unsupported') && styles.buttonDisabled,
            ]}>
            <Text style={styles.buttonSecondaryText}>Reset pressure above threshold (1012 hPa)</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>Expo Push Token</Text>
        <Text style={styles.cardBody}>{expoPushTokenMessage}</Text>
        {expoPushToken ? <Text style={styles.tokenValue}>{expoPushToken}</Text> : null}
      </View>

      {statusMessage ? (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Status</Text>
          <Text style={styles.cardBody}>{statusMessage}</Text>
        </View>
      ) : null}

      <View style={styles.actions}>
        {permissionState !== 'granted' ? (
          <Pressable
            disabled={isBusy || permissionState === 'unsupported'}
            onPress={handleEnableNotifications}
            style={({ pressed }) => [
              styles.button,
              styles.buttonPrimary,
              (pressed || isBusy || permissionState === 'unsupported') && styles.buttonDisabled,
            ]}>
            <Text style={styles.buttonPrimaryText}>Enable notifications</Text>
          </Pressable>
        ) : (
          <View style={[styles.button, styles.enabledBadge]}>
            <Text style={styles.enabledBadgeText}>Notifications enabled</Text>
          </View>
        )}

        <Pressable
          disabled={isBusy || permissionState === 'unsupported'}
          onPress={handleSendTestAlert}
          style={({ pressed }) => [
            styles.button,
            styles.buttonSecondary,
            (pressed || isBusy || permissionState === 'unsupported') && styles.buttonDisabled,
          ]}>
          <Text style={styles.buttonSecondaryText}>Send test alert</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0b1118',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 56,
    gap: 12,
  },
  header: {
    marginBottom: 6,
  },
  kicker: {
    color: '#7ee7d7',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.3,
    marginBottom: 8,
  },
  title: {
    color: '#eff8ff',
    fontSize: 28,
    fontWeight: '800',
    lineHeight: 32,
    marginBottom: 8,
  },
  subtitle: {
    color: '#9ab0c2',
    fontSize: 15,
    lineHeight: 22,
  },
  card: {
    backgroundColor: '#111b25',
    borderColor: 'rgba(125, 240, 220, 0.14)',
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
  },
  cardTitle: {
    color: '#eaf6ff',
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
  },
  cardBody: {
    color: '#b5c9d9',
    fontSize: 13,
    lineHeight: 18,
  },
  sectionBlock: {
    gap: 10,
  },
  sectionLabel: {
    color: '#7ee7d7',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.3,
    textTransform: 'uppercase',
    marginTop: 4,
  },
  tokenValue: {
    marginTop: 8,
    color: '#7df0dc',
    fontSize: 12,
    lineHeight: 17,
    fontFamily: 'monospace',
    flexWrap: 'wrap',
  },
  currentTemperatureValue: {
    color: '#7df0dc',
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 6,
  },
  actions: {
    marginTop: 4,
    gap: 10,
  },
  actionsGroup: {
    gap: 10,
  },
  button: {
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
    borderWidth: 1,
  },
  buttonPrimary: {
    backgroundColor: '#7df0dc',
    borderColor: '#7df0dc',
  },
  buttonSecondary: {
    backgroundColor: '#0f1922',
    borderColor: 'rgba(125, 240, 220, 0.28)',
  },
  buttonPrimaryText: {
    color: '#0b1118',
    fontWeight: '800',
    fontSize: 16,
  },
  buttonSecondaryText: {
    color: '#dffaff',
    fontWeight: '700',
    fontSize: 15,
  },
  buttonDisabled: {
    opacity: 0.55,
  },
  enabledBadge: {
    backgroundColor: 'rgba(125, 240, 220, 0.12)',
    borderColor: 'rgba(125, 240, 220, 0.32)',
  },
  enabledBadgeText: {
    color: '#dffaff',
    fontSize: 14,
    fontWeight: '700',
  },
});
