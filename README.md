# JARVIS Web Brain — fallback static

Fallback independent de un server de aplicație:

- interfața rulează static pe GitHub Pages;
- memoria este publicată numai ca AES-256-GCM ciphertext;
- cheia BRAIN este transportată în fragmentul URL și nu ajunge la server;
- OpenRouter se conectează prin OAuth PKCE și cheia rămâne în `sessionStorage`;
- căutarea semantică folosește indexul BRAIN decriptat și embeddings OpenRouter;
- răspunsurile folosesc `openrouter/free`.

## Împachetare

```powershell
node scripts/pack-brain.mjs C:\cale\brain-index.json .
```

Comanda afișează cheia privată o singură dată. Fișierele `.enc` pot fi
publicate; cheia nu trebuie comisă.

