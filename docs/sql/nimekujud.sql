-- baasist välja

select
ID as memento, isikukood, perenimi, eesnimi, isanimi, sünd, sünniaasta, replace(kirje,'"', "'") as kirje
from r4
;

-- Sünniajad ja -aastad
="UPDATE r4 set sünniaasta = " & G2 & ", sünd = '" & F2 & "' WHERE ID = '" & A2 & "';"


-- peale manipuleerimist ja importi

create table r4n1 as
select
  r.isikukood,
  r.memento,
  SUBSTRING_INDEX(SUBSTRING_INDEX(r.perenimi, ';', n.n), ';', -1) perenimi,
  r.eesnimi,
  r.isanimi,
  r.sünniaasta
from
  (select 1 n union all
   select 2 union all select 3 union all
   select 4 union all select 5 union all
   select 6 union all select 7 union all
   select 8 union all select 9) n
INNER JOIN r4nimed as r
  on CHAR_LENGTH(r.perenimi)
     -CHAR_LENGTH(REPLACE(r.perenimi, ';', '')) >= n.n-1
;
create table r4n2 as
select
  r.isikukood,
  r.memento,
  r.perenimi,
  SUBSTRING_INDEX(SUBSTRING_INDEX(r.eesnimi, ';', n.n), ';', -1) eesnimi,
  r.isanimi,
  r.sünniaasta
from
  (select 1 n union all
   select 2 union all select 3 union all
   select 4 union all select 5) n
INNER JOIN r4n1 as r
  on CHAR_LENGTH(r.eesnimi)
     -CHAR_LENGTH(REPLACE(r.eesnimi, ';', '')) >= n.n-1
;
create table r4isikukandidaadid as
select
  r.isikukood,
  r.memento,
  r.perenimi,
  r.eesnimi,
  SUBSTRING_INDEX(SUBSTRING_INDEX(r.isanimi, ';', n.n), ';', -1) isanimi,
  r.sünniaasta
from
  (select 1 n union all
   select 2 union all select 3 union all
   select 4 union all select 5) n
INNER JOIN r4n2 as r
  on CHAR_LENGTH(r.isanimi)
     -CHAR_LENGTH(REPLACE(r.isanimi, ';', '')) >= n.n-1
;
insert into isikukandidaadid
select null, r.*, 'r4' from r4isikukandidaadid r
;


-- sarnaste nimedega kirjete leidmiseks ja sidumiseks
SELECT * FROM `isikukandidaadid` ik
left join memoriaal.isikud i
     on (i.eesnimi regexp ik.eesnimi or ik.eesnimi regexp i.eesnimi)
    and (i.perenimi regexp ik.perenimi or ik.perenimi regexp i.perenimi)
    and i.sünniaasta = ik.sünniaasta
WHERE ik.`isikukood` IS NULL
and ik.sünniaasta != 0000
and i.id is not null
order by ik.memento
;




create or replace table nimed as
select i.baaskirje as id
     , group_concat(distinct if(i.sünniaasta=0, null, i.sünniaasta) separator ';')                as sünniaasta
     , group_concat(distinct if(i.surmaaasta=0, null, i.surmaaasta) separator ';')                as surmaaasta
     , group_concat(distinct if(i.perenimi='' , null, i.perenimi)   separator ';')                as perenimi
     , group_concat(distinct if(i.eesnimi=''  , null, i.eesnimi)    separator ';')                as eesnimi
     , group_concat(distinct if(i.isanimi=''  , null, i.isanimi)    separator ';')                as isanimi
     , group_concat(distinct i.id separator ',')                                                  as isikukoodid
     , group_concat(distinct k.eesnimi  separator ';') as eesnimed
     , group_concat(distinct k.perenimi separator ';') as perenimed
     , group_concat(distinct k.isanimi  separator ';') as isanimed
     , group_concat(distinct k.nimekujud separator ';') as nimekujud
