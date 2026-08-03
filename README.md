# Pathway Trainer

Uno strumento di allenamento **con IA** per la selezione del **Wizz Air Pathway
Programme** gestito con **Urbe Aero**. Ricrea ogni componente della selezione —
i due test online e la giornata in presenza — e usa un modello linguistico per:

- **generare i quiz** (fisica, matematica, inglese, tecnico ATPL) freschi ogni
  volta, **ancorati al programma reale** del PDF di selezione;
- gestire lo **Stage 3 come una chat di gruppo dal vivo**: discuti con tre
  compagni simulati (uno che domina, una silenziosa, uno collaborativo) e un
  facilitatore, poi un **assessor IA valuta le tue competenze CRM**.

Senza chiave API l'app funziona comunque: i quiz arrivano dai banchi interni
(anch'essi derivati dal PDF) e la chat di gruppo diventa un'autovalutazione CRM.

> **Avvertenza.** Progetto indipendente, senza alcun legame con Wizz Air, Urbe
> Aero o TestAir360. Gli esercizi sono ricostruzioni originali basate su
> descrizioni pubbliche dei formati, non riproduzioni del test reale.

---

## Stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4**, font self-hosted (Cormorant + Jost)
- **Zustand** per lo stato locale, dati salvati solo nel browser
- Backend: **route API Next** che fanno da proxy verso il modello (la chiave
  resta segreta sul server); adapter **provider-agnostico** (Anthropic o OpenAI)
- Deploy: **Vercel**

```
src/
  app/            Next.js (layout, page shell, api/*)
    api/quiz          POST → quiz generati (IA) o dai banchi (fallback)
    api/group-chat    POST → chat di gruppo (streaming) + valutazione CRM
    api/ai-status     GET  → indica se l'IA è attiva (senza esporre la chiave)
  server/         adapter IA, grounding sul programma, prompt CRM (server only)
  shell/          App + Layout (client SPA, react-router)
  screens/        home, moduli, esame, progressi, piano, info, impostazioni
  components/     UI, motore Quiz, AIQuizRunner, GroupChatRunner, icone
  modules/        un modulo per cartella (i testuali hanno `aiSubject`)
  data/           banche bilingui derivate dal PDF (fisica, inglese, ATPL, Wizz…)
  store/          impostazioni, progressi, sessione d'esame
```

## Sviluppo locale

Serve Node 20+.

```bash
npm install
cp .env.example .env.local   # opzionale: incolla la tua chiave per attivare l'IA
npm run dev                  # http://localhost:3000
npm run build && npm start   # build di produzione
npm run test                 # test unitari (Vitest): generatori, scoring, fallback
npm run typecheck
```

## Come funziona l'IA

- I moduli testuali (`physics`, `maths-advanced`, `english`, `atpl-technical`)
  chiedono a `/api/quiz` domande nuove. Il prompt è **ancorato** al syllabus
  ufficiale (fisica Wizz, matematica, argomenti ATPL) preso dai dati del PDF, con
  esempi dai banchi come riferimento di stile. In caso di errore o chiave
  assente, si usano i banchi interni.
- Lo **Stage 3** (`group-exercise`) apre una chat: `/api/group-chat` con
  `action:"reply"` fa parlare i compagni/facilitatore in streaming; `action:
  "assess"` restituisce un punteggio CRM strutturato (comunicazione, ascolto,
  leadership/followership, inclusione, compostezza) con motivazioni bilingui.
- L'esame Pro resta procedurale (deterministico, veloce, senza costi API).

## Deploy su Vercel

1. Vai su **vercel.com**, accedi con GitHub e **importa** questo repository.
   Next.js è riconosciuto in automatico (nessuna configurazione).
2. In **Settings → Environment Variables** aggiungi la chiave:
   - `AI_API_KEY` = la tua chiave (Anthropic o OpenAI)
   - `AI_PROVIDER` = `anthropic` (default) oppure `openai`
   - opzionale `AI_MODEL`
3. **Deploy**. Vercel pubblica il sito e ridistribuisce a ogni push.

Senza le variabili il deploy funziona lo stesso, in modalità fallback (nessuna
chiamata a pagamento).

## Aggiornare i dati Wizz Air

Flotta, basi e rotte cambiano ogni stagione: sono in `src/data/wizz.ts` con la
costante `VERIFIED_ON` mostrata in app. Verifica sempre su wizzair.com prima del
colloquio.
