# Pravila za čuvanje verzija (Deployment and Backups)

- Kada korisnik kaže "postavi ovo na server" (ili slične fraze poput "stavi na internet", "postavi", "deploy"), to znači da ta verzija mora biti trajno sačuvana kao referentna tačka.
- U tom trenutku agent treba da:
  1. Pokrene komandu `npm run build` da potvrdi stabilnost projekta.
  2. Napravi Git tag sa vremenskom oznakom (npr. `deploy-YYYYMMDD-HHMMSS`).
  3. Ispiše korisniku poruku sa nazivom taga i hash-om commit-a, čime potvrđuje da je ta verzija sačuvana i da se na nju možemo vratiti u bilo kom trenutku.
