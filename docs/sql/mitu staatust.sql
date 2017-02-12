SELECT a.`id`, a.`sünniaasta`, a.`perenimi`, a.`eesnimi`, a.`isanimi`, a.`unikaalsus`, a.`dubleerib`
, trim(group_concat(a.`sünniaeg` SEPARATOR ' ')) as sünniaeg, '' as surmaaeg, trim(group_concat(a.`sünnikoht` SEPARATOR ' ')) as sünnikoht, trim(group_concat(a.`elukoht` SEPARATOR ' ')) as elukoht
, st.kashukkunud, st.kasvabanenud, st.kasmitteküüditatud
, trim(group_concat(a.`tapetud` SEPARATOR ' ')) as tapetud, trim(group_concat(a.`küüditatud` SEPARATOR ' ')) as küüditatud, trim(group_concat(a.`arreteeritud` SEPARATOR ' ')) as arreteeritud
, trim(group_concat(a.allikas, '; VHM:', a.kasvabanenud, a.kashukkunud, a.kasmitteküüditatud, '; ', a.kirje SEPARATOR "\n")) as kirjed
from staatused_v st
left join repr_v a on a.id = st.id
WHERE st.kashukkunud + st.kasvabanenud + st.kasmitteküüditatud > 1
GROUP BY `id`, `sünniaasta`, `perenimi`, `eesnimi`, `isanimi`, `unikaalsus`, `dubleerib`, st.kashukkunud, st.kasvabanenud, st.kasmitteküüditatud
