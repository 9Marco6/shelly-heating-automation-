# 🎵 Shelly Heating Automation - Scuola di Musica

Automazione completa del riscaldamento per una scuola di musica con due Shelly Plus 2PM, scripting JavaScript e notifiche Telegram.

## 📋 Il Problema

La scuola di musica ospita lezioni per bambini e ragazzi dal lunedì al sabato con orari distribuiti durante la settimana. Qualcuno doveva fisicamente recarsi nella struttura prima di ogni lezione per accendere il riscaldamento, con conseguente spreco di energia o aule fredde all’arrivo degli allievi.

## ✅ La Soluzione

Due Shelly Plus 2PM comunicanti tra loro in rete locale gestiscono in modo intelligente caldaia, termoconvettori e programma antigelo.

## 🔧 Hardware

- **Shelly Plus 2PM #1** (Caldaia)
  - Canale 1 = Caldaia
  - Canale 2 = Programma Antigelo
  - Input S1 = Pulsante fisico
  - Input S2 = Spia blocco bruciatore
- **Shelly Plus 2PM #2** (Termoconvettori)
  - Canale 1 = Termoconvettore Scuola di Musica
  - Canale 2 = Termoconvettore Sala Riunioni

## 🔌 Collegamenti Fisici

### Shelly Plus 2PM #1 (Caldaia)

|Morsetto|Collegamento                                  |
|--------|----------------------------------------------|
|N       |Neutro                                        |
|O1      |Uscita Caldaia                                |
|L       |Fase                                          |
|O2      |Uscita Programma Antigelo                     |
|S1      |Pulsante fisico (fase)                        |
|S2      |Spia blocco bruciatore tramite relè intermedio|

### Shelly Plus 2PM #2 (Termoconvettori)

|Morsetto|Collegamento                           |
|--------|---------------------------------------|
|N       |Neutro                                 |
|O1      |Uscita Termoconvettore Scuola di Musica|
|L       |Fase                                   |
|O2      |Uscita Termoconvettore Sala Riunioni   |

### Note sui collegamenti

- Il pulsante fisico su S1 deve essere configurato come **“Button - Momentary”** nelle impostazioni dell’app
- La spia blocco bruciatore su S2 deve essere collegata tramite un **relè intermedio** e S2 deve essere configurato come **“Switch - Detached”**

## ⚙️ Funzionamento

### Modalità Automatica

- La caldaia si accende/spegne secondo la programmazione oraria dell’app Shelly
- In base al giorno della settimana lo script accende il termoconvettore corretto:
  - Lunedì, Martedì, Mercoledì, Venerdì, Sabato → Termoconvettore Scuola di Musica
  - Giovedì → Termoconvettore Sala Riunioni
  - Domenica → nessun termoconvettore
- A caldaia spenta nei mesi invernali (ottobre-marzo) si attiva il Programma Antigelo

### Modalità Manuale

- Un pulsante fisico accende caldaia + entrambi i termoconvettori con una pressione
- Una seconda pressione spegne tutto e torna in modalità automatica

### Sicurezze

- Il Programma Antigelo non può attivarsi con la caldaia accesa
- I termoconvettori non possono accendersi se la caldaia è spenta
- Monitoraggio consumi: se un termoconvettore viene spento fisicamente dall’interruttore viene rilevato e notificato
- Rilevamento blocco caldaia tramite spia bruciatore collegata a S2

### Notifiche Telegram

- Caldaia accesa/spenta con indicazione della sorgente (automatico/manuale/da app)
- Alert termoconvettore spento manualmente + promemoria dopo 5 minuti
- Alert blocco caldaia + promemoria dopo 5 minuti
- Alert caldaia sbloccata

## 🗓️ Personalizzazione Giorni e Mesi

### Giorni della settimana

|Numero|Giorno   |
|------|---------|
|0     |Domenica |
|1     |Lunedì   |
|2     |Martedì  |
|3     |Mercoledì|
|4     |Giovedì  |
|5     |Venerdì  |
|6     |Sabato   |

Per modificare i giorni di accensione dei termoconvettori, modifica la funzione `giorno()` in `shelly1-caldaia.js`:

```js
function giorno(){
  var g=new Date().getDay();
  if(g===0)return 0;  // Domenica: nessun termoconvettore
  if(g===4)return 2;  // Giovedì: Termoconvettore 2
  return 1;           // Tutti gli altri: Termoconvettore 1
}
```

