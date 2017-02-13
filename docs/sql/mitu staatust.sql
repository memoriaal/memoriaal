SELECT a.`id`, a.`sünniaasta`, a.`perenimi`, a.`eesnimi`, a.`isanimi`, a.`unikaalsus`, a.`dubleerib`
, trim(group_concat(a.`sünniaeg` SEPARATOR ' ')) as sünniaeg, '' as surmaaeg, trim(group_concat(a.`sünnikoht` SEPARATOR ' ')) as sünnikoht, trim(group_concat(a.`elukoht` SEPARATOR ' ')) as elukoht
, st.kashukkunud, st.kasvabanenud, st.kasmitteküüditatud
, trim(group_concat(a.`tapetud` SEPARATOR ' ')) as `tapetud (AAAA-KK-PP)`, trim(group_concat(a.`küüditatud` SEPARATOR ' ')) as `küüditatud (AAAA-KK-PP)`, trim(group_concat(a.`arreteeritud` SEPARATOR ' ')) as `arreteeritud (AAAA-KK-PP)`
, trim(replace(group_concat(a.allikas, '; VHM:', a.kasvabanenud, a.kashukkunud, a.kasmitteküüditatud, '; ', a.kirje SEPARATOR "\n"),'"', '''')) as kirjed
FROM staatused_v st
LEFT JOIN repr_v a on a.id = st.id
WHERE st.kashukkunud + st.kasvabanenud + st.kasmitteküüditatud > 1
GROUP BY `id`, `sünniaasta`, `perenimi`, `eesnimi`, `isanimi`, `unikaalsus`, `dubleerib`, st.kashukkunud, st.kasvabanenud, st.kasmitteküüditatud
