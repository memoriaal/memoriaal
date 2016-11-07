CREATE TABLE `eraf_kirjed` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `leidandmed` varchar(255) DEFAULT NULL,
  `pealkiri` text,
  PRIMARY KEY (`id`),
  UNIQUE KEY `pealkiri` (`pealkiri`(500))
) ENGINE=InnoDB AUTO_INCREMENT=33945 DEFAULT CHARSET=utf8;

CREATE TABLE `eraf_isikud` (
  `id` int(10) unsigned NOT NULL AUTO_INCREMENT,
  `isik` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `isik` (`isik`)
) ENGINE=InnoDB AUTO_INCREMENT=41101 DEFAULT CHARSET=utf8;


select *
from eraf_isikud ei
left join eraf_kirjed ek on ek.pealkiri like concat('%', ei.isik, '%')
LIMIT 0,50
;


update `eraf_kirjed`
set leidandmed = substr(leidandmed, 1, position('-' IN leidandmed)-1)
where position('-' IN leidandmed) > 0
;


create table eraf_seosed as
select distinct ei.isik,
ek.leidandmed
from eraf_isikud as ei
left join eraf_kirjed as ek on ek.pealkiri like concat('%', ei.isik, '%')
;


select ei.isik,
group_concat(ek.leidandmed ORDER BY ek.leidandmed)         AS "Nimetus"
from eraf_isikud as ei
left join eraf_kirjed as ek on ek.pealkiri like concat('%', ei.isik, '%')
group by ei.isik
limit 30
;
