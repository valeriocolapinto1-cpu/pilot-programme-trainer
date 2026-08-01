# Pathway Trainer

Uno strumento di allenamento per la selezione del **Wizz Air Pathway Programme**
gestito con **Urbe Aero** (versione italiana del Wizz Air Pilot Academy). Ricrea,
un modulo alla volta, ogni componente della selezione — i due test online e la
giornata in presenza — così da arrivare preparati all'esame TestAir360, al
group exercise e al colloquio tecnico/HR.

Tutto gira nel browser: nessun account, nessun backend, i dati restano solo sul
tuo dispositivo. È installabile come app (PWA) e funziona offline.

> **Avvertenza.** Progetto indipendente, senza alcun legame con Wizz Air, Urbe
> Aero o TestAir360. Gli esercizi sono ricostruzioni originali basate su
> descrizioni pubbliche dei formati, **non** riproduzioni del test reale.

---

## Cosa contiene

**Fase 1 — TestAir360 (esame Pro)**
Azimuth (bussola/orologio), cubi rotanti 3D, memoria di cifre, scansione di
quadranti, decoder di pattern, richiamo differito, bilanciamento occhio-mano con
doppio compito e controlli invertiti, equazioni a tempo, percezione visiva,
**matematica audio** (domande lette a voce, senza carta né calcolatrice),
matematica avanzata, **fisica** sul syllabus ufficiale, inglese, vigilanza.

**Fase 2 — Psicologico**
Questionario di personalità con rilevatore di contraddizioni.

**Fasi 3-4 — Giornata in presenza**
Group exercise con rubrica CRM, colloquio tecnico ATPL (METAR generati ogni
volta, distanze di pista, V-speed, altimetria, sistemi), colloquio HR/STAR,
conoscenza Wizz Air con ripetizione spaziata.

**Extra**
- **Esame Pro simulato**: i moduli della Fase 1 in sequenza cronometrata (~3 h)
  con report finale in percentuali per modulo, più una modalità *pratica* che
  riproduce le 5 aree delle pratiche gratuite TestAir360.
- **Piano di studio** 4-6 settimane e checklist operativa.
- **Progressi** per modulo con export/import JSON.
- Interfaccia **bilingue IT/EN**, tema chiaro/scuro.

---

## Sviluppo

Serve Node 20+.

```bash
npm install
npm run dev        # server di sviluppo (porta 5173)
npm run build      # build di produzione in dist/
npm run preview    # anteprima della build
npm run test       # test unitari (Vitest)
npm run e2e        # smoke test end-to-end (Playwright)
```

Durante `dev`/`preview` la base è `/pilot-programme-trainer/` per combaciare con
GitHub Pages. Per servire dalla radice (utile ai test): `BASE_PATH=/ npm run dev`.

### Struttura

```
src/
  app/          router (HashRouter), layout, tema
  components/   primitivi UI, motore quiz condiviso, set di icone
  i18n/         dizionario IT/EN tipizzato
  lib/          RNG con seed, timer, speech, ripetizione spaziata, statistiche
  modules/      un modulo per cartella, ognuno esporta un TrainerModule
  data/         banche domande bilingui (fisica, inglese, ATPL, Wizz, scenari…)
  pages/        home, moduli, esame, progressi, piano, info, impostazioni
  store/        impostazioni, progressi, sessione d'esame (Zustand + persist)
```

Ogni modulo implementa lo stesso contratto `TrainerModule`
(`src/modules/types.ts`) ed è registrato in `src/modules/registry.ts`: aggiungere
un modulo lì lo collega automaticamente a elenco, esame e rotte. Gli esercizi
sono generati da un seed, quindi sono infiniti ma riproducibili.

---

## Aggiornare i dati aziendali Wizz Air

Flotta, basi, rotte e strategia **cambiano ogni stagione**. Sono raccolti in
`src/data/wizz.ts`: aggiorna i valori e la costante `VERIFIED_ON` (mostrata in
app accanto ai dati volatili). Verifica sempre i numeri su wizzair.com prima del
colloquio.

---

## Deploy

Il workflow `.github/workflows/deploy.yml` fa type-check, test e build a ogni
push su `main`, poi pubblica su GitHub Pages. Per attivarlo: **Settings → Pages →
Source: GitHub Actions**. Il sito sarà su
`https://<utente>.github.io/pilot-programme-trainer/`.
