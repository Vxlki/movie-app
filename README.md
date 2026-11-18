# Filmele mele

Aplicație web (PWA) pentru filme și seriale văzute: note de la 1 la 10, episoade bifate, listă „De văzut”, statistici, backup.
Datele despre filme vin de la TMDB. Datele tale stau doar pe telefon.

## Publicare pe GitHub Pages
1. Creează un repository public numit `filme`.
2. Încarcă toate fișierele din acest folder, inclusiv folderul `icons`.
3. Mergi la Settings → Pages → Source: „Deploy from a branch” → `main` / `(root)` → Save.
4. După 1–2 minute aplicația e la `https://NUMELE-TAU.github.io/filme/`.

## Instalare pe iPhone
Deschide adresa în Safari → Share → **Add to Home Screen**. Folosește aplicația de pe ecranul principal: datele ei sunt separate de cele din Safari.

## Actualizare
După `git push`, GitHub Pages publică în ~1 minut (vezi tab-ul Actions din repo: bifă verde = gata).
Apoi aplicația ia singură versiunea nouă la următoarea deschidere sau revenire în ea.
Dacă modifici `sw.js`, crește `VERSION` din el.

## Backup
Setări → Fă backup → Save to Files → iCloud Drive. Restaurarea: Setări → Restaurează.
