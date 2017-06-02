CREATE or REPLACE TABLE `isikud` (
  `isikukood` int(11) unsigned NOT NULL AUTO_INCREMENT,
  `perenimi` varchar(50) DEFAULT NULL,
  `eesnimi` varchar(50) DEFAULT NULL,
  `isanimi` varchar(50) DEFAULT NULL,
  `synniaeg` varchar(10) DEFAULT NULL,
  `surmaaeg` varchar(10) DEFAULT NULL,
  `synnikoht` varchar(200) DEFAULT NULL,
  `surmakoht` varchar(200) DEFAULT NULL,
  `allikas` varchar(20) NOT NULL DEFAULT '',
  `allika_id` varchar(20) DEFAULT NULL,
  `kirje` text DEFAULT NULL,
  PRIMARY KEY (`isikukood`)
) ENGINE=InnoDB AUTO_INCREMENT=1000000000 DEFAULT CHARSET=utf8;

insert into isikud 
select distinct
    null as isikukood
  , case when rr_perenimi = '' then UPPER(`f_perenimi`) else rr_perenimi end as perenimi
  , case when rr_eesnimi = '' then UPPER(`f_eesnimi`) else rr_eesnimi end as eesnimi
  , case when rr_isanimi = '' then UPPER(`f_isanimi`) else rr_isanimi end as isanimi
  , case when rr_synniaeg = '' then `f_sünd` else rr_synniaeg end as synniaeg
  , case when rr_surmaaeg = '' then `f_surm` else rr_surmaaeg end as surmaaeg
  , `rr_synnikoht` as synnikoht
  , `rr_surmakoht` as surmakoht
  , 'RR' as allikas
  , `rr_isikukood` as allika_id
  , null as kirje
from  allikad.RR20170517;

insert into isikud 
select distinct
    null as isikukood
  , UPPER(`perenimi`) as perenimi
  , UPPER(`eesnimi`) as eesnimi
  , null as isanimi
  , case when `sünniaasta` = '0000' then null else `sünniaasta` end as synniaeg
  , case when `surmaaasta` = '0000' then null else `surmaaasta` end as surmaaeg
  , null as synnikoht
  , null as surmakoht
  , 'mnm' as allikas
  , `id` as allika_id
  , `kirje` as kirje
from  allikad.mnm;

