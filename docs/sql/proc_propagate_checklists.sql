DELIMITER ;;
CREATE or replace PROCEDURE `propagate_checklist`(IN ik1 CHAR(10), IN ik2 CHAR(10))
BEGIN
    DECLARE kivi1, mittekivi1, rel1, mr1 enum('', '!');
    DECLARE kivi2, mittekivi2, rel2, mr2 enum('', '!');

    -- CALL validate_checklist(ik1, ik2);

    SELECT kivi, mittekivi, rel, mr
      INTO kivi1, mittekivi1, rel1, mr1
      FROM kirjed WHERE isikukood = ik1;

    SELECT kivi, mittekivi, rel, mr
      INTO kivi2, mittekivi2, rel2, mr2
      FROM kirjed WHERE isikukood = ik2;

    IF kivi1 != kivi2 OR mittekivi1 != mittekivi2 OR rel1 != rel2 OR mr1 != mr2
    THEN
        UPDATE kirjed
        SET kivi=kivi1, mittekivi=mittekivi1, rel=rel1, mr=mr1
        WHERE isikukood = ik2;
    END IF;

END;;
DELIMITER ;

DELIMITER ;;
CREATE OR REPLACE PROCEDURE `propagate_checklists`(IN ik1 CHAR(10))
BEGIN
    DECLARE ik2 CHAR(10);
    DECLARE finished INTEGER DEFAULT 0;

    DECLARE cur1 CURSOR FOR
        SELECT isikukood2 FROM seosed WHERE isikukood1 = ik1 AND seos = 'sama isik';
    DECLARE CONTINUE HANDLER FOR NOT FOUND SET finished = 1;

    OPEN cur1;
    read_loop: LOOP
        FETCH cur1 INTO ik2;
        IF finished = 1 THEN
            LEAVE read_loop;
        END IF;
        INSERT INTO `z_queue` (`isikukood1`, `isikukood2`, `task`, `params`)
        VALUES (ik1, ik2, 'propagate checklist', '');

    END LOOP;
    CLOSE cur1;
    SET finished = 0;
END;;
DELIMITER ;
