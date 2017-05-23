insert into isikud2

select null
, sünniaasta as sünniaasta
, 0 as surmaaasta
, perenimi as perenimi
, eesnimi as eesnimi
, isanimi as isanimi
, kasHukkunud as kasHukkunud
, 'r1' as allikas
, null as baaskirje
, null as created
, null as updated
from r1

union all select null
, sünniaasta as sünniaasta
, 0 as surmaaasta
, perenimi as perenimi
, eesnimi as eesnimi
, isanimi as isanimi
, kasHukkunud as kasHukkunud
, 'r2' as allikas
, null as baaskirje
, null as created
, null as updated
from r2

union all select null
, sünniaasta as sünniaasta
, 0 as surmaaasta
, perenimi as perenimi
, eesnimi as eesnimi
, isanimi as isanimi
, kasHukkunud as kasHukkunud
, 'r3' as allikas
, null as baaskirje
, null as created
, null as updated
from r3

union all select null
, sünniaasta as sünniaasta
, 0 as surmaaasta
, perenimi as perenimi
, eesnimi as eesnimi
, '' as isanimi
, kasHukkunud as kasHukkunud
, 'r4' as allikas
, null as baaskirje
, null as created
, null as updated
from r4

union all select null
, sünniaasta as sünniaasta
, 0 as surmaaasta
, perenimi as perenimi
, eesnimi as eesnimi
, isanimi as isanimi
, kasHukkunud as kasHukkunud
, 'r5' as allikas
, null as baaskirje
, null as created
, null as updated
from r5

union all select null
, sünniaasta as sünniaasta
, 0 as surmaaasta
, perenimi as perenimi
, eesnimi as eesnimi
, isanimi as isanimi
, kasHukkunud as kasHukkunud
, 'r6' as allikas
, null as baaskirje
, null as created
, null as updated
from r6

union all select null
, sünniaasta as sünniaasta
, 0 as surmaaasta
, perenimi as perenimi
, eesnimi as eesnimi
, '' as isanimi
, kasHukkunud as kasHukkunud
, 'r7' as allikas
, null as baaskirje
, null as created
, null as updated
from r7

union all select null
, sünniaasta as sünniaasta
, 0 as surmaaasta
, perenimi as perenimi
, eesnimi as eesnimi
, isanimi as isanimi
, kasHukkunud as kasHukkunud
, 'r81' as allikas
, null as baaskirje
, null as created
, null as updated
from r81

union all select null
, sünniaasta as sünniaasta
, 0 as surmaaasta
, perenimi as perenimi
, eesnimi as eesnimi
, isanimi as isanimi
, kasHukkunud as kasHukkunud
, 'r81_20' as allikas
, null as baaskirje
, null as created
, null as updated
from r81_20

union all select null
, sünd_aaaa as sünniaasta
, surm_aaaa as surmaaasta
, perenimi as perenimi
, eesnimi as eesnimi
, isanimi as isanimi
, kasHukkunud as kasHukkunud
, 'v_okumuuseum' as allikas
, null as baaskirje
, null as created
, null as updated
from v_okumuuseum

union all select null
, sünniaasta as sünniaasta
, 0 as surmaaasta
, perenimi as perenimi
, eesnimi as eesnimi
, isanimi as isanimi
, kasHukkunud as kasHukkunud
, 'ohvrid' as allikas
, null as baaskirje
, null as created
, null as updated
from ohvrid

union all select null
, sünniaasta as sünniaasta
, surmaaasta as surmaaasta
, perenimi as perenimi
, eesnimi as eesnimi
, '' as isanimi
, kasHukkunud as kasHukkunud
, 'mnm' as allikas
, null as baaskirje
, null as created
, null as updated
from mnm

union all select null
, sünniaasta as sünniaasta
, surmaaasta as surmaaasta
, perenimi as perenimi
, eesnimi as eesnimi
, isanimi as isanimi
, 1 as kasHukkunud
, 'metsavennad' as allikas
, null as baaskirje
, null as created
, null as updated
from v_metsavennad
;

-- exact match
select *
from isikud2 i1
left join isikud2 i2
  on  ifnull(i1.baaskirje, i1.id) > ifnull(i2.baaskirje, i2.id)
  and i1.perenimi = i2.perenimi
  and i1.eesnimi = i2.eesnimi
  and i1.isanimi = i2.isanimi
  and i1.sünniaasta = i2.sünniaasta
  and i1.surmaaasta = i2.surmaaasta
where i2.id is not null
limit 10
;
update isikud2 i1
left join isikud2 i2
  on  ifnull(i1.baaskirje, i1.id) > ifnull(i2.baaskirje, i2.id)
  and i1.perenimi = i2.perenimi
  and i1.eesnimi = i2.eesnimi
  and i1.isanimi = i2.isanimi
  and i1.sünniaasta = i2.sünniaasta
  and i1.surmaaasta = i2.surmaaasta
