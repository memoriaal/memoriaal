CREATE TABLE `isikud` (
  `isikukood` bigint(12) unsigned NOT NULL AUTO_INCREMENT,
  `perenimi` varchar(50) DEFAULT NULL,
  `eesnimi` varchar(50) DEFAULT NULL,
  `isanimi` varchar(50) DEFAULT NULL,
  `synniaeg` varchar(10) DEFAULT NULL,
  `surmaaeg` varchar(10) DEFAULT NULL,
  `synnikoht` varchar(200) DEFAULT NULL,
  `surmakoht` varchar(200) DEFAULT NULL,
  `allikas` varchar(20) NOT NULL DEFAULT '',
  PRIMARY KEY (`isikukood`)
) ENGINE=InnoDB AUTO_INCREMENT=100000000001 DEFAULT CHARSET=utf8;

INSERT INTO `isikud` (`isikukood`, `perenimi`, `eesnimi`, `isanimi`, `synniaeg`, `surmaaeg`, `synnikoht`, `surmakoht`, `allikas`) VALUES ('100000000000', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '');
DELETE FROM `isikud` WHERE `isikukood` IN ('100000000000');

insert ignore into isikud 
select 
	  `rr_isikukood` as isikukood
	, ifnull(`rr_perenimi`, UPPER(`f_perenimi`)) as perenimi
	, ifnull(`rr_eesnimi`, UPPER(`f_eesnimi`)) as eesnimi
	, ifnull(`rr_isanimi`, UPPER(`f_isanimi`)) as isanimi
	, ifnull(`rr_synniaeg`, `f_sünd`) as synniaeg
	, ifnull(`rr_surmaaeg`, `f_surm`) as surmaaeg
	, `rr_synnikoht` as synnikoht
	, `rr_surmakoht` as surmakoht
	, 'RR' as allikas
from  allikad.RR20170517;

