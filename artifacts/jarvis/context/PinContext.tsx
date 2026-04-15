
import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PIN_KEY = '@jarvis_pin_v1';

interface PinContextType {
  isLocked: boolean;
  hasPin: boolean;
  pinLoaded: boolean;
  unlock: (pin: string) => boolean;
  setPin: (pin: string) => Promise<void>;
  removePin: () => Promise<void>;
  lock: () => void;
}

const PinContext = createContext<PinContextType | null>(null);

export function PinProvider({ children }: { children: React.ReactNode }) {
  const [storedPin, setStoredPin] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [pinLoaded, setPinLoaded] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(PIN_KEY);
        if (saved) {
          setStoredPin(saved);
          setIsLocked(true);
        }
      } catch {}
      setPinLoaded(true);
    })();
  }, []);

  const unlock = useCallback((pin: string): boolean => {
    if (pin === storedPin) {
      setIsLocked(false);
      return true;
    }
    return false;
  }, [storedPin]);

  const setPin = useCallback(async (pin: string) => {
    await AsyncStorage.setItem(PIN_KEY, pin);
    setStoredPin(pin);
    setIsLocked(false);
  }, []);

  const removePin = useCallback(async () => {
    await AsyncStorage.removeItem(PIN_KEY);
    setStoredPin(null);
    setIsLocked(false);
  }, []);

  const lock = useCallback(() => {
    if (storedPin) setIsLocked(true);
  }, [storedPin]);

  return (
    <PinContext.Provider value={{
      isLocked,
      hasPin: !!storedPin,
      pinLoaded,
      unlock,
      setPin,
      removePin,
      lock,
    }}>
      {children}
    </PinContext.Provider>
  );
}

export function usePin() {
  const ctx = useContext(PinContext);
  if (!ctx) throw new Error('usePin must be used within PinProvider');
  return ctx;
}
