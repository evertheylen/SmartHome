# SmartHome

Ons project voor Project Databases.

## Installeren

De basisvereisten zijn enkel `virtualenv`, `python3` en `postgresql`.

Er moet natuurlijk ook een gebruiker zijn met voldoende rechten om databases aan te maken in postgres.

Nadat u de basisvereisten hebt geïnstalleerd, kan u het `./setup.sh` scriptje uitvoeren (`sudo` is niet nodig). Het scriptje zal ook vragen voor een username voor de postgres gebruiker. Het scriptje zal een `virtualenv` aanmaken voor het project, en zal ook een configuratiebestand aanmaken, `code/config.py`.


## Uitvoeren

Het project gaat er van uit dat postgres aanwezig is en bereikbaar op `localhost:5432`

Allereerst moet u de `virtualenv` binnengaan met het volgend commando: `source ./bin/activate`.

Daarna kan u het project starten met `code/overwatch.py`.

Om te stoppen, gebruik CTRL+C. Om de `virtualenv` uit te gaan is het commando `deactivate` voldoende.


## Groepsleden

- Evert Heylen
- Anthony Hermans
- Sam Mylle
- Jeroen Verstraelen
- Stijn Janssens


## Technologieen

- Backend
    - Python 3, Tornado, Sparrow
    - Momoko, Postgres
- Frontend
    - HTML5, CSS3, Javascript, AngularJS
    - Google MDL


