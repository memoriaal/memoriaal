INSERT INTO `memoriaal_kivitahvlid` 
  ( `kirje`, `nimi`, `eesnimi`, `perenimi`, `isanimi`, `aastad`
  , `tahvel`, `tiib`, `tahvlinr`, `tulp`, `rida`
  , `kirjekood`, `persoon`) 
SELECT repis.func_kivitekst(ll.persoon), CONCAT_WS(' ', k0.Eesnimi, k0.Perenimi) nimi, k0.Eesnimi, k0.Perenimi, k0.Isanimi, repis.func_aastad(left(k0.`Sünd`,4), left(k0.Surm,4)) aastad
     , CONCAT('L ', right(ll.tahvlinr, 2)) AS tahvel, 'L', right(ll.tahvlinr, 2), ll.tulp, ll.rida
     , ll.kirjekood, ll.persoon
FROM import.L21_L24 AS ll
LEFT JOIN repis.kirjed k0 ON k0.kirjekood = ll.persoon
-- VALUES (24054, '', '', '', '', '', '', '', 'A', 0, 0, 0, 'KIVI-04039', '0000000000');
