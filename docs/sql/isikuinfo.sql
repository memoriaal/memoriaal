delete from isikuinfo;

insert into isikuinfo
select i.id, max(ik.kasHukkunud) as kasHukkunud
, group_concat(ik.allikas, ':', replace(ik.kirje, '"', "'") SEPARATOR "\n") as allikad
from isikud i
right join (
          select isikukood, 'r1'     as allikas, kasHukkunud, kirje from r1
union all select isikukood, 'r2'     as allikas, kasHukkunud, kirje from r2
union all select isikukood, 'r3'     as allikas, kasHukkunud, kirje from r3
union all select isikukood, 'r4'     as allikas, kasHukkunud, kirje from r4
union all select isikukood, 'r5'     as allikas, kasHukkunud, kirje from r5
union all select isikukood, 'r6'     as allikas, kasHukkunud, kirje from r6
union all select isikukood, 'r7'     as allikas, kasHukkunud, kirje from r7
union all select isikukood, 'r81'    as allikas, kasHukkunud, kirje from r81
union all select isikukood, 'r81_20' as allikas, kasHukkunud, kirje from r81_20
union all select isikukood, 'okumus' as allikas, 1,           kirje from v_okumuuseum
union all select isikukood, 'MnM'    as allikas, kasHukkunud, kirje from mnm
) ik
on i.id = ik.isikukood
where ik.isikukood is not null
group by i.id
;

-- JSON alternatiiv
insert into isikuinfo
select i.id, max(ik.kasHukkunud) as kasHukkunud
, group_concat("{\"kirje\": \"", replace(ik.kirje, '"', "'"), "\", \"viit\":\"", ik.allikas, "\"}" SEPARATOR ",\n") as allikad
from isikud i
right join (
          select isikukood, 'r1'     as allikas, kasHukkunud, kirje from r1
union all select isikukood, 'r2'     as allikas, kasHukkunud, kirje from r2
union all select isikukood, 'r3'     as allikas, kasHukkunud, kirje from r3
union all select isikukood, 'r4'     as allikas, kasHukkunud, kirje from r4
union all select isikukood, 'r5'     as allikas, kasHukkunud, kirje from r5
union all select isikukood, 'r6'     as allikas, kasHukkunud, kirje from r6
union all select isikukood, 'r7'     as allikas, kasHukkunud, kirje from r7
union all select isikukood, 'r81'    as allikas, kasHukkunud, kirje from r81
union all select isikukood, 'r81_20' as allikas, kasHukkunud, kirje from r81_20
union all select isikukood, 'okumus' as allikas, 1,           kirje from v_okumuuseum
union all select isikukood, 'MnM'    as allikas, kasHukkunud, kirje from mnm
) ik
on i.id = ik.isikukood
where ik.isikukood is not null
group by i.id
;

select count(1) from isikuinfo;
