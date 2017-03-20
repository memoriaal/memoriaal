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
   select 4 union all select 5) n
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
