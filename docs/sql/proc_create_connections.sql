DELIMITER ;;
CREATE or replace PROCEDURE `create_connections`(IN ik1 CHAR(10), IN seoseliik VARCHAR(50), IN ik2 CHAR(10))
BEGIN
    DECLARE msg VARCHAR(200);

    IF ik1 = ik2 THEN
        SELECT CONCAT( 'Ei hakka iseenda vahel seost looma, nuh.' ) INTO msg;
        SIGNAL SQLSTATE '03100' SET MESSAGE_TEXT = msg;
    END IF;

    IF seoseliik = '' OR seoseliik IS NULL THEN
        SET seoseliik = 'sama isik';
    END IF;

    IF seoseliik = 'sama isik' THEN
        -- CALL validate_checklist(ik1, ik2);
        INSERT INTO `z_queue` (`isikukood1`, `isikukood2`, `task`, `params`)
        VALUES (ik1, ik2, 'propagate checklist', '');
    END IF;

    IF seoseliik = 'sama isik' OR seoseliik = 'kahtlusseos' OR seoseliik = 'abikaasa' THEN
        INSERT IGNORE INTO seosed
            SET isikukood1 = ik1, seos = seoseliik, vastasseos = seoseliik, isikukood2 = ik2;
        INSERT IGNORE INTO seosed
            SET isikukood1 = ik2, seos = seoseliik, vastasseos = seoseliik, isikukood2 = ik1;
    ELSE
        INSERT IGNORE INTO seosed
            SET isikukood1 = ik1, seos = seoseliik, isikukood2 = ik2;
        INSERT IGNORE INTO seosed
            SET isikukood1 = ik2, vastasseos = seoseliik, isikukood2 = ik1;
    END IF;

END;;
DELIMITER ;