Esempi di personalizzazione:

- Aggiungere il Mercoledì al Termoconvettore 2: `if(g===3||g===4)return 2;`
- Non accendere nessun termoconvettore il Sabato: aggiungere `if(g===6)return 0;`

### Mesi del Programma Antigelo

|Numero|Mese     |
|------|---------|
|0     |Gennaio  |
|1     |Febbraio |
|2     |Marzo    |
|3     |Aprile   |
|4     |Maggio   |
|5     |Giugno   |
|6     |Luglio   |
|7     |Agosto   |
|8     |Settembre|
|9     |Ottobre  |
|10    |Novembre |
|11    |Dicembre |

Per modificare i mesi del programma antigelo, modifica la riga nella funzione `caldaiaOff()` in `shelly1-caldaia.js`:

```js
var invernale=(m>=9||m<=2); // Da Ottobre (9) a Marzo (2)
```

Esempio: per attivare il programma antigelo da Novembre ad Aprile:

```js
var invernale=(m>=10||m<=3);
```

## 📬 Personalizzazione Notifiche Telegram

### Creare il bot Telegram

1. Apri Telegram e cerca **@BotFather**
1. Scrivi `/newbot` e segui le istruzioni
1. Copia il **token** che ti viene fornito
1. Cerca il tuo bot e scrivi `/start`
1. Apri `https://api.telegram.org/bot<TOKEN>/getUpdates` per ottenere il tuo **Chat ID**

### Modificare i testi delle notifiche

I messaggi Telegram usano `%20` al posto degli spazi. Per modificarli cerca le chiamate `tg()` negli script:

```js
// Esempio originale
tg("Caldaia%20ACCESA%20(automatico)");
// Versione personalizzata
tg("Riscaldamento%20attivato%20automaticamente");
```

### Aggiungere un secondo destinatario

Aggiungi una seconda variabile e funzione in entrambi gli script:

```js
var TG_CHAT2="ID_SECONDO_DESTINATARIO";
function tg2(msg){Shelly.call("HTTP.GET",{url:"https://api.telegram.org/bot"+TG_TOKEN+"/sendMessage?chat_id="+TG_CHAT2+"&text="+msg,timeout:10,ssl_ca:"*"},null);}
```

Poi chiama `tg2()` insieme a `tg()` ovunque vuoi mandare la notifica al secondo destinatario.

### Usare un gruppo Telegram

Crea un gruppo Telegram, aggiungi il bot al gruppo e usa l’ID del gruppo (numero negativo) come `TG_CHAT`. Puoi aggiungere quante persone vuoi senza modificare lo script.

## 📲 Installazione

### Prerequisiti

- 2x Shelly Plus 2PM
- App Shelly aggiornata all’ultima versione
- Bot Telegram (creato tramite @BotFather)

### Configurazione

1. **Primo Shelly** - apri `shelly1-caldaia.js` e sostituisci:
- `IP2` con l’IP del secondo Shelly
- `TG_TOKEN` con il token del tuo bot Telegram
- `TG_CHAT` con l’ID del tuo gruppo/chat Telegram
1. **Secondo Shelly** - apri `shelly2-termoconvettori.js` e sostituisci:
- `IP1` con l’IP del primo Shelly
- `TG_TOKEN` con il token del tuo bot Telegram
- `TG_CHAT` con l’ID del tuo gruppo/chat Telegram
1. Carica ogni script sul rispettivo Shelly tramite **Scripts** nell’app o nell’interfaccia web
1. Imposta ogni script su **“Run on startup”**
1. Configura la programmazione oraria della caldaia dall’app Shelly sul primo dispositivo
1. Configura l’input S1 del primo Shelly come **“Button - Momentary”**
1. Configura l’input S2 del primo Shelly come **“Switch - Detached”**

## 📝 Note Tecniche

- Gli script comunicano tra loro tramite chiamate HTTP in rete locale
- Le notifiche Telegram richiedono connessione internet
- Il monitoraggio consumi usa una soglia di 5W per rilevare i termoconvettori spenti fisicamente
- Il promemoria viene inviato dopo 5 minuti (10 controlli x 30 secondi)
- Usare `ssl_ca:"*"` nella chiamata `HTTP.GET` per compatibilità con firmware 1.7.x
- Il timer da 60 secondi è necessario come keepalive per mantenere gli script attivi
