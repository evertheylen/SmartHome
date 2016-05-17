# SmartHome

Ons project voor Project Databases.

## Installeren

De basisvereisten zijn enkel `virtualenv`, `python3.5` en `postgresql`. Postgres moet minstens versie 9.5 zijn, op moment van schrijven is dat de laatste stabiele versie. (In Ubuntu lopen ze wat achter, [deze tutorial](https://www.howtoforge.com/tutorial/how-to-install-postgresql-95-on-ubuntu-12_04-15_10/) helpt daarbij.).

Er moet natuurlijk ook een gebruiker zijn met voldoende rechten om databases aan te maken in postgres.

Nadat u de basisvereisten hebt geïnstalleerd, kan u het `./setup.sh` scriptje uitvoeren (`sudo` is niet nodig). Het scriptje zal ook vragen voor een username voor de postgres gebruiker. Het scriptje zal een [`virtualenv`](http://docs.python-guide.org/en/latest/dev/virtualenvs/) aanmaken voor het project, en zal ook een configuratiebestand aanmaken, `code/config.py`.


## Uitvoeren

Het project gaat er van uit dat postgres aanwezig is en bereikbaar op `localhost:5432`

Dan kan u het script `run.sh` gebruiken. De website zal normaal beschikbaar zijn op `localhost:8888`.


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


