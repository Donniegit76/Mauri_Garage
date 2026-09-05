# Mauri_Garage

Catalogo self-hosted per ricambi auto d'epoca e prodotti di cosmetica auto, pensato per uso in garage da PC e smartphone sulla rete locale (LAN). Tema grafico ispirato alla Volkswagen Golf GTI.

## Stack

- **Backend**: FastAPI + SQLAlchemy + SQLite
- **Frontend**: React + Vite + Tailwind CSS (PWA, installabile su smartphone)
- **Storage foto**: filesystem, montato come volume Docker
- **Containerizzazione**: Docker Compose (un servizio backend, un servizio frontend/nginx)

## Struttura del repository

```
Mauri_Garage/
├── backend/        API FastAPI, modelli DB, test
├── frontend/       App React/Vite/Tailwind
├── docker-compose.yml
├── .env.example
└── LICENSE
```

## Avvio con Docker (consigliato)

Requisiti: [Docker Desktop](https://www.docker.com/products/docker-desktop/) installato e avviato.

1. Copia il file di configurazione e personalizzalo (facoltativo):

   ```bash
   cp .env.example .env
   ```

   Nel file `.env` puoi impostare:
   - `PORT` — porta su cui sarà raggiungibile l'app (default `8080`)
   - `APP_PASSWORD` — password unica opzionale per evitare accessi accidentali (lasciala vuota per non richiederla)
   - `APP_SECRET` — stringa segreta usata per firmare l'accesso, cambiala se imposti una password

2. Avvia tutto con un solo comando dalla cartella principale del progetto:

   ```bash
   docker compose up -d --build
   ```

3. Apri il browser su [http://localhost:8080](http://localhost:8080) (o la porta scelta).

Per fermare l'app: `docker compose down` (i dati restano salvati nel volume Docker).

### Avvio rapido con immagini precompilate (senza build)

Ad ogni push su GitHub, le immagini vengono costruite automaticamente e pubblicate su Docker Hub ([donniedream/mauri-garage-backend](https://hub.docker.com/r/donniedream/mauri-garage-backend), [donniedream/mauri-garage-frontend](https://hub.docker.com/r/donniedream/mauri-garage-frontend)). Su una macchina con solo Docker installato (anche senza il codice sorgente), basta:

```bash
git clone https://github.com/Donniegit76/Mauri_Garage.git
cd Mauri_Garage
cp .env.example .env   # opzionale
docker compose pull
docker compose up -d
```

Nessun build locale necessario — utile su macchine meno performanti o per aggiornare rapidamente a una nuova versione (`docker compose pull && docker compose up -d`).

## Accesso da smartphone in rete locale (LAN)

L'app è pensata per essere usata anche da smartphone connesso alla stessa rete Wi-Fi del PC/server che la ospita.

1. Trova l'indirizzo IP locale del PC che esegue Docker:
   - **Windows**: apri PowerShell ed esegui `ipconfig`, cerca "Indirizzo IPv4" (es. `192.168.1.50`)
   - **macOS/Linux**: esegui `ifconfig` o `ip a`, cerca l'indirizzo nella rete locale (di solito `192.168.x.x`)
2. Sullo smartphone (connesso alla stessa rete Wi-Fi), apri il browser e vai su:

   ```
   http://<IP-DEL-PC>:8080
   ```

   Esempio: `http://192.168.1.50:8080`

3. Per un accesso rapido, da Chrome/Safari usa "Aggiungi a schermata Home" per installare l'app come PWA: apparirà come un'icona sulla home dello smartphone.

> **Nota di sicurezza**: l'app non è pensata per essere esposta su Internet. Non impostare port forwarding sul router verso la porta usata da Mauri_Garage — l'accesso deve restare limitato alla rete locale.

## Backup del database

Il database SQLite e le foto vivono nel volume Docker `app_data` (montato su `/data` nel container backend, con sottocartelle `db/` e `photos/`).

Per fare un backup su file `.tar` copia il contenuto del volume:

```bash
docker run --rm -v mauri_garage_app_data:/data -v "$(pwd)":/backup alpine \
  tar czf /backup/mauri_garage_backup_$(date +%Y%m%d).tar.gz -C /data .
```

Per ripristinare un backup in un volume nuovo/vuoto:

```bash
docker run --rm -v mauri_garage_app_data:/data -v "$(pwd)":/backup alpine \
  tar xzf /backup/mauri_garage_backup_YYYYMMDD.tar.gz -C /data
```

In alternativa, per un backup rapido del solo database, copia il file `mauri_garage.db` direttamente dal volume con `docker cp`.

## Sviluppo locale (senza Docker)

**Backend**

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # su Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

API disponibile su `http://localhost:8000`, documentazione interattiva su `http://localhost:8000/docs`.

Per eseguire i test:

```bash
pytest
```

**Frontend**

```bash
cd frontend
npm install
npm run dev
```

App disponibile su `http://localhost:5173` (le chiamate a `/api` e `/photos` vengono automaticamente inoltrate al backend su `localhost:8000`).

## Funzionalità principali

- Catalogazione ricambi e prodotti di cosmetica auto, con foto, categoria, scaffale/scatola, quantità e note
- Ricerca full-text (parziale, case-insensitive) su codice e descrizione, con filtri a tendina per categoria, scaffale e scatola (inclusa l'opzione "Senza scatola")
- Vista "Scaffali" con conteggi, vista ad albero scaffale → scatole → ricambi, vista dedicata per singola scatola
- I pezzi appoggiati sullo scaffale senza scatola non vengono raggruppati in una scatola fittizia: compaiono in una sezione "Fuori scatola" e sono filtrabili a parte
- Esportazione in Excel (.xlsx), completa o filtrata sui risultati di ricerca correnti
- Upload foto da smartphone con apertura diretta della fotocamera
- Protezione opzionale con password unica (nessun sistema di account)

## Licenza

Distribuito con licenza MIT — vedi il file [LICENSE](LICENSE).
