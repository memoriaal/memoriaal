CREATE OR REPLACE view `repr_v`
AS
  SELECT `i`.`id`                    AS `id`,
         group_concat(distinct `i`.`sünniaasta` separator "|")           AS `sünniaasta`,
         group_concat(distinct `i`.`perenimi` separator "|")              AS `perenimi`,
         group_concat(distinct `i`.`eesnimi` separator "|")               AS `eesnimi`,
         group_concat(distinct `i`.`isanimi` separator "|")               AS `isanimi`,
        --  group_concat(distinct `i`.`unikaalsus` separator "\n")            AS `unikaalsus`,
         group_concat(distinct `i`.`baaskirje` separator "\n")             AS `baaskirje`,
         max(`a`.`kasvabanenud`)          AS `kasvabanenud`,
         max(`a`.`kashukkunud`)           AS `kashukkunud`,
         max(`a`.`kasmitteküüditatud`)    AS `kasmitteküüditatud`,
         group_concat(distinct ifnull(`a`.`sünnikoht`,'') separator "\n") AS `sünnikoht`,
         group_concat(distinct ifnull(`a`.`elukoht`,'') separator "\n")    AS `elukoht`,
         group_concat(distinct `a`.`tapetud` separator "\n")               AS `tapetud`,
         group_concat(distinct `a`.`küüditatud` separator "\n")          AS `küüditatud`,
         group_concat(distinct `a`.`arreteeritud` separator "\n")          AS `arreteeritud`,
         group_concat(distinct `a`.`allikas` separator "\n")               AS `allikas`,
         group_concat(`a`.`allikas`, ': ', ifnull(`a`.`kirje`,'') separator "\n")      AS `kirje`
  FROM
  (
    (
      SELECT `memoriaal`.`r1`.`sünniaasta`  AS `sünniaasta`,
             `memoriaal`.`r1`.`isikukood`    AS `isikukood`,
             `memoriaal`.`r1`.`kashukkunud`  AS `kashukkunud`,
             `memoriaal`.`r1`.`kasvabanenud` AS `kasvabanenud`,
             0                               AS `kasmitteküüditatud`,
             `memoriaal`.`r1`.`sünnikoht`   AS `sünnikoht`,
             `memoriaal`.`r1`.`elukoht`      AS `elukoht`,
             ''                              AS `tapetud`,
             ''                              AS `küüditatud`,
             ''                              AS `arreteeritud`,
             'r1'                            AS `allikas`,
             `memoriaal`.`r1`.`kirje`        AS `kirje`
      FROM   `memoriaal`.`r1`
      WHERE  `memoriaal`.`r1`.`isikukood` IS NOT NULL
      UNION ALL
      SELECT `memoriaal`.`r2`.`sünniaasta`  AS `sünniaasta`,
             `memoriaal`.`r2`.`isikukood`    AS `isikukood`,
             `memoriaal`.`r2`.`kashukkunud`  AS `kashukkunud`,
             `memoriaal`.`r2`.`kasvabanenud` AS `kasvabanenud`,
             0                               AS `kasmitteküüditatud`,
             `memoriaal`.`r2`.`sünnikoht`   AS `sünnikoht`,
             `memoriaal`.`r2`.`elukoht`      AS `elukoht`,
             ''                              AS `tapetud`,
             ''                              AS `küüditatud`,
             ''                              AS `arreteeritud`,
             'r2'                            AS `allikas`,
             `memoriaal`.`r2`.`kirje`        AS `kirje`
      FROM   `memoriaal`.`r2`
      WHERE  `memoriaal`.`r2`.`isikukood` IS NOT NULL
      UNION ALL
      SELECT `memoriaal`.`r3`.`sünniaasta`  AS `sünniaasta`,
             `memoriaal`.`r3`.`isikukood`    AS `isikukood`,
             `memoriaal`.`r3`.`kashukkunud`  AS `kashukkunud`,
             `memoriaal`.`r3`.`kasvabanenud` AS `kasvabanenud`,
             0                               AS `kasmitteküüditatud`,
             `memoriaal`.`r3`.`sünnikoht`   AS `sünnikoht`,
             `memoriaal`.`r3`.`elukoht`      AS `elukoht`,
             ''                              AS `tapetud`,
             ''                              AS `küüditatud`,
             ''                              AS `arreteeritud`,
             'r3'                            AS `allikas`,
             `memoriaal`.`r3`.`kirje`        AS `kirje`
      FROM   `memoriaal`.`r3`
      WHERE  `memoriaal`.`r3`.`isikukood` IS NOT NULL
      UNION ALL
      SELECT `memoriaal`.`r4`.`sünniaasta` AS `sünniaasta`,
             `memoriaal`.`r4`.`isikukood`   AS `isikukood`,
             `memoriaal`.`r4`.`kashukkunud` AS `kashukkunud`,
             0                              AS `kasvabanenud`,
             0                              AS `kasmitteküüditatud`,
             ''                             AS `sünnikoht`,
             ''                             AS `elukoht`,
             ''                             AS `tapetud`,
             ''                             AS `küüditatud`,
             ''                             AS `arreteeritud`,
             'r4'                           AS `allikas`,
             `memoriaal`.`r4`.`kirje`       AS `kirje`
      FROM   `memoriaal`.`r4`
      WHERE  `memoriaal`.`r4`.`isikukood` IS NOT NULL
      UNION ALL
      SELECT `memoriaal`.`r5_22`.`sünniaasta`                AS `sünniaasta`,
             `memoriaal`.`r5_22`.`isikukood`                  AS `isikukood`,
             `memoriaal`.`r5_22`.`kashukkunud`                AS `kashukkunud`,
             `memoriaal`.`r5_22`.`kasvabanenud`               AS `kasvabanenud`,
             `memoriaal`.`r5_22`.`kasmitteküüditatud`       AS `kasmitteküüditatud`,
             `memoriaal`.`r5_22`.`sünnikoht`                 AS `sünnikoht`,
             `memoriaal`.`r5_22`.`elukoht enne küüditamist` AS `elukoht`,
             ''                                               AS `tapetud`,
             ''                                               AS `küüditatud`,
             ''                                               AS `arreteeritud`,
             'r5_22'                                          AS `allikas`,
             `memoriaal`.`r5_22`.`kirje`                      AS `kirje`
      FROM   `memoriaal`.`r5_22`
      WHERE  `memoriaal`.`r5_22`.`isikukood` IS NOT NULL
      UNION ALL
      SELECT `memoriaal`.`r6v1`.`sünniaasta`          AS `sünniaasta`,
             `memoriaal`.`r6v1`.`isikukood`            AS `isikukood`,
             `memoriaal`.`r6v1`.`kashukkunud`          AS `kashukkunud`,
             `memoriaal`.`r6v1`.`kasvabanenud`         AS `kasvabanenud`,
             `memoriaal`.`r6v1`.`kasmitteküüditatud` AS `kasmitteküüditatud`,
             ''                                        AS `sünnikoht`,
             ''                                        AS `elukoht`,
             ''                                        AS `tapetud`,
             ''                                        AS `küüditatud`,
             ''                                        AS `arreteeritud`,
             'r6v1'                                    AS `allikas`,
             `memoriaal`.`r6v1`.`kirje`                AS `kirje`
      FROM   `memoriaal`.`r6v1`
      WHERE  `memoriaal`.`r6v1`.`isikukood` IS NOT NULL
      UNION ALL
      SELECT `memoriaal`.`r7`.`sünniaasta` AS `sünniaasta`,
             `memoriaal`.`r7`.`isikukood`   AS `isikukood`,
             `memoriaal`.`r7`.`kashukkunud` AS `kashukkunud`,
             0                              AS `kasvabanenud`,
             0                              AS `kasmitteküüditatud`,
             ''                             AS `sünnikoht`,
             ''                             AS `elukoht`,
             ''                             AS `tapetud`,
             ''                             AS `küüditatud`,
             ''                             AS `arreteeritud`,
             'r7'                           AS `allikas`,
             `memoriaal`.`r7`.`kirje`       AS `kirje`
      FROM   `memoriaal`.`r7`
      WHERE  `memoriaal`.`r7`.`isikukood` IS NOT NULL
      UNION ALL
      SELECT `memoriaal`.`r81_20`.`sünniaasta`          AS `sünniaasta`,
             `memoriaal`.`r81_20`.`isikukood`            AS `isikukood`,
             `memoriaal`.`r81_20`.`kashukkunud`          AS `kashukkunud`,
             `memoriaal`.`r81_20`.`kasvabanenud`         AS `kasvabanenud`,
             `memoriaal`.`r81_20`.`kasmitteküüditatud` AS `kasmitteküüditatud`,
             `memoriaal`.`r81_20`.`sünnikoht`           AS `sünnikoht`,
             ''                                          AS `elukoht`,
             ''                                          AS `tapetud`,
             ''                                          AS `küüditatud`,
             ''                                          AS `arreteeritud`,
             'r81_20'                                    AS `allikas`,
             `memoriaal`.`r81_20`.`kirje`                AS `kirje`
      FROM   `memoriaal`.`r81_20`
      WHERE  `memoriaal`.`r81_20`.`isikukood` IS NOT NULL
      UNION ALL
      SELECT `memoriaal`.`ohvrid`.`sünniaasta`          AS `sünniaasta`,
             `memoriaal`.`ohvrid`.`isikukood`            AS `isikukood`,
             `memoriaal`.`ohvrid`.`kashukkunud`          AS `kashukkunud`,
             `memoriaal`.`ohvrid`.`kasvabanenud`         AS `kasvabanenud`,
             `memoriaal`.`ohvrid`.`kasmitteküüditatud` AS `kasmitteküüditatud`,
             concat(
               IFNULL(`memoriaal`.`ohvrid`.`s_riik`,''),
               '|', IFNULL(`memoriaal`.`ohvrid`.`s_kond`,''),
               '|', IFNULL(`memoriaal`.`ohvrid`.`s_vald`,'')
             )           AS `sünnikoht`,
             concat(
               IFNULL(`memoriaal`.`ohvrid`.`a_riik`,''),
               '|', IFNULL(`memoriaal`.`ohvrid`.`a_kond`,''),
               '|', IFNULL(`memoriaal`.`ohvrid`.`a_vald`,'')
             )           AS `elukoht`,
             ''                                          AS `tapetud`,
             ''                                          AS `küüditatud`,
             ''                                          AS `arreteeritud`,
             'ohvrid'                                    AS `allikas`,
             `memoriaal`.`ohvrid`.`otmetki`                AS `kirje`
      FROM   `memoriaal`.`ohvrid`
      WHERE  `memoriaal`.`ohvrid`.`isikukood` IS NOT NULL
    ) `a`
    LEFT JOIN `memoriaal`.`isikud` `i`
    ON        `i`.`id` = `a`.`isikukood`
  )
  GROUP BY id
;
