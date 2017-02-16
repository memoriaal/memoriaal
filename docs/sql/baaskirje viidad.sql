select *
from isikud i1
left join isikud i2
on (i1.eesnimi regexp i2.eesnimi or i2.eesnimi regexp i1.eesnimi)
and (i1.perenimi regexp i2.perenimi or i2.perenimi regexp i1.perenimi)
and i1.sünniaasta = i2.sünniaasta
and ifnull(i1.baaskirje, i1.id) > i2.id
where i2.id is not null
and i2.baaskirje is null
and i1.sünniaasta > 0
limit 100
;

update isikud i1
left join isikud i2
on (i1.eesnimi regexp i2.eesnimi or i2.eesnimi regexp i1.eesnimi)
and (i1.perenimi regexp i2.perenimi or i2.perenimi regexp i1.perenimi)
and i1.sünniaasta = i2.sünniaasta
and ifnull(i1.baaskirje, i1.id) > i2.id
set i1.baaskirje = i2.id
where i2.id is not null
and i2.baaskirje is null
and i1.sünniaasta > 0
;

-- kui impordikirje viitab baaskirjega isikule,
-- siis peab viitama otse baaskirjele

UPDATE isikud a
left join isikud i on i.id = a.baaskirje
set a.baaskirje = ifnull(i.baaskirje, i.id);

UPDATE r1 a
left join isikud i on i.id = a.isikukood
set a.isikukood = ifnull(i.baaskirje, i.id);
