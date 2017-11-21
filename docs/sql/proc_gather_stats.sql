DELIMITER ;;
CREATE OR REPLACE PROCEDURE `gather_stats`()
BEGIN

    SELECT count(1) INTO @kirjeid
    FROM kirjed
    WHERE isikukood NOT IN
        ( SELECT isikukood1
         FROM seosed
         WHERE seos = 'sama isik'
         AND isikukood1 < isikukood2 );

    -- @rel
    SELECT count(1) INTO @rel FROM kirjed
    WHERE rel = '!'
      AND isikukood NOT IN
        ( SELECT DISTINCT s.isikukood1 FROM seosed s
         LEFT JOIN kirjed k1 ON k1.isikukood = s.isikukood1
         LEFT JOIN kirjed k2 ON k2.isikukood = s.isikukood2
         WHERE s.seos = 'sama isik'
         AND k1.rel = '!'
         AND k2.rel = '!'
         AND s.isikukood1 < s.isikukood2 );

    -- @mr
    SELECT count(1) INTO @mr FROM kirjed
    WHERE mr = '!'
      AND isikukood NOT IN
        ( SELECT DISTINCT s.isikukood1 FROM seosed s
         LEFT JOIN kirjed k1 ON k1.isikukood = s.isikukood1
         LEFT JOIN kirjed k2 ON k2.isikukood = s.isikukood2
         WHERE s.seos = 'sama isik'
         AND k1.mr = '!'
         AND k2.mr = '!'
         AND s.isikukood1 < s.isikukood2 );

    -- @kivi
    SELECT count(1) INTO @kivi FROM kirjed
    WHERE kivi = '!'
      AND isikukood NOT IN
        ( SELECT DISTINCT s.isikukood1 FROM seosed s
         LEFT JOIN kirjed k1 ON k1.isikukood = s.isikukood1
         LEFT JOIN kirjed k2 ON k2.isikukood = s.isikukood2
         WHERE s.seos = 'sama isik'
         AND k1.kivi = '!'
         AND k2.kivi = '!'
         AND s.isikukood1 < s.isikukood2 );

    -- @mittekivi
    SELECT count(1) INTO @mittekivi FROM kirjed
    WHERE mittekivi = '!'
      AND isikukood NOT IN
        ( SELECT DISTINCT s.isikukood1 FROM seosed s
         LEFT JOIN kirjed k1 ON k1.isikukood = s.isikukood1
         LEFT JOIN kirjed k2 ON k2.isikukood = s.isikukood2
         WHERE s.seos = 'sama isik'
         AND k1.mittekivi = '!'
         AND k2.mittekivi = '!'
         AND s.isikukood1 < s.isikukood2 );

    -- @attn
    SELECT count(1) INTO @attn FROM kirjed
    WHERE attn = '!'
      AND isikukood NOT IN
        ( SELECT DISTINCT s.isikukood1 FROM seosed s
         LEFT JOIN kirjed k1 ON k1.isikukood = s.isikukood1
         LEFT JOIN kirjed k2 ON k2.isikukood = s.isikukood2
         WHERE s.seos = 'sama isik'
         AND k1.attn = '!'
         AND k2.attn = '!'
         AND s.isikukood1 < s.isikukood2 );

    -- @M
    SELECT count(1) INTO @M FROM kirjed
    WHERE sugu = 'M'
      AND isikukood NOT IN
        ( SELECT DISTINCT s.isikukood1 FROM seosed s
         LEFT JOIN kirjed k1 ON k1.isikukood = s.isikukood1
         LEFT JOIN kirjed k2 ON k2.isikukood = s.isikukood2
         WHERE s.seos = 'sama isik'
         AND k1.sugu = 'M'
         AND k2.sugu = 'M'
         AND s.isikukood1 < s.isikukood2 );

    -- @N
    SELECT count(1) INTO @N FROM kirjed
    WHERE sugu = 'N'
      AND isikukood NOT IN
        ( SELECT DISTINCT s.isikukood1 FROM seosed s
         LEFT JOIN kirjed k1 ON k1.isikukood = s.isikukood1
         LEFT JOIN kirjed k2 ON k2.isikukood = s.isikukood2
         WHERE s.seos = 'sama isik'
         AND k1.sugu = 'N'
         AND k2.sugu = 'N'
         AND s.isikukood1 < s.isikukood2 );

    -- @seoseid
    SELECT count(1) INTO @seoseid
    FROM seosed s
    WHERE s.seos = 'sama isik'
    AND isikukood1 < isikukood2;


    INSERT INTO kirjed_stats ( kirjeid, relevantseid, mitterelevantseid,
        kivi, mittekivi, attn, seoseid, M, N)
    SELECT @kirjeid, @rel, @mr, @kivi, @mittekivi, @attn, @seoseid, @M, @N;


END;;
DELIMITER ;

CREATE OR REPLACE EVENT gather_stats
    ON SCHEDULE EVERY 1 HOUR STARTS '2017-11-15 08:00:00'
    ON COMPLETION PRESERVE ENABLE
    DO CALL gather_stats();