set i1.baaskirje = ifnull(i2.baaskirje, i2.id)
where i2.id is not null
;
-- regex match sans isanimi og sünni-/surma-aasta
select *
from isikud2 i1
left join isikud2 i2
  on  ifnull(i1.baaskirje, i1.id) > ifnull(i2.baaskirje, i2.id)
  and i1.lpn > 3 and i2.lpn > 3
  and i1.len > 3 and i2.len > 3
  and (i1.perenimi regexp i2.perenimi or i2.perenimi regexp i1.perenimi)
  and (i1.eesnimi regexp i2.eesnimi or i2.eesnimi regexp i1.eesnimi)
  and (i1.surmaaasta = i2.surmaaasta or i1.surmaaasta = 0000 or i2.surmaaasta = 0000 )
  and i1.sünniaasta = i2.sünniaasta
  and i1.sünniaasta != 0000
  and (i1.isanimi = i2.isanimi or i1.isanimi='' or i2.isanimi='' )
where i2.id is not null
/* and (i1.sünniaasta != 0000 or i1.surmaaasta != 0000 or i1.isanimi != '')
and (i2.sünniaasta != 0000 or i2.surmaaasta != 0000 or i2.isanimi != '') */
and i1.id not in (19930,21352,34413,21041,37171,47879,48176,48222,48681,66799,69860,71787,71843,72190,73010,73183,73348,73382,73605,73618,73818,74095,74578,74752,74880,75113,
75121,75173,75181,77184,78446,78827,79495,79691,79812,79938,80675,82979,115869,116047
)
and i1.id > 75807
;

update isikud2 i1
left join isikud2 i2
  on  ifnull(i1.baaskirje, i1.id) > ifnull(i2.baaskirje, i2.id)
  and i1.lpn > 3 and i2.lpn > 3
  and i1.len > 3 and i2.len > 3
  and (i1.perenimi regexp i2.perenimi or i2.perenimi regexp i1.perenimi)
  and (i1.eesnimi regexp i2.eesnimi or i2.eesnimi regexp i1.eesnimi)
  and (i1.surmaaasta = i2.surmaaasta or i1.surmaaasta = 0000 or i2.surmaaasta = 0000 )
  and i1.sünniaasta = i2.sünniaasta
  and i1.sünniaasta != 0000
  and (i1.isanimi = i2.isanimi or i1.isanimi='' or i2.isanimi='' )
set i1.baaskirje = ifnull(i2.baaskirje, i2.id)
where i2.id is not null
and i1.id not in (19930,21352,34413,21041,37171,47879,48176,48222,48681,66799,69860,71787,71843,72190,73010,73183,73348,73382,73605,73618,73818,74095,74578,74752,74880,75113,
75121,75173,75181,77184,78446,78827,79495,79691,79812,79938,80675,82979,115869,116047)
;





update ohvrid r
set isikukood = null;

update v_okumuuseum r
left join isikud2 i
  on  i.allikas = 'okumuuseum'
  and i.eesnimi = r.eesnimi
  and i.perenimi = r.perenimi
  and i.isanimi = r.isanimi
  and i.sünniaasta = r.sünniaasta
  and i.kashukkunud = r.kashukkunud
  and i.surmaaasta = r.surmaaasta
set r.isikukood = ifnull(i.baaskirje, i.id) 
;

select count(1) from v_okumuuseum where isikukood is null;

update r2 set isanimi = '' where isanimi = 'eluk';


-- Before export make sure max(isikukood) is used everywhere
-- 
-- check, if there are new unadjusted records
select * from isikud2 where baaskirje < id;
-- adjust new records
update isikud2 i2
right join isikud2 i1 on i1.baaskirje = i2.baaskirje 
set i2.baaskirje = i1.id
where i1.baaskirje < i1.id;
-- apply latest id's
update r1            r left join isikud2 i on i.id = r.isikukood set r.isikukood = i.baaskirje;
update r2            r left join isikud2 i on i.id = r.isikukood set r.isikukood = i.baaskirje;
update r3            r left join isikud2 i on i.id = r.isikukood set r.isikukood = i.baaskirje;
update r4            r left join isikud2 i on i.id = r.isikukood set r.isikukood = i.baaskirje;
update r5            r left join isikud2 i on i.id = r.isikukood set r.isikukood = i.baaskirje;
update r6            r left join isikud2 i on i.id = r.isikukood set r.isikukood = i.baaskirje;
update r7            r left join isikud2 i on i.id = r.isikukood set r.isikukood = i.baaskirje;
update r81           r left join isikud2 i on i.id = r.isikukood set r.isikukood = i.baaskirje;
update r81_20        r left join isikud2 i on i.id = r.isikukood set r.isikukood = i.baaskirje;
update v_metsavennad r left join isikud2 i on i.id = r.isikukood set r.isikukood = i.baaskirje;
update v_okumuuseum  r left join isikud2 i on i.id = r.isikukood set r.isikukood = i.baaskirje;
update mnm           r left join isikud2 i on i.id = r.isikukood set r.isikukood = i.baaskirje;
update ohvrid        r left join isikud2 i on i.id = r.isikukood set r.isikukood = i.baaskirje;
update parandused    r left join isikud2 i on i.id = r.isikukood set r.isikukood = i.baaskirje;


