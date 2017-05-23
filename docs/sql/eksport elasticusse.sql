CREATE or replace VIEW `es_export`
AS SELECT
    `i`.`id` AS `id`,
    `i`.`sünniaasta` AS `sünniaasta`,
    `i`.`perenimi` AS `perenimi`,
    `i`.`eesnimi` AS `eesnimi`,
    `i`.`isanimi` AS `isanimi`,
    `inf`.`kasHukkunud` AS `kasHukkunud`,
    `inf`.`allikad` AS `allikad`
FROM (`isikud` `i` left join `isikuinfo` `inf` on((`inf`.`id` = `i`.`id`))) where isnull(`i`.`baaskirje`);


-- alternatiiv
CREATE or replace VIEW `es_export`
AS SELECT
    `i`.`id` AS `id`,
    `i`.`sünniaasta` AS `sünniaasta`,
    `i`.`perenimi` AS `perenimi`,
    `i`.`eesnimi` AS `eesnimi`,
    `i`.`isanimi` AS `isanimi`,
    `inf`.`kasHukkunud` AS `kasHukkunud`,
    replace(
      replace(
        replace(
          replace(
            replace(
              replace(
                replace(
                  replace(
                    replace(
                      `inf`.`allikad`, 'r1:',     '<a href=@http://www.memento.ee/memento_materjalid/memento_raamatud/memento_r_1.pdf@>Memento @POLIITILISED ARRETEERIMISED EESTIS 1940-1988@</a> '
                    ),                 'r2:',     '<a href=@http://www.memento.ee/memento_materjalid/memento_raamatud/memento_r_2.pdf@>Memento @NÕUKOGUDE OKUPATSIOONIVÕIMU POLIITILISED ARRETEERIMISED EESTIS 1940-1988@</a> '
                  ),                   'r3:',     '<a href=@http://www.memento.ee/memento_materjalid/memento_raamatud/memento_r_3.pdf@>Memento @NÕUKOGUDE OKUPATSIOONIVÕIMU POLIITILISED ARRETEERIMISED EESTIS 1940-1988@</a> '
                ),                     'r4:',     '<a href=@http://www.memento.ee/memento_materjalid/memento_raamatud/memento_r_4.pdf@>Memento @KÜÜDITAMINE EESTIST VENEMAALE MÄRTSIKÜÜDITAMINE 1949 1. osa@</a> '
              ),                       'r5:',     '<a href=@http://www.memento.ee/memento_materjalid/memento_raamatud/memento_r_5.pdf@>Memento @KÜÜDITAMINE EESTIST VENEMAALE MÄRTSIKÜÜDITAMINE 1949 2. osa@</a> '
            ),                         'r6:',     '<a href=@http://www.memento.ee/memento_materjalid/memento_raamatud/memento_r_6.pdf@>Memento @KÜÜDITAMINE  EESTIST VENEMAALE JUUNIKÜÜDITAMINE 1941 & KÜÜDITAMISED 1940-1953@</a> '
          ),                           'r7:',     '<a href=@http://www.memento.ee/memento_materjalid/memento_raamatud/memento_r_7.pdf@>Memento @NÕUKOGUDE OKUPATSIOONIVÕIMUDE KURITEOD EESTIS KÜÜDITATUD, ARRETEERITUD, TAPETUD 1940-1990 NIMEDE KOONDREGISTER R1 – R6@</a> '
        ),                             'r81:',    '<a href=@http://www.memento.ee/memento_materjalid/memento_raamatud/memento_r_81.pdf@>Memento @KOMMUNISMI KURITEOD EESTIS, Lisanimestik 1940–1990, raamatute R1–R7 täiendamiseks@</a> '
      ),                               'r81_20:', '<a href=@http://www.memento.ee/memento_materjalid/memento_raamatud/memento_r_81_20.pdf@>Memento @KOMMUNISMI KURITEOD EESTIS, Lisanimestik 1940–1990, raamatute R1–R7 täiendamiseks@</a> '
    )
     AS `allikad`
FROM (`isikud` `i` left join `isikuinfo` `inf` on((`inf`.`id` = `i`.`id`))) where isnull(`i`.`baaskirje`);
