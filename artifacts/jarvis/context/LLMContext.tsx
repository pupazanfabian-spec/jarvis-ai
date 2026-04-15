
// Context LLM — gestionează ciclul de viață al modelului Phi-3 Mini
// Detectează automat dacă rulăm în Expo Go (fără LLM) sau native build (cu LLM)

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  isLlamaAvailable, isModelDownloaded, loadModel, isModelLoaded,
  downloadModel, generateLLMResponse, LLMOptions, MODEL_CONFIG,
} from '@/engine/llm';

export type LLMStatus =
  | 'unavailable'    // Expo Go — llama.rn nu e instalat
  | 'not_downloaded' // Build nativ, dar modelul nu e descărcat
  | 'downloading'    // Descărcare în curs
  | 'loading'        // Model descărcat, se încarcă în RAM
  | 'ready'          // Gata de utilizare
  | 'error';         // Eroare

interface LLMContextType {
  status: LLMStatus;
  downloadProgress: number;    // 0-1
  downloadedMB: number;
  errorMessage: string;
  startDownload: () => Promise<void>;
  generate: (message: string, options?: LLMOptions) => Promise<string | null>;
  skipModel: () => void;       // Utilizatorul poate sări peste model
  skipped: boolean;
}

const LLMContext = createContext<LLMContextType | null>(null);

export function LLMProvider({ children }: { children: React.ReactNode }) {
  const [status, setStatus] = useState<LLMStatus>('unavailable');
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [downloadedMB, setDownloadedMB] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');
  const [skipped, setSkipped] = useState(false);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    (async () => {
      // Dacă nu e disponibil (Expo Go) — se folosește doar creierul clasic
      if (!isLlamaAvailable) {
        setStatus('unavailable');
        return;
      }

      // Verifică dacă modelul e deja descărcat
      const downloaded = await isModelDownloaded();
      if (!downloaded) {
        setStatus('not_downloaded');
        return;
      }

      // Modelul există — încearcă să îl încarce
      setStatus('loading');
      const loaded = await loadModel();
      setStatus(loaded ? 'ready' : 'error');
      if (!loaded) setErrorMessage('Nu am putut încărca modelul. Încearcă să îl descarci din nou.');
    })();
  }, []);

  const startDownload = useCallback(async () => {
    setStatus('downloading');
    setDownloadProgress(0);
    setErrorMessage('');

    await downloadModel(
      (progress, mb) => {
        setDownloadProgress(progress);
        setDownloadedMB(mb);
      },
      async () => {
        // Download complet — încarcă modelul
        setStatus('loading');
        const loaded = await loadModel();
        setStatus(loaded ? 'ready' : 'error');
        if (!loaded) setErrorMessage('Descărcare reușită dar modelul nu a putut fi încărcat.');
      },
      (error) => {
        setStatus('error');
        setErrorMessage(error);
      },
    );
  }, []);

  const generate = useCallback(async (
    message: string,
    options?: LLMOptions,
  ): Promise<string | null> => {
    if (status !== 'ready' || !isModelLoaded()) return null;
    return generateLLMResponse(message, options);
  }, [status]);

  const skipModel = useCallback(() => {
    setSkipped(true);
  }, []);

  return (
    <LLMContext.Provider value={{
      status, downloadProgress, downloadedMB, errorMessage,
      startDownload, generate, skipModel, skipped,
    }}>
      {children}
    </LLMContext.Provider>
  );
}

export function useLLM() {
  const ctx = useContext(LLMContext);
  if (!ctx) throw new Error('useLLM must be used within LLMProvider');
  return ctx;
}
