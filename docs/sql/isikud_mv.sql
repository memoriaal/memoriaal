CREATE table `isikud_mv`
AS
  SELECT `i`.`id`                                                               AS `id`,
         group_concat(DISTINCT `i`.`sünniaasta` SEPARATOR '|')                  AS `sünniaasta`,
         group_concat(DISTINCT `a`.`sünniaasta` SEPARATOR '|')                  AS `a_sünniaasta`,
         group_concat(DISTINCT `i`.`perenimi` SEPARATOR '|')                    AS `perenimi`,
         group_concat(DISTINCT `i`.`eesnimi` SEPARATOR '|')                     AS `eesnimi`,
         group_concat(DISTINCT `i`.`isanimi` SEPARATOR '|')                     AS `isanimi`,
         group_concat(DISTINCT ifnull(`i`.`baaskirje`,'') SEPARATOR '|')        AS `baaskirje`,
         group_concat(`a`.`allikas`,': ',ifnull(`a`.`kirje`,'') SEPARATOR '\n') AS `kirje`
  FROM  (
          (
            SELECT `memoriaal`.`r1`.`sünniaasta` AS `sünniaasta`,
                   `memoriaal`.`r1`.`isikukood`  AS `isikukood`,
                   'r1'                          AS `allikas`,
                   `memoriaal`.`r1`.`kirje`      AS `kirje`
              FROM   `memoriaal`.`r1`
              WHERE  `memoriaal`.`r1`.`isikukood` IS NOT NULL
              UNION ALL
            SELECT `memoriaal`.`r2`.`sünniaasta` AS `sünniaasta`,
                   `memoriaal`.`r2`.`isikukood`  AS `isikukood`,
                   'r2'                          AS `allikas`,
                   `memoriaal`.`r2`.`kirje`      AS `kirje`
              FROM   `memoriaal`.`r2`
              WHERE  `memoriaal`.`r2`.`isikukood` IS NOT NULL
              UNION ALL
            SELECT `memoriaal`.`r3`.`sünniaasta` AS `sünniaasta`,
                   `memoriaal`.`r3`.`isikukood`  AS `isikukood`,
                   'r3'                          AS `allikas`,
                   `memoriaal`.`r3`.`kirje`      AS `kirje`
              FROM   `memoriaal`.`r3`
              WHERE  `memoriaal`.`r3`.`isikukood` IS NOT NULL
              UNION ALL
            SELECT `memoriaal`.`r4`.`sünniaasta` AS `sünniaasta`,
                   `memoriaal`.`r4`.`isikukood`  AS `isikukood`,
                   'r4'                          AS `allikas`,
                   `memoriaal`.`r4`.`kirje`      AS `kirje`
              FROM   `memoriaal`.`r4`
              WHERE  `memoriaal`.`r4`.`isikukood` IS NOT NULL
              UNION ALL
            SELECT `memoriaal`.`r5_22`.`sünniaasta` AS `sünniaasta`,
                   `memoriaal`.`r5_22`.`isikukood`  AS `isikukood`,
                   'r5_22'                          AS `allikas`,
                   `memoriaal`.`r5_22`.`kirje`      AS `kirje`
              FROM   `memoriaal`.`r5_22`
              WHERE  `memoriaal`.`r5_22`.`isikukood` IS NOT NULL
              UNION ALL
            SELECT `memoriaal`.`r6v1`.`sünniaasta` AS `sünniaasta`,
                   `memoriaal`.`r6v1`.`isikukood`  AS `isikukood`,
                   'r6v1'                          AS `allikas`,
                   `memoriaal`.`r6v1`.`kirje`      AS `kirje`
              FROM   `memoriaal`.`r6v1`
              WHERE  `memoriaal`.`r6v1`.`isikukood` IS NOT NULL
              UNION ALL
            SELECT `memoriaal`.`r7`.`sünniaasta` AS `sünniaasta`,
                   `memoriaal`.`r7`.`isikukood`  AS `isikukood`,
                   'r7'                          AS `allikas`,
                   `memoriaal`.`r7`.`kirje`      AS `kirje`
              FROM   `memoriaal`.`r7`
              WHERE  `memoriaal`.`r7`.`isikukood` IS NOT NULL
              UNION ALL
            SELECT `memoriaal`.`r81_20`.`sünniaasta` AS `sünniaasta`,
                   `memoriaal`.`r81_20`.`isikukood`  AS `isikukood`,
                   'r81_20'                          AS `allikas`,
                   `memoriaal`.`r81_20`.`kirje`      AS `kirje`
              FROM   `memoriaal`.`r81_20`
              WHERE  `memoriaal`.`r81_20`.`isikukood` IS NOT NULL
              UNION ALL
            SELECT `memoriaal`.`r81v2`.`sünd_AAAA` AS `sünniaasta`,
                   `memoriaal`.`r81v2`.`isikukood` AS `isikukood`,
                   'r81v2'                         AS `allikas`,
                   `memoriaal`.`r81v2`.`kirje`     AS `kirje`
              FROM   `memoriaal`.`r81v2`
              WHERE  `memoriaal`.`r81v2`.`isikukood` IS NOT NULL
              UNION ALL
            SELECT `memoriaal`.`ohvrid`.`sünniaasta` AS `sünniaasta`,
                   `memoriaal`.`ohvrid`.`isikukood`  AS `isikukood`,
                   'ohvrid'                          AS `allikas`,
                   `memoriaal`.`ohvrid`.`otmetki`    AS `kirje`
              FROM   `memoriaal`.`ohvrid`
              WHERE  `memoriaal`.`ohvrid`.`isikukood` IS NOT NULL
          ) `a`
          LEFT JOIN `memoriaal`.`isikud` `i` ON `i`.`id` = `a`.`isikukood`
        )
  GROUP BY `i`.`id`
;
