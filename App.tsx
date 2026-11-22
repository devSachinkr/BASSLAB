import React, { useState } from 'react';

import {
  View,
  Text,
  ScrollView,
  Pressable,
  StyleSheet,
  StatusBar,
  NativeModules,
  PermissionsAndroid,
  Platform,
} from 'react-native';
const C = {
  bg: '#080B12',
  card: '#121925',
  border: '#253044',
  purple: '#A855F7',
  cyan: '#22D3EE',
  white: '#F8FAFC',
  muted: '#8491A5',
};

function DeviceCard() {
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const earbuds = devices.find(device =>
    device.name?.toLowerCase().includes('ntw11e') ||
    device.name?.toLowerCase().includes('dubstep')
  );

  const connected = !!earbuds;

const scanBluetooth = async () => {
  console.log('SCAN BUTTON CLICKED');

  try {
    setLoading(true);
    setError('');

    if (Platform.OS === 'android' && Platform.Version >= 31) {
      const permission = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT
      );

      console.log('Bluetooth permission:', permission);

      if (permission !== PermissionsAndroid.RESULTS.GRANTED) {
        setError('Bluetooth permission denied');
        return;
      }
    }

    console.log('Native module:', NativeModules.BluetoothAudio);

    const BluetoothAudio = NativeModules.BluetoothAudio;

    const result = await BluetoothAudio.getConnectedAudioDevices();

    console.log('Bluetooth devices:', result);

    setDevices(result || []);

  } catch (err: any) {
    console.log('Bluetooth ERROR:', err);
    setError(String(err?.message || err));
  } finally {
    setLoading(false);
  }
};

  return (
    <View style={styles.deviceCard}>
      <View style={styles.deviceIcon}>
        <Text style={{ fontSize: 27 }}>🎧</Text>
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.deviceName}>Dubstep NTW11E</Text>

        <View style={styles.statusRow}>
          <View
            style={[
              styles.statusDot,
              connected && styles.greenDot,
            ]}
          />

          <Text
            style={[
              styles.deviceStatus,
              connected && { color: '#34D399' },
            ]}
          >
            {loading
              ? 'Scanning...'
              : connected
                ? 'Connected'
                : 'Not connected'}
          </Text>
        </View>

        {error ? (
          <Text style={{ color: '#F87171', fontSize: 11, marginTop: 4 }}>
            {error}
          </Text>
        ) : null}
      </View>

      <Pressable
        onPress={scanBluetooth}
        disabled={loading}
        style={styles.connectButton}
      >
        <Text style={styles.connectText}>
          {loading ? 'SCANNING' : 'SCAN'}
        </Text>
      </Pressable>
    </View>
  );
}

function Visualizer() {
  const bars = [25, 40, 65, 90, 60, 80, 100, 70, 45, 85, 60, 35, 75, 50, 95, 45, 65, 30];

  return (
    <View style={styles.visualizerCard}>
      <View style={styles.visualizerTop}>
        <View>
          <Text style={styles.smallLabel}>AUDIO VISUALIZER</Text>
          <Text style={styles.visualizerTitle}>Feel the sound</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>BASSLAB</Text>
        </View>
      </View>

      <View style={styles.waveContainer}>
        {bars.map((height, index) => (
          <View
            key={index}
            style={[
              styles.waveBar,
              {
                height,
                backgroundColor: index < 9 ? C.purple : C.cyan,
              },
            ]}
          />
        ))}
      </View>

      <View style={styles.waveLabels}>
        <Text style={styles.waveLabel}>LOW</Text>
        <Text style={styles.waveLabel}>MID</Text>
        <Text style={styles.waveLabel}>HIGH</Text>
      </View>
    </View>
  );
}

