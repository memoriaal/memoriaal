insert into isikud2
select null as id,
       sünniaasta,
       surmaaasta,
       perenimi,
       eesnimi,
       isanimi,
       kasHukkunud,
       'parandused' as allikas,
       parandusId as baaskirje,
       null,
       null,
       length(perenimi) as lpn,
       length(eesnimi) as len,
       length(isanimi) as lin
from parandused
where isikukood is null
;

update parandused set isikukood = parandusId where isikukood is null;