create or replace table es_export as
select i.baaskirje as id
     , group_concat(distinct if(i.sünniaasta=0, null, i.sünniaasta) separator ';')                as sünniaasta
     , group_concat(distinct if(i.surmaaasta=0, null, i.surmaaasta) separator ';')                as surmaaasta
     , group_concat(distinct if(i.perenimi='' , null, i.perenimi)   separator ';')                as perenimi
     , group_concat(distinct if(i.eesnimi=''  , null, i.eesnimi)    separator ';')                as eesnimi
     , group_concat(distinct if(i.isanimi=''  , null, i.isanimi)    separator ';')                as isanimi
     , max(i.kasHukkunud)                                                                         as kasHukkunud
     , group_concat(distinct i.id separator ',')                                                  as isikukoodid
     , group_concat(distinct concat(i.allikas, ': ', replace(k.kirje, '"', "'")) separator ';\n') as allikad
from isikud2 i
left join (
            select isikukood, kirje,    'r1'            as allikas from r1
  union all select isikukood, kirje,    'r2'            as allikas from r2
  union all select isikukood, kirje,    'r3'            as allikas from r3
  union all select isikukood, kirje,    'r4'            as allikas from r4
  union all select isikukood, kirje,    'r5'            as allikas from r5
  union all select isikukood, kirje,    'r6'            as allikas from r6
  union all select isikukood, kirje,    'r7'            as allikas from r7
  union all select isikukood, kirje,    'r81'           as allikas from r81
  union all select isikukood, kirje,    'r81_20'        as allikas from r81_20
  union all select isikukood, kirje,    'okumus'        as allikas from v_okumuuseum
  union all select isikukood, kirje,    'mnm'           as allikas from mnm
  union all select isikukood, kat,      'ohvrid'        as allikas from ohvrid
  union all select isikukood, kirje,    'metsavennad'   as allikas from v_metsavennad
  union all select isikukood, kirje,    'parandused'    as allikas from parandused
) as k on k.isikukood = i.baaskirje and k.allikas = i.allikas and k.kirje != ''
group by i.baaskirje
;



--- obsolete
create or replace table es_export as
select i.id
     , group_concat(distinct if(i.sünniaasta=0, null, i.sünniaasta) separator ';')  as sünniaasta
     , group_concat(distinct if(i.surmaaasta=0, null, i.surmaaasta) separator ';')  as surmaaasta
     , group_concat(distinct if(i.perenimi='' , null, i.perenimi)   separator ';')  as perenimi
     , group_concat(distinct if(i.eesnimi=''  , null, i.eesnimi)    separator ';')  as eesnimi
     , group_concat(distinct if(i.isanimi=''  , null, i.isanimi)    separator ';')  as isanimi
     , max(i.kasHukkunud)                                                           as kasHukkunud
     , group_concat(distinct concat(i.allikas, ': ', replace(k.kirje, '"', "'")) separator ';\n') as allikad
from 
(
select i2.baaskirje as id, i2.sünniaasta, i2.surmaaasta
     , i2.perenimi, i2.eesnimi, i2.isanimi
     , i2.kasHukkunud, i2.allikas
from isikud2 i1
left join isikud2 i2 on i2.baaskirje = i1.id
where i1.baaskirje is null
and i2.baaskirje is not null
union all
select i1.id, i1.sünniaasta, i1.surmaaasta
     , i1.perenimi, i1.eesnimi, i1.isanimi
     , i1.kasHukkunud, i1.allikas
from isikud2 i1
where i1.baaskirje is null
) i
left join (
            select isikukood, kirje,    'r1'            as allikas from r1
  union all select isikukood, kirje,    'r2'            as allikas from r2
  union all select isikukood, kirje,    'r3'            as allikas from r3
  union all select isikukood, kirje,    'r4'            as allikas from r4
  union all select isikukood, kirje,    'r5'            as allikas from r5
  union all select isikukood, kirje,    'r6'            as allikas from r6
  union all select isikukood, kirje,    'r7'            as allikas from r7
  union all select isikukood, kirje,    'r81'           as allikas from r81
  union all select isikukood, kirje,    'r81_20'        as allikas from r81_20
  union all select isikukood, kirje,    'okumus'        as allikas from v_okumuuseum
  union all select isikukood, kirje,    'mnm'           as allikas from mnm
  union all select isikukood, kat,      'ohvrid'        as allikas from ohvrid
  union all select isikukood, kirje,    'metsavennad'   as allikas from v_metsavennad
) as k on k.isikukood = i.id and k.allikas = i.allikas and k.kirje != ''
group by i.id
;
create or replace view es_hukkunud as
  select * from es_export
  where kasHukkunud = 1
;