function Presets() {
  const [selected, setSelected] = useState('Balanced');
  const [loading, setLoading] = useState(false);

  const presets = [
    { name: 'Balanced', emoji: '🎵' },
    { name: 'Basshead', emoji: '🔊' },
    { name: 'EDM', emoji: '⚡' },
    { name: 'Dubstep', emoji: '🔥' },
    { name: 'Gaming', emoji: '🎮' },
  ];

  const applyPreset = async (name: string) => {
    if (loading) return;

    try {
      setLoading(true);

      await NativeModules.AudioEffects.setPreset(name);

      setSelected(name);

      console.log(`Preset applied: ${name}`);
    } catch (error) {
      console.error('Preset error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeading}>
        <Text style={styles.sectionTitle}>Presets</Text>
        <Text style={styles.customLabel}>
          {selected.toUpperCase()}
        </Text>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {presets.map(item => {
          const active = selected === item.name;

          return (
            <Pressable
              key={item.name}
              disabled={loading}
              onPress={() => applyPreset(item.name)}
              style={[
                styles.presetCard,
                active && styles.presetSelected,
              ]}
            >
              <Text style={styles.presetEmoji}>
                {item.emoji}
              </Text>

              <Text
                style={[
                  styles.presetName,
                  active && styles.presetActiveName,
                ]}
              >
                {item.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
function BassBoost() {
  const [enabled, setEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeSessions, setActiveSessions] = useState(0);

  const toggleBassBoost = async () => {
    if (loading) return;

    try {
      setLoading(true);

      const BluetoothAudio = NativeModules.BluetoothAudio;
      const AudioEffects = NativeModules.AudioEffects;

      if (!BluetoothAudio || !AudioEffects) {
        throw new Error('Native modules unavailable');
      }

      if (!enabled) {
        // Check connected earbuds
        const devices =
          await BluetoothAudio.getConnectedAudioDevices();

        const earbudsConnected = devices?.some(
          (device: any) =>
            device.name?.toLowerCase().includes('ntw11e') ||
            device.name?.toLowerCase().includes('dubstep')
        );

        if (!earbudsConnected) {
          console.log('Dubstep earbuds not connected');
          return;
        }

        // Initialize engine
        await AudioEffects.initialize();

        // Set bass strength
        await AudioEffects.setBass(750);

        // Check audio sessions
        const status = await AudioEffects.getStatus();

        setActiveSessions(status.activeSessions || 0);
        setEnabled(true);

        console.log('Bass enabled');
        console.log('Active sessions:', status.activeSessions);
        console.log('EQ bands:', status.bands);

      } else {
        // Turn bass off without destroying sessions
        await AudioEffects.setBass(0);

        const status = await AudioEffects.getStatus();

        setActiveSessions(status.activeSessions || 0);
        setEnabled(false);

        console.log('Bass disabled');
      }

    } catch (error: any) {
      console.log(
        'BassBoost error:',
        error?.message || error
      );

      setEnabled(false);

    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.enhancementCard}>
      <View style={styles.enhancementLeft}>
        <View style={styles.enhancementIcon}>
          <Text style={{ fontSize: 22 }}>🔊</Text>
        </View>

        <View>
          <Text style={styles.enhancementTitle}>
            Bass Boost
          </Text>

          <Text style={styles.enhancementSubtitle}>
            {!enabled
              ? 'Enhanced low frequencies'
              : activeSessions > 0
              ? `Active • ${activeSessions} audio session(s)`
              : 'Enabled • Waiting for audio session'}
          </Text>
        </View>
      </View>

      <Pressable
        onPress={toggleBassBoost}
        disabled={loading}
        style={[
          styles.toggle,
          enabled && styles.toggleOn,
        ]}
      >
        <View
          style={[
            styles.toggleThumb,
            enabled && styles.thumbOn,
          ]}
        />
      </Pressable>
    </View>
  );
}
function AudioControl({
  title,
  subtitle,
  emoji,
  color,
}: {
  title: string;
  subtitle: string;
  emoji: string;
  color: string;
}) {
  const [value, setValue] = useState(title === 'Bass' ? 75 : 50);

  const adjust = async (amount: number) => {
    const newValue = Math.max(0, Math.min(100, value + amount));

    setValue(newValue);

    // Connect Bass control to native Android audio engine
    if (title === 'Bass') {
      try {
        await NativeModules.AudioEffects.setBass(newValue * 10);
        console.log('Bass strength updated:', newValue * 10);
      } catch (error) {
        console.log('Bass slider error:', error);
      }
    }
  };

  return (
    <View style={styles.audioCard}>
      <View style={styles.audioTop}>
        <View style={styles.audioLeft}>
          <View style={styles.audioIcon}>
            <Text style={{ fontSize: 21 }}>{emoji}</Text>
          </View>

          <View>
            <Text style={styles.audioTitle}>{title}</Text>
            <Text style={styles.audioSubtitle}>{subtitle}</Text>
          </View>
        </View>

        <Text style={[styles.audioValue, { color }]}>{value}%</Text>
      </View>

      <View style={styles.progressBackground}>
        <View
          style={[
            styles.progressBar,
            {
              width: `${value}%`,
              backgroundColor: color,
            },
          ]}
        />
      </View>

      <View style={styles.audioBottom}>
        <Pressable
          style={styles.smallButton}
          onPress={() => adjust(-5)}
        >
          <Text style={styles.smallButtonText}>−</Text>
        </Pressable>

        <Text style={styles.audioHint}>Adjust level</Text>

        <Pressable
          style={styles.smallButton}
          onPress={() => adjust(5)}
        >
          <Text style={styles.smallButtonText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}
function Equalizer() {
  const [values, setValues] = useState([50, 50, 50, 50, 50, 50, 50, 50, 50, 50]);

  const frequencies = [
    '32', '64', '125', '250', '500',
    '1k', '2k', '4k', '8k', '16k',
  ];

  const adjustAll = (amount: number) => {
    setValues(previous => previous.map(v => Math.max(0, Math.min(100, v + amount))));
  };

  return (
    <View style={styles.eqCard}>
      <View style={styles.eqContainer}>
        {values.map((value, index) => (
          <View key={index} style={styles.eqColumn}>
            <Text style={styles.eqValue}>
              {Math.round((value - 50) / 5) > 0
                ? `+${Math.round((value - 50) / 5)}`
                : Math.round((value - 50) / 5)}
            </Text>

            <View style={styles.eqTrack}>
              <View style={styles.eqCenterLine} />
              <View style={[styles.eqBar, { height: `${value}%` }]} />
            </View>

            <Text style={styles.eqFrequency}>{frequencies[index]}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.eqInfo}>10 frequency bands</Text>

      <View style={styles.eqControls}>
        <Pressable style={styles.eqAction} onPress={() => adjustAll(-5)}>
          <Text style={styles.eqActionText}>−</Text>
        </Pressable>

        <Text style={styles.eqActionLabel}>Adjust all bands</Text>

        <Pressable style={styles.eqAction} onPress={() => adjustAll(5)}>
          <Text style={styles.eqActionText}>+</Text>
        </Pressable>
      </View>
    </View>
  );
}

function App() {
  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>

        {/* HEADER */}
        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>
              BASS<Text style={styles.logoAccent}>LAB</Text>
            </Text>
            <Text style={styles.tagline}>PERSONAL AUDIO CONTROL</Text>
          </View>

          <Pressable style={styles.headerButton}>
            <Text style={styles.headerButtonText}>⚙</Text>
          </Pressable>
        </View>

        {/* DEVICE */}
        <DeviceCard />

        {/* VISUALIZER */}
        <Visualizer />

        {/* PRESETS */}
        <Presets />

        {/* ENHANCEMENTS */}
        <View style={styles.section}>
          <View style={styles.sectionHeading}>
            <Text style={styles.sectionTitle}>Enhancements</Text>
          </View>

          <BassBoost />

          <AudioControl
            title="Bass"
            subtitle="Punch & depth"
            emoji="〰️"
            color={C.purple}
          />

          <AudioControl
            title="Vocal Clarity"
            subtitle="Clearer voices"
            emoji="🎙️"
            color={C.cyan}
          />

          <AudioControl
            title="Treble"
            subtitle="Brightness & detail"
            emoji="✨"
            color="#F59E0B"
          />
        </View>

        {/* EQ */}
        <View style={styles.section}>
          <View style={styles.sectionHeading}>
            <Text style={styles.sectionTitle}>10-Band EQ</Text>
            <Text style={styles.customLabel}>GRAPHIC EQ</Text>
          </View>

          <Equalizer />
        </View>

        {/* FOOTER */}
        <View style={styles.footer}>
          <Text style={styles.footerLogo}>BASSLAB</Text>
          <Text style={styles.footerSub}>YOUR SOUND. YOUR RULES.</Text>
          <Text style={styles.disclaimer}>Audio engine not connected yet</Text>
        </View>

      </ScrollView>
    </View>
  );
}

export default App;

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: C.bg,
  },

  scrollContent: {
    paddingBottom: 35,
  },

  header: {
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  logo: {
    color: C.white,
    fontSize: 29,
    fontWeight: '900',
    letterSpacing: 1,
  },

  logoAccent: {
    color: C.purple,
  },

  tagline: {
    color: C.muted,
    fontSize: 9,
    letterSpacing: 2,
    marginTop: 5,
  },

  headerButton: {
    width: 45,
    height: 45,
    borderRadius: 14,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  headerButtonText: {
    fontSize: 22,
    color: C.white,
  },

  deviceCard: {
    marginHorizontal: 20,
    padding: 15,
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    borderRadius: 19,
    flexDirection: 'row',
    alignItems: 'center',
  },

  deviceIcon: {
    width: 52,
    height: 52,
    borderRadius: 15,
    backgroundColor: '#20283A',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 13,
  },

  deviceName: {
    color: C.white,
    fontSize: 14,
    fontWeight: '700',
  },

  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 7,
  },

  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 5,
    backgroundColor: '#F59E0B',
    marginRight: 7,
  },

  greenDot: {
    backgroundColor: '#34D399',
  },

  deviceStatus: {
    color: C.muted,
    fontSize: 11,
  },

  connectButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: C.purple,
  },

  disconnectButton: {
    backgroundColor: '#263449',
  },

  connectText: {
    color: C.white,
    fontSize: 10,
    fontWeight: '800',
  },

  visualizerCard: {
    marginHorizontal: 20,
    marginTop: 20,
    padding: 18,
    borderRadius: 22,
    backgroundColor: '#141622',
    borderWidth: 1,
    borderColor: '#302544',
  },

  visualizerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  smallLabel: {
    color: C.muted,
    fontSize: 9,
    letterSpacing: 1.5,
  },

  visualizerTitle: {
    color: C.white,
    fontSize: 18,
    fontWeight: '800',
    marginTop: 7,
  },

  badge: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: '#29203D',
  },

  badgeText: {
    color: '#C084FC',
    fontSize: 10,
    fontWeight: '800',
  },

  waveContainer: {
    height: 115,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 16,
  },

  waveBar: {
    width: 6,
    borderRadius: 5,
  },

  waveLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },

  waveLabel: {
    color: C.muted,
    fontSize: 9,
  },

  section: {
    marginTop: 27,
  },

  sectionHeading: {
    paddingHorizontal: 22,
    marginBottom: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  sectionTitle: {
    color: C.white,
    fontSize: 19,
    fontWeight: '800',
  },

  customLabel: {
    color: C.purple,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },

  presetCard: {
    width: 100,
    height: 90,
    marginLeft: 20,
    backgroundColor: C.card,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    justifyContent: 'center',
  },

  presetSelected: {
    backgroundColor: '#281B3B',
    borderColor: C.purple,
  },

  presetEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },

  presetName: {
    color: C.muted,
    fontSize: 11,
    fontWeight: '700',
  },

  presetActiveName: {
    color: '#D8B4FE',
  },

  enhancementCard: {
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    backgroundColor: C.card,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: C.border,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  enhancementLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  enhancementIcon: {
    width: 46,
    height: 46,
    backgroundColor: '#29213D',
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },

  enhancementTitle: {
    color: C.white,
    fontSize: 14,
    fontWeight: '700',
  },

  enhancementSubtitle: {
    color: C.muted,
    fontSize: 10,
    marginTop: 5,
  },

  toggle: {
    width: 50,
    height: 29,
    borderRadius: 20,
    backgroundColor: '#334155',
    padding: 3,
    justifyContent: 'center',
  },

  toggleOn: {
    backgroundColor: C.purple,
  },

  toggleThumb: {
    width: 23,
    height: 23,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
  },

  thumbOn: {
    alignSelf: 'flex-end',
  },

  audioCard: {
    marginHorizontal: 20,
    marginBottom: 12,
    padding: 16,
    backgroundColor: C.card,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: C.border,
  },

  audioTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  audioLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  audioIcon: {
    width: 43,
    height: 43,
    borderRadius: 12,
    backgroundColor: '#222B3D',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 11,
  },

  audioTitle: {
    color: C.white,
    fontSize: 14,
    fontWeight: '700',
  },

  audioSubtitle: {
    color: C.muted,
    fontSize: 10,
    marginTop: 4,
  },

  audioValue: {
    fontSize: 18,
    fontWeight: '900',
  },

  progressBackground: {
    height: 6,
    backgroundColor: '#293347',
    borderRadius: 5,
    overflow: 'hidden',
    marginTop: 16,
  },

  progressBar: {
    height: 6,
    borderRadius: 5,
  },

  audioBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },

  smallButton: {
    width: 33,
    height: 33,
    backgroundColor: '#253044',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },

  smallButtonText: {
    color: C.white,
    fontSize: 22,
    fontWeight: '700',
  },

  audioHint: {
    color: C.muted,
    fontSize: 10,
  },

  eqCard: {
    marginHorizontal: 20,
    padding: 15,
    backgroundColor: C.card,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: C.border,
  },

  eqContainer: {
    height: 165,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },

  eqColumn: {
    flex: 1,
    alignItems: 'center',
  },

  eqValue: {
    color: '#A78BFA',
    fontSize: 8,
    marginBottom: 6,
  },

  eqTrack: {
    height: 115,
    width: 11,
    borderRadius: 8,
    backgroundColor: '#283246',
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },

  eqCenterLine: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: '#64748B',
  },

  eqBar: {
    width: '100%',
    backgroundColor: C.purple,
    borderRadius: 8,
  },

  eqFrequency: {
    color: C.muted,
    fontSize: 7,
    marginTop: 7,
  },

  eqInfo: {
    color: C.muted,
    fontSize: 10,
    textAlign: 'center',
    marginTop: 16,
  },

  eqControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
  },

  eqAction: {
    width: 35,
    height: 35,
    borderRadius: 10,
    backgroundColor: '#263044',
    justifyContent: 'center',
    alignItems: 'center',
  },

  eqActionText: {
    color: C.white,
    fontSize: 23,
  },

  eqActionLabel: {
    color: C.muted,
    fontSize: 10,
  },

  footer: {
    alignItems: 'center',
    paddingTop: 35,
    paddingBottom: 15,
  },

  footerLogo: {
    color: C.purple,
    fontSize: 17,
    fontWeight: '900',
    letterSpacing: 3,
  },

  footerSub: {
    color: C.muted,
    fontSize: 9,
    letterSpacing: 2,
    marginTop: 7,
  },

  disclaimer: {
    color: '#475569',
    fontSize: 9,
    marginTop: 15,
  },
});
