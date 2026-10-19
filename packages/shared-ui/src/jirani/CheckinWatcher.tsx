import React, { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/types';
import { findOpenCheckin } from './client';
import { jiraniConfig } from './config';

/** Whether the check-in card is on screen, so the drawer stops taking remote presses. */
const CheckinContext = createContext<{ showing: boolean; setShowing: (v: boolean) => void }>({
  showing: false,
  setShowing: () => {},
});

export const CheckinProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [showing, setShowing] = useState(false);
  const value = useMemo(() => ({ showing, setShowing }), [showing]);
  return <CheckinContext.Provider value={value}>{children}</CheckinContext.Provider>;
};

export const useCheckinShowing = () => useContext(CheckinContext);

/**
 * Asks Jirani every few seconds whether it has asked her a question, and puts the
 * check-in card over whatever is on screen when it has. Each check-in shows once;
 * Back dismisses it, and the ladder carries on as if she hadn't answered.
 */
export function CheckinWatcher() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const shown = useRef(new Set<string>());

  useEffect(() => {
    let stopped = false;
    const look = async () => {
      try {
        const c = await findOpenCheckin();
        if (!stopped && c && !shown.current.has(c.id)) {
          shown.current.add(c.id);
          navigation.navigate('Checkin', c);
        }
      } catch {
        // Jirani unreachable: try again next time, never interrupt the TV with an error.
      }
    };
    void look();
    const timer = setInterval(look, jiraniConfig.pollSeconds * 1000);
    return () => {
      stopped = true;
      clearInterval(timer);
    };
  }, [navigation]);

  return null;
}
