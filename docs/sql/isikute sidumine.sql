-- sarnaste nimedega kirjete leidmiseks ja sidumiseks
SELECT ik.memento, ik.perenimi, ik.eesnimi, ik.isanimi, replace(ik.kirje, '"', "'") kirje, '' as isikukood
, i.id as isikukood, i.perenimi, i.eesnimi, i.isanimi, i.sünniaasta, '' as baaskirje, i.baaskirje, '' as "!", i.allikad
FROM r1 ik
left join isikud i
     on (i.eesnimi regexp ik.eesnimi or ik.eesnimi regexp i.eesnimi)
    and (i.perenimi regexp ik.perenimi or ik.perenimi regexp i.perenimi)
    and i.sünniaasta = ik.sünniaasta
WHERE ik.`isikukood` IS NULL
and ik.sünniaasta != 0000
and i.id is not null
and ik.perenimi != ''
and ik.eesnimi != ''
and i.perenimi != ''
and i.eesnimi != ''
order by ik.memento
;


select           'r1'     as raamat, memento, isikukood, perenimi, eesnimi, isanimi, sünniaasta, replace(kirje,'"',"'") as kirje from r1
union all select 'r2'     as raamat, memento, isikukood, perenimi, eesnimi, isanimi, sünniaasta, replace(kirje,'"',"'") as kirje from r2
union all select 'r3'     as raamat, memento, isikukood, perenimi, eesnimi, isanimi, sünniaasta, replace(kirje,'"',"'") as kirje from r3
union all select 'r4'     as raamat, memento, isikukood, perenimi, eesnimi, isanimi, sünniaasta, replace(kirje,'"',"'") as kirje from r4
union all select 'r5'     as raamat, memento, isikukood, perenimi, eesnimi, isanimi, sünniaasta, replace(kirje,'"',"'") as kirje from r5
union all select 'r6'     as raamat, memento, isikukood, perenimi, eesnimi, isanimi, sünniaasta, replace(kirje,'"',"'") as kirje from r6
union all select 'r7'     as raamat, memento, isikukood, perenimi, eesnimi, isanimi, sünniaasta, replace(kirje,'"',"'") as kirje from r7
union all select 'r81'    as raamat, memento, isikukood, perenimi, eesnimi, isanimi, sünniaasta, replace(kirje,'"',"'") as kirje from r81
union all select 'r81_20' as raamat, memento, isikukood, perenimi, eesnimi, isanimi, sünniaasta, replace(kirje,'"',"'") as kirje from r81_20
where isikukood is null
;
