-- Sümbolite tasandamine
UPDATE isikud SET eesnimi = REPLACE(eesnimi,'Ä','ä');
UPDATE isikud SET perenimi = REPLACE(perenimi,'Ä','ä');
UPDATE isikud SET isanimi = REPLACE(isanimi,'Ä','ä');
UPDATE r6v1 SET eesnimi = REPLACE(eesnimi,'Ä','ä');
UPDATE r6v1 SET perenimi = REPLACE(perenimi,'Ä','ä');
UPDATE r6v1 SET isanimi = REPLACE(isanimi,'Ä','ä');




-- Unikaalsuspäringud

-- Sama isikukoodiga erinevad isanimed
select *
from x_isikud i
left join x_import im
on im.isikukood = i.id
where i.isanimi != im.isanimi
;

/* 14:19:07 entu okupatsioon okupatsioon */
insert into x_duplikaadid
SELECT null, eesnimi, perenimi, isanimi, sünniaasta FROM `x_isikud`
group by eesnimi, perenimi, isanimi, sünniaasta
having count(1) > 1;


select * from x_import
where isikukood in (
  SELECT id
  from x_isikud
  where (eesnimi, perenimi, isanimi, sünniaasta)
  in (select eesnimi, perenimi, isanimi, sünniaasta FROM `x_duplikaadid`)
);



select i.id as isikukood, i.sünniaasta, i.perenimi, i.eesnimi, i.isanimi
, max(kasVabanenud) kasVabanenud
, max(kasHukkunud) kasHukkunud
, max(kasMitteküüditatud) kasMitteküüditatud
, max(kasSaatusTeadmata) kasSaatusTeadmata
, group_concat(andmeallikas SEPARATOR '\n') as andmeallikad
, group_concat(im.id SEPARATOR '\n') as kirje_id
, group_concat(if(kirje is null, "", kirje), if(kasutamataKirjeosa is null, "", kasutamataKirjeosa) SEPARATOR '\n') as kirjed
from x_isikud i
left join x_import im on im.isikukood = i.id
group by i.id
;


-- nime hekseldamine isa-, pere, ja eesnimeks
update `x_import`
  set perenimi =  SUBSTRING_INDEX(nimi, ',', 1),
  eesnimi = SUBSTRING_INDEX(SUBSTRING_INDEX(nimi, ',', 2), ',', -1),
  isanimi = If(
    length(nimi) - length(replace(nimi, ',', '')) > 1,
    SUBSTRING_INDEX(SUBSTRING_INDEX(nimi, ',', 3), ',', -1),
    NULL
  )
where isikukood is null
;


-- Tühikutest vabaks nime alguses ja lõpus!
update x_import im set
  eesnimi = if ( eesnimi is null, '', trim(eesnimi) ),
  perenimi = if ( perenimi is null, '', trim(perenimi) ),
  isanimi = if ( isanimi is null, '', trim(isanimi) ),
  sünniaasta =
    if ( sünniaasta is null, 0,
      if (sünniaasta = 0, 0,
        if (sünniaasta < 70, sünniaasta + 1900,
          if (sünniaasta < 100, sünniaasta + 1800,
            if (sünniaasta < 1800, 0, sünniaasta) ) ) ) )
where isikukood is null
;


-- IMPORT

-- sünniaastaga isikutel "piisab" unikaalsuseks aasta, perenimi, eesnimi
insert ignore into x_isikud
select distinct
null, sünniaasta, perenimi, eesnimi, '', ''
from x_import
where sünniaasta > 0
and isikukood is null
;
-- Isikukoodid tagasi
update x_import im
left join x_isikud i
on i.eesnimi = im.eesnimi
and i.perenimi = im.perenimi
and i.sünniaasta = im.sünniaasta
set im.isikukood = i.id
where im.isikukood is null
;
-- lisan isanimed neile, kel on
update isikud i
left join
(
	SELECT distinct sünniaasta, perenimi, eesnimi, isanimi FROM `r5_22`
	WHERE `isanimi` NOT LIKE ''
	and `isikukood` is not null
) im
on i.eesnimi = im.eesnimi
and i.perenimi = im.perenimi
and i.sünniaasta = im.sünniaasta
set i.isanimi = im.isanimi
where im.isanimi is not null
and i.isanimi is null
;

-- sünniaastata isikutel esialgseks unikaalsuseks perenimi, eesnimi, isanimi
-- Isikukoodid tagasi neilt, kel olid sünniaastad ja isanimed olemas
update r5_22 im
left join isikud i
on i.eesnimi = im.eesnimi
and i.perenimi = im.perenimi
and i.isanimi = im.isanimi
set im.isikukood = i.id
where im.isikukood is null
;
-- Erijuhul, kui lähtetabelis polnudki isanime:
update x_import im
left join x_isikud i
on i.eesnimi = im.eesnimi
and i.perenimi = im.perenimi
-- and i.isanimi = im.isanimi
set im.isikukood = i.id
where im.isikukood is null
;
-- Uued isikud
insert ignore into x_isikud
select distinct
null, sünniaasta, perenimi, eesnimi, isanimi, ''
from x_import
where isikukood is null
;
-- Isikukoodid neile, kel pole sünniaastat, aga on isanimi
update x_import im
left join x_isikud i
on i.eesnimi = im.eesnimi
and i.perenimi = im.perenimi
and i.isanimi = im.isanimi
set im.isikukood = i.id
where im.isikukood is null
;


-- kasHukkunud view
CREATE OR REPLACE view allikad_v
AS
  SELECT i.*, a.kasvabanenud, a.kashukkunud, a.allikas
  FROM  ( SELECT isikukood, kashukkunud, NULL AS `kasvabanenud`, 'r4' AS allikas FROM   r4
          WHERE  isikukood IS NOT NULL
          UNION ALL
          SELECT isikukood, kashukkunud, NULL AS `kasvabanenud`, 'r7' AS allikas FROM   r7
          WHERE  isikukood IS NOT NULL
          UNION ALL
          SELECT isikukood, kashukkunud, kasvabanenud, 'r6v1' AS allikas FROM   r6v1
          WHERE  isikukood IS NOT NULL
          UNION ALL
          SELECT isikukood, kashukkunud, kasvabanenud, 'r81_20' AS allikas FROM   r81_20
          WHERE  isikukood IS NOT NULL) a
          UNION ALL
          SELECT isikukood, kashukkunud, kasvabanenud, 'r5_22' AS allikas FROM   r5_22
          WHERE  isikukood IS NOT NULL
        ) a
         LEFT JOIN isikud i
                ON i.id = a.isikukood;


SELECT   perenimi,
         eesnimi,
-- 		 kasvabanenud,
--          kashukkunud,
         group_concat(' in:', isanimi, ' s:', sünniaasta, ' M:',allikas SEPARATOR "\n") AS "isanimi, sünd, allikas"
FROM     allikad_v
WHERE    kashukkunud = 0
GROUP BY perenimi,
-- 		 kasvabanenud,
         kashukkunud,
         eesnimi
;


/*
Memento nimekirjadest r4, r7, r6 ja r8-1

Unikaalse ees- ja perenimega, sünniaasta kas klapib või on määramata, represseerituid
86539

Unikaalse kasvabanenud ja kashukkunud staatusega represseerituid
101926

kasvabanenud jah:11695 ei:18338, määramata:78406; kokku:108439

kashukkunud jah:22075, ei:69163; kokku:91238
*/
