import { Redirect, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { useAuth } from '@/hooks/use-auth';

export default function LoginScreen() {
  const router = useRouter();
  const { isAuthenticated, login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  }

  const handleLogin = () => {
    const valid = login(username.trim(), password);

    if (valid) {
      setErrorMessage('');
      router.replace('/(tabs)');
      return;
    }

    setErrorMessage('Invalid credentials. Try admin / 1234');
  };

  return (
    <View style={styles.screen}>
      <View style={styles.content}>
        <View style={styles.headerSection}>
          <Text style={styles.kicker}>HOME SENSOR</Text>
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to access your home sensor dashboard.</Text>
        </View>

        <View style={styles.formSection}>
          <View style={styles.inputBlock}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              autoCapitalize="none"
              value={username}
              onChangeText={setUsername}
              placeholder="Username"
              placeholderTextColor="#7f8e9d"
              style={styles.input}
            />
          </View>

          <View style={styles.inputBlock}>
            <Text style={styles.label}>Password</Text>
            <TextInput
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              placeholderTextColor="#7f8e9d"
              style={styles.input}
            />
          </View>

          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
        </View>

        <View style={styles.footerSection}>
          <Pressable style={styles.button} onPress={handleLogin}>
            <Text style={styles.buttonText}>Log in</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#0b1118',
  },
  content: {
    flex: 1,
    backgroundColor: '#111b25',
    paddingHorizontal: 24,
    paddingTop: 72,
    paddingBottom: 28,
  },
  headerSection: {
    flex: 0.35,
    justifyContent: 'flex-start',
  },
  formSection: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingTop: 12,
  },
  footerSection: {
    justifyContent: 'flex-end',
    paddingTop: 10,
  },
  kicker: {
    color: '#7ee7d7',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.4,
    marginBottom: 18,
  },
  title: {
    color: '#eff8ff',
    fontSize: 42,
    fontWeight: '800',
    marginBottom: 12,
    lineHeight: 48,
  },
  subtitle: {
    color: '#9ab0c2',
    fontSize: 16,
    lineHeight: 24,
    maxWidth: 360,
  },
  inputBlock: {
    marginBottom: 18,
  },
  label: {
    color: '#d4e2ef',
    fontSize: 14,
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#0c141d',
    borderColor: 'rgba(125, 240, 220, 0.18)',
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    color: '#f6fbff',
    fontSize: 17,
  },
  errorText: {
    color: '#ffb4a3',
    marginTop: 4,
    fontSize: 14,
  },
  button: {
    backgroundColor: '#7df0dc',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    width: '100%',
  },
  buttonText: {
    color: '#0b1118',
    fontWeight: '800',
    fontSize: 18,
  },
});
