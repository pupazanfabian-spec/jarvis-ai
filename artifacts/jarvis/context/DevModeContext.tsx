
// DevModeContext — stare globală pentru modul dezvoltator

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { getActiveProject, initProjectTables, type Project } from '@/engine/projectMemory';

interface DevModeContextType {
  isDevMode: boolean;
  toggleDevMode: () => void;
  activeProject: Project | null;
  refreshProject: () => Promise<void>;
  setActiveProjectState: (p: Project | null) => void;
}

const DevModeContext = createContext<DevModeContextType | null>(null);

export function DevModeProvider({ children }: { children: React.ReactNode }) {
  const [isDevMode, setIsDevMode] = useState(false);
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    initProjectTables().then(() => {
      getActiveProject().then(p => {
        if (p) setActiveProject(p);
      }).catch(() => {});
    }).catch(() => {});
  }, []);

  const toggleDevMode = useCallback(() => {
    setIsDevMode(prev => !prev);
  }, []);

  const refreshProject = useCallback(async () => {
    try {
      const p = await getActiveProject();
      setActiveProject(p);
    } catch {}
  }, []);

  const setActiveProjectState = useCallback((p: Project | null) => {
    setActiveProject(p);
  }, []);

  return (
    <DevModeContext.Provider value={{
      isDevMode, toggleDevMode, activeProject, refreshProject, setActiveProjectState,
    }}>
      {children}
    </DevModeContext.Provider>
  );
}

export function useDevMode() {
  const ctx = useContext(DevModeContext);
  if (!ctx) throw new Error('useDevMode must be used within DevModeProvider');
  return ctx;
}
