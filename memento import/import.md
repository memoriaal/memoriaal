# Memento raamatute import

## Impordi sammud

### Failide esmane ettevalmistamine

Automaatsed suuremahulised failimuudatused andmete ühtlustamiseks ja veamustrite leidmiseks.

1. Alusena kasutasin Memento 6. raamatu PDF'i kodulehelt
2. Meelise arvutis kopipaste pdf->word  
   Tulemuseks [neli .docx dokumenti](https://github.com/memoriaal/memoriaal/tree/master/memento/in)
3. Meelise arvutis asendus boldis tekst -> <b>boldis tekst</b>
4. Failid salvestada "as plaintext"
5. Unixi masinas käivitatud skript [regex.sh](https://github.com/memoriaal/memoriaal/blob/master/memento/in/regex.sh)
   tulemuseks fail [memento.yaml](https://github.com/memoriaal/memoriaal/blob/master/memento/memento.yaml)


### Andmete destilleerimine

Node skript märgistamaks perekondi, sugulust, aliaseid, rahvust jne.

## Tuvastatud ebakõlad

- raamat 6 peatükk 2
  - AST, Vilbert, Friedrich,
    Perekonnaliikmete isanimed pole boldis
  - GOLDBERG, Leizer, Schapsel
    Sünnikuupäevas "1891" asemel "189l"
