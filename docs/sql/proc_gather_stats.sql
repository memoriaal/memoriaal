DELIMITER ;;
CREATE OR REPLACE PROCEDURE `gather_stats`()
BEGIN

    SELECT count(1) INTO @kirjeid
    FROM kirjed
    WHERE isikukood NOT IN
        (SELECT isikukood1
         FROM seosed
         WHERE isikukood1 < isikukood2 AND seos = 'sama isik');


    SELECT count(1) INTO @rel
    FROM kirjed
    WHERE rel = '!' AND isikukood NOT IN
        (SELECT isikukood1
         FROM seosed
         WHERE isikukood1 < isikukood2 AND seos = 'sama isik');


    SELECT count(1) INTO @mr
    FROM kirjed
    WHERE mr = '!' AND isikukood NOT IN
        (SELECT isikukood1
         FROM seosed
         WHERE isikukood1 < isikukood2 AND seos = 'sama isik');


    SELECT count(1) INTO @kivi
    FROM kirjed
    WHERE kivi = '!' AND isikukood NOT IN
        (SELECT isikukood1
         FROM seosed
         WHERE isikukood1 < isikukood2 AND seos = 'sama isik');


    SELECT count(1) INTO @mittekivi
    FROM kirjed
    WHERE mittekivi = '!' AND isikukood NOT IN
        (SELECT isikukood1
         FROM seosed
         WHERE isikukood1 < isikukood2 AND seos = 'sama isik');


    SELECT count(1) INTO @attn
    FROM kirjed
    WHERE attn = '!' AND isikukood NOT IN
        (SELECT isikukood1
         FROM seosed
         WHERE isikukood1 < isikukood2 AND seos = 'sama isik');


    SELECT count(1) INTO @M
    FROM kirjed
    WHERE sugu = 'M' AND isikukood NOT IN
        (SELECT isikukood1
         FROM seosed
         WHERE isikukood1 < isikukood2 AND seos = 'sama isik');


    SELECT count(1) INTO @N
    FROM kirjed
    WHERE sugu = 'N' AND isikukood NOT IN
        (SELECT isikukood1
         FROM seosed
         WHERE isikukood1 < isikukood2 AND seos = 'sama isik');


    SELECT count(1) INTO @S
    FROM seosed
    WHERE isikukood1 < isikukood2;


    INSERT INTO kirjed_stats ( kirjeid, relevantseid, mitterelevantseid,
        kivi, mittekivi, attn, seoseid, M, N)
    SELECT @kirjeid, @rel, @mr, @kivi, @mittekivi, @attn, @S, @M, @N;


END;;
DELIMITER ;

CREATE OR REPLACE EVENT gather_stats
    ON SCHEDULE EVERY 1 HOUR STARTS '2017-11-15 08:00:00'
    ON COMPLETION PRESERVE ENABLE
    DO CALL gather_stats();
