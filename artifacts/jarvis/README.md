# Jarvis AI — Asistent Personal Inteligent

Aplicație mobilă (Android/iOS) de asistent AI personal, complet în limba română.

## Funcționalități

- **Brain v6 Engine** — motor AI cu 270+ topicuri de cunoaștere în română
- **4 Provideri AI Cloud** — Gemini, ChatGPT, Groq (gratuit), OpenRouter (gratuit)
- **Căutare web** — răspunsuri actualizate cu sinteză automată
- **Memorie persistentă** — SQLite + JSON, învață și reține fapte între sesiuni
- **Mod dezvoltator** — generare cod, sandbox, proiecte
- **PIN Lock** — protecție cu cod PIN
- **Syntax Highlighting** — Python, HTML, CSS, JavaScript
- **Funcționare offline** — cunoaștere locală fără internet
- **100% standalone** — fără server intermediar, apeluri directe de pe telefon

## Provideri AI Suportați

| Provider | Model | Cost | Cheie API |
|----------|-------|------|-----------|
| **Gemini** | Gemini 2.0 Flash | Gratuit | [aistudio.google.com](https://aistudio.google.com) |
| **ChatGPT** | GPT-4.1 mini | Cu credit | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) |
| **Groq** | Llama 3.3 70B / Mixtral | **Gratuit** | [console.groq.com/keys](https://console.groq.com/keys) |
| **OpenRouter** | Llama / Mistral / Gemma | **Gratuit** | [openrouter.ai/keys](https://openrouter.ai/keys) |

## Instalare

### APK Android (cel mai simplu)
1. Descarcă APK-ul din secțiunea [Releases](../../releases) sau din GitHub Actions
2. Transferă pe telefon și instalează (permite "Surse necunoscute")
3. Deschide Jarvis, mergi la meniul ⋮ → Furnizor AI → alege un provider gratuit

### Din cod sursă
```bash
# Clonează repository-ul
git clone https://github.com/pupazanfabian-spec/jarvis-01.git
cd jarvis-01

# Instalează dependențele
npm install

# Pornește în mod dezvoltare
npx expo start
```

### Expo Go (pentru testare)
1. Instalează **Expo Go** din Play Store / App Store
2. Rulează `npx expo start` în terminal
3. Scanează QR-ul cu Expo Go

## Configurare Cheie API

1. Deschide Jarvis pe telefon
2. Apasă meniul ⋮ (trei puncte) din colțul dreapta sus
3. Selectează **Furnizor AI**
4. Alege un provider (recomandat: **Groq** — gratuit și ultra-rapid)
5. Lipește cheia API și apasă **Testează**
6. Dacă testul trece, providerul se activează automat

## Structura Proiectului

```
├── app/                    # Ecrane și navigare (Expo Router)
├── components/             # Componente React Native
│   ├── AIProviderModal.tsx  # Modal configurare provideri AI
│   ├── ChatBubble.tsx       # Bule de chat WhatsApp-style
│   ├── QuickActions.tsx     # Acțiuni rapide cu animații
│   └── ...
├── context/                # React Context providers
│   ├── AIProviderContext.tsx # Gestiune provideri AI
│   ├── BrainContext.tsx     # Motor principal Brain v6
│   └── ...
├── engine/                 # Motorul AI Jarvis
│   ├── aiProviders.ts       # Apeluri Gemini/ChatGPT/Groq/OpenRouter
│   ├── brain.ts             # Brain v6 — procesare mesaje
│   ├── knowledge.ts         # 270+ topicuri cunoaștere
│   ├── memory.ts            # Memorie JSON persistentă
│   ├── webSearch.ts         # Căutare online
│   └── ...
├── constants/              # Culori, configurări
└── assets/                 # Imagini, fonturi
```

## Tehnologii

- **React Native** + **Expo** (SDK 53)
- **TypeScript**
- **SQLite** (expo-sqlite) — persistență locală
- **SecureStore** — stocare securizată chei API
- **Expo Router** — navigare

## Autor

Fabian Pupăzan — [@pupazanfabian-spec](https://github.com/pupazanfabian-spec)

## Licență

MIT
