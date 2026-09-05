# Changelog

Tutte le versioni rilasciate di Mauri_Garage. Le immagini Docker vengono pubblicate
su Docker Hub con il tag `latest` e con il tag della versione (es. `v1.1.0`).

## v1.1.0

- Nuovo filtro a tendina **Scatole** accanto a categorie e scaffali, con l'elenco
  delle scatole esistenti (limitato allo scaffale selezionato) e l'opzione
  "Senza scatola (sciolti)". Vale anche per l'esportazione Excel.
- I ricambi appoggiati sullo scaffale senza scatola non vengono più raggruppati
  in una scatola fittizia: compaiono nella sezione **Fuori scatola** della vista
  scaffale, non vengono contati come scatola e sulle card appaiono come
  `Scaffale · fuori scatola`.
- Le scatole salvate come stringa vuota nei dati esistenti vengono trattate come
  "nessuna scatola" in tutte le viste e nei filtri.
- La versione dell'app è mostrata nell'intestazione, per verificare al volo quale
  build è in esecuzione dopo un aggiornamento.
- Nessuna modifica allo schema del database: i dati esistenti restano invariati.

## v1.0.0

- Prima versione: catalogo ricambi, cosmetica auto e carrozzeria con foto,
  ricerca, viste scaffali/scatole, esportazione Excel, PWA e password opzionale.
