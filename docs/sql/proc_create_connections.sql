DELIMITER ;;
CREATE or replace PROCEDURE `create_connections`(IN ik1 CHAR(10), IN seoseliik VARCHAR(50), IN ik2 CHAR(10))
BEGIN
    DECLARE msg VARCHAR(200);
    DECLARE _ik1 CHAR(10);
    DECLARE _ik2 CHAR(10);
    DECLARE finished INTEGER DEFAULT 0;

    DECLARE cur1 CURSOR FOR
        SELECT n_ik1, n_ik2
        FROM
          (SELECT isikukood2 AS n_ik1
           FROM seosed
           WHERE isikukood1 = ik1
             AND seos = 'sama isik'
           UNION ALL SELECT ik1) j1
        LEFT JOIN
          (SELECT isikukood2 AS n_ik2
           FROM seosed
           WHERE isikukood1 = ik2
             AND seos = 'sama isik'
           UNION ALL SELECT ik2) j2 ON 1=1 ;
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET finished = 1;

    IF ik1 = ik2 THEN
        SELECT CONCAT( 'Ei hakka iseenda vahel seost looma, nuh.' ) INTO msg;
        SIGNAL SQLSTATE '03100' SET MESSAGE_TEXT = msg;
    END IF;

    IF seoseliik = '' OR seoseliik IS NULL THEN
        SET seoseliik = 'sama isik';
    END IF;

    IF seoseliik = 'sama isik' OR seoseliik = 'kahtlusseos' OR seoseliik = 'abikaasa' THEN
        SET @vastasseos = seoseliik;
    ELSE
        SET @vastasseos = NULL;
    END IF;

    OPEN cur1;
    read_loop: LOOP
        FETCH cur1 INTO _ik1, _ik2;
        IF finished = 1 THEN
            LEAVE read_loop;
        END IF;

        IF seoseliik = 'sama isik' THEN
            -- CALL validate_checklist(ik1, ik2);
            INSERT INTO `z_queue` (`isikukood1`, `isikukood2`, `task`, `params`)
            VALUES (_ik1, _ik2, 'propagate checklist', '');
        END IF;

        INSERT IGNORE INTO seosed
            SET isikukood1 = _ik1, seos = seoseliik, vastasseos = @vastasseos, isikukood2 = _ik2;
        INSERT IGNORE INTO seosed
            SET isikukood1 = _ik2, seos = @vastasseos, vastasseos = seoseliik, isikukood2 = _ik1;

    END LOOP;
    CLOSE cur1;
    SET finished = 0;

END;;
DELIMITER ;
