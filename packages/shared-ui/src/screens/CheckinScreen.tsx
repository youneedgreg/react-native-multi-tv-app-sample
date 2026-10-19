import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { DefaultFocus, SpatialNavigationNode, SpatialNavigationRoot } from 'react-tv-space-navigation';
import { useIsFocused, useNavigation, type RouteProp, useRoute } from '@react-navigation/native';
import FocusablePressable from '../components/FocusablePressable';
import { scaledPixels } from '../hooks/useScale';
import { colors, safeZones } from '../theme';
import type { RootStackParamList } from '../navigation/types';
import { answerCheckin, type Answer } from '../jirani/client';
import { jiraniConfig } from '../jirani/config';
import { strings } from '../jirani/strings';
import { useCheckinShowing } from '../jirani/CheckinWatcher';

/**
 * Jirani's check-in on the TV: one question in large type and two buttons the
 * remote reaches with left/right and OK. "I'm OK" closes the alert; "Call Amina"
 * closes it and asks the family to phone her. Nothing here decides anything:
 * the answer goes to Jirani's answer_checkin tool, which does.
 */
export default function CheckinScreen() {
  const { params } = useRoute<RouteProp<RootStackParamList, 'Checkin'>>();
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  const { setShowing } = useCheckinShowing();
  const t = strings[jiraniConfig.lang];
  const family = jiraniConfig.familyName;
  const [state, setState] = useState<{ step: 'ask' | 'sending' | 'done' | 'failed'; reply?: string }>({ step: 'ask' });

  useEffect(() => {
    setShowing(true);
    return () => setShowing(false);
  }, [setShowing]);

  // After an answer, go back to what she was watching.
  useEffect(() => {
    if (state.step !== 'done') return;
    const timer = setTimeout(() => navigation.canGoBack() && navigation.goBack(), 8000);
    return () => clearTimeout(timer);
  }, [state.step, navigation]);

  const answer = async (a: Answer) => {
    setState({ step: 'sending' });
    try {
      const jiraniReply = await answerCheckin(a);
      setState({ step: 'done', reply: t.reply(params.residentName, family, a, jiraniReply) });
    } catch {
      setState({ step: 'failed' });
    }
  };

  return (
    <SpatialNavigationRoot isActive={isFocused}>
      <View style={styles.container}>
        <View style={styles.card}>
          <Text style={styles.title}>{t.title}</Text>
          {state.step === 'done' ? (
            <>
              <Text style={styles.message}>{state.reply}</Text>
              <Text style={styles.hint}>{t.back}</Text>
            </>
          ) : (
            <>
              <Text style={styles.message}>{t.ask(params.residentName, params.message)}</Text>
              {state.step === 'sending' ? (
                <Text style={styles.hint}>{t.sending}</Text>
              ) : (
                <SpatialNavigationNode orientation="horizontal">
                  <View style={styles.buttons}>
                    <DefaultFocus>
                      <FocusablePressable
                        text={t.ok}
                        onSelect={() => void answer('ok')}
                        style={styles.button}
                        textStyle={styles.buttonText}
                      />
                    </DefaultFocus>
                    <FocusablePressable
                      text={t.call(family)}
                      onSelect={() => void answer('call_family')}
                      style={styles.button}
                      textStyle={styles.buttonText}
                    />
                  </View>
                </SpatialNavigationNode>
              )}
              {state.step === 'failed' && <Text style={styles.error}>{t.failed}</Text>}
            </>
          )}
        </View>
        <Text style={styles.footer}>{t.footer}</Text>
      </View>
    </SpatialNavigationRoot>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: scaledPixels(safeZones.actionSafe.horizontal),
    paddingVertical: scaledPixels(safeZones.actionSafe.vertical),
  },
  card: {
    width: '80%',
    backgroundColor: colors.backgroundElevated,
    borderRadius: scaledPixels(24),
    borderWidth: scaledPixels(2),
    borderColor: colors.border,
    paddingVertical: scaledPixels(64),
    paddingHorizontal: scaledPixels(80),
    alignItems: 'center',
  },
  title: {
    color: colors.textSecondary,
    fontSize: scaledPixels(32),
    fontWeight: '600',
    marginBottom: scaledPixels(24),
    textAlign: 'center',
  },
  message: {
    color: colors.text,
    fontSize: scaledPixels(52),
    fontWeight: 'bold',
    lineHeight: scaledPixels(68),
    textAlign: 'center',
    marginBottom: scaledPixels(56),
  },
  buttons: {
    flexDirection: 'row',
    gap: scaledPixels(48),
    justifyContent: 'center',
  },
  button: {
    minWidth: scaledPixels(420),
    minHeight: scaledPixels(120),
    paddingHorizontal: scaledPixels(48),
    borderRadius: scaledPixels(16),
    alignSelf: 'center',
  },
  buttonText: {
    fontSize: scaledPixels(44),
  },
  hint: {
    color: colors.textSecondary,
    fontSize: scaledPixels(32),
    textAlign: 'center',
  },
  error: {
    color: colors.notification,
    fontSize: scaledPixels(32),
    marginTop: scaledPixels(32),
    textAlign: 'center',
  },
  footer: {
    color: colors.textTertiary,
    fontSize: scaledPixels(24),
    marginTop: scaledPixels(32),
  },
});
