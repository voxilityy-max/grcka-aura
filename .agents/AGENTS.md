# Pravila za čuvanje verzija (Deployment and Backups)

- Kada korisnik kaže "postavi ovo na server" (ili slične fraze poput "stavi na internet", "postavi", "deploy"), to znači da ta verzija mora biti trajno sačuvana kao referentna tačka.
- U tom trenutku agent treba da:
  1. Pokrene komandu `npm run build` da potvrdi stabilnost projekta.
  2. Napravi Git tag sa vremenskom oznakom (npr. `deploy-YYYYMMDD-HHMMSS`).
  3. Ispiše korisniku poruku sa nazivom taga i hash-om commit-a, čime potvrđuje da je ta verzija sačuvana i da se na nju možemo vratiti u bilo kom trenutku.
- Uvek kada agent potvrdi uspešan deployment na internet (nakon kreiranja taga), agent mora pored standardnih git detalja da predstavi jasnu i urednu uporednu tabelu sa sledećim kolonama:
  1. **Prethodno stanje (Šta nije bilo pre)** — šta je nedostajalo ili radilo lošije.
  2. **Nove izmene (Šta smo dodali/promenili)** — šta je tačno dodato u ovom koraku.
  3. **Ocena i status (Dobro ✅ / Rizik ❌)** — jasna ocena da li je promena stabilna i bezbedna (✅) ili donosi rizik/sumnju (❌).
  4. **Rešenje i poboljšanje sistema** — kako to rešenje unapređuje rad/sigurnost celog sistema ili plan za otklanjanje rizika.


# Pravilo o izbegavanju pretpostavki i tačnosti (Zero Assumptions & Accuracy)

- Agent nikada ne sme da pretpostavlja na koje se komponente, prozore ili delove sistema odnosi korisnički zahtev ako postoji bilo kakva dvosmislenost.
- Uvek prvo pitati i potvrditi sa korisnikom tačan prozor/komponentu pre nego što se započne izrada plana ili modifikacija koda.
- Nema mesta greškama u interpretaciji zahteva. Svaka izmena mora biti precizno usmerena i potvrđena od strane korisnika.


# Pravilo o očuvanju stila i duha sajta (Style & Spirit Preservation)

- Sve nove funkcionalnosti, moduli i stranice (tabovi) moraju u potpunosti pratiti trenutni stil, dizajn sistem, boje (Aegean Blue), fontove (Outfit/Nunito), CSS varijable i celokupnu atmosferu postojećeg sajta.
- Nikada ne menjati postojeći dizajn, raspored (layout), niti stil postojećih stranica osim ako korisnik to eksplicitno i direktno ne zatraži. Sve izmene se moraju uvoditi kao neinvazivne nadogradnje.