from isikud2 i
left join (
            select isikukood, perenimi, eesnimi,       isanimi,       nimekujud, 'r1'          as allikas from r1
  union all select isikukood, perenimi, eesnimi,       isanimi,       nimekujud, 'r2'          as allikas from r2
  union all select isikukood, perenimi, eesnimi,       isanimi,       nimekujud, 'r3'          as allikas from r3
  union all select isikukood, perenimi, eesnimi, '' as isanimi, '' as nimekujud, 'r4'          as allikas from r4
  union all select isikukood, perenimi, eesnimi,       isanimi, '' as nimekujud, 'r5'          as allikas from r5
  union all select isikukood, perenimi, eesnimi,       isanimi, '' as nimekujud, 'r6'          as allikas from r6
  union all select isikukood, perenimi, eesnimi, '' as isanimi, '' as nimekujud, 'r7'          as allikas from r7
  union all select isikukood, perenimi, eesnimi,       isanimi, '' as nimekujud, 'r81'         as allikas from r81
  union all select isikukood, perenimi, eesnimi,       isanimi, '' as nimekujud, 'r81_20'      as allikas from r81_20
  union all select isikukood, perenimi, eesnimi,       isanimi, '' as nimekujud, 'okumus'      as allikas from v_okumuuseum
  union all select isikukood, perenimi, eesnimi, '' as isanimi, '' as nimekujud, 'mnm'         as allikas from mnm
  union all select isikukood, perenimi, eesnimi,       isanimi, '' as nimekujud, 'ohvrid'      as allikas from ohvrid
  union all select isikukood, perenimi, eesnimi,       isanimi, '' as nimekujud, 'metsavennad' as allikas from v_metsavennad
  -- union all select isikukood, perenimi, eesnimi, isanimi, '' as nimekujud, 'parandused'    as allikas from parandused
) as k on k.isikukood = i.baaskirje and k.allikas = i.allikas
group by i.baaskirje
;



create table nk1 as
select distinct
  nk.sünniaasta,
  nk.surmaaasta,
  SUBSTRING_INDEX(SUBSTRING_INDEX(nk.perenimed, ';', n.n), ';', -1) perenimed,
  nk.eesnimed,
  nk.isanimed
from
  (select 1 n union all
   select 2 union all select 3 union all
   select 4 union all select 5 union all
   select 6 union all select 7 union all
   select 8 union all select 9) n
INNER JOIN nimekujud0 as nk
;
create table nk2 as
select distinct
  nk.sünniaasta,
  nk.surmaaasta,
  nk.perenimed,
  SUBSTRING_INDEX(SUBSTRING_INDEX(nk.eesnimed, ';', n.n), ';', -1) eesnimed,
  nk.isanimed
from
  (select 1 n union all
   select 2 union all select 3 union all
   select 4 union all select 5 union all
   select 6 union all select 7 union all
   select 8 union all select 9) n
INNER JOIN nk1 as nk
;
create table nk3 as
select distinct
  nk.sünniaasta,
  nk.surmaaasta,
  nk.perenimed,
  nk.eesnimed,
  SUBSTRING_INDEX(SUBSTRING_INDEX(nk.isanimed, ';', n.n), ';', -1) isanimed
from
  (select 1 n union all
   select 2 union all select 3 union all
   select 4 union all select 5 union all
   select 6 union all select 7 union all
   select 8 union all select 9) n
INNER JOIN nk2 as nk
;
create table nk4 as
select distinct
  nk.sünniaasta,
  SUBSTRING_INDEX(SUBSTRING_INDEX(nk.surmaaasta, ';', n.n), ';', -1) surmaaasta,
  nk.perenimed,
  nk.eesnimed,
  nk.isanimed
from
  (select 1 n union all
   select 2 union all select 3 union all
   select 4 union all select 5 union all
   select 6 union all select 7 union all
   select 8 union all select 9) n
INNER JOIN nk3 as nk
;
create table nk5 as
select distinct
SUBSTRING_INDEX(SUBSTRING_INDEX(nk.sünniaasta, ';', n.n), ';', -1) sünniaasta,
  nk.surmaaasta,
  nk.perenimed,
  nk.eesnimed,
  nk.isanimed
from
  (select 1 n union all
   select 2 union all select 3 union all
   select 4 union all select 5 union all
   select 6 union all select 7 union all
   select 8 union all select 9) n
INNER JOIN nk4 as nk
;
