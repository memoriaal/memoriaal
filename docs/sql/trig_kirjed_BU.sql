DELIMITER ;;
CREATE OR REPLACE TRIGGER kirjed_BU BEFORE UPDATE ON kirjed FOR EACH ROW BEGIN

    IF !ISNULL(NEW.seos)
    THEN
        IF NEW.seoseliik = '-'
        THEN
            CALL remove_connection(NEW.isikukood, NEW.seos);
        ELSEIF NEW.seoseliik = '!'
        THEN
            SET NEW.seoseliik = '';
            CALL create_connections(NEW.isikukood, NEW.seoseliik, NEW.seos);
        ELSE
            CALL validate_checklist(NEW.isikukood, NEW.seos);
            CALL create_connections(NEW.isikukood, NEW.seoseliik, NEW.seos);
        END IF;

        SET NEW.seos = NULL;
        SET NEW.seoseliik = NULL;
        SET NEW.seosedCSV = '';
    END IF;

    IF NEW.seosedCSV = ''
    THEN
        SELECT group_concat(foo.seos separator '\n')
        FROM (
            SELECT concat(
                s1.isikukood2, ' --> ',
                CASE WHEN s1.seos = '' THEN 'N/A' ELSE s1.seos END, ' --> ',
                s1.isikukood1) as seos
            FROM seosed s1
            WHERE s1.isikukood1 = OLD.isikukood
            UNION ALL
            SELECT concat(
                s2.isikukood2, ' --> ',
                CASE WHEN s2.seos = '' THEN 'N/A' ELSE s2.seos END, ' --> ',
                s2.isikukood1) as seos
            FROM seosed s2
            WHERE s2.isikukood2 = OLD.isikukood
        ) foo INTO @seosedCSV;
        SET NEW.seosedCSV = @seosedCSV;
        IF NEW.seosedCSV = ''
        THEN
            SET NEW.seosedCSV = NULL;
        END IF;
    END IF;

    -- Kivi ja Mittekivi välistavad teineteist
    IF NEW.kivi != OLD.kivi AND NEW.kivi = '!'
    THEN
        SET NEW.mittekivi = '';
        SET NEW.rel = '!';
        SET NEW.mr = '';
    END IF;

    IF NEW.mittekivi = '!' AND OLD.mittekivi = ''
    THEN
        SET NEW.kivi = '';
    END IF;

    -- MR ja REL välistavad teineteist
    IF NEW.rel = '!' AND OLD.rel = ''
    THEN
        SET NEW.mr = '';
    END IF;

    IF NEW.mr = '!' AND OLD.mr = ''
    THEN
        SET NEW.rel = '';
        SET NEW.mittekivi = '!';
        SET NEW.kivi = '';
    END IF;

    IF NEW.kivi != OLD.kivi
    OR NEW.mittekivi != OLD.mittekivi
    OR NEW.mr != OLD.mr
    OR NEW.rel != OLD.rel
    THEN
        SELECT count(1) into @cnt FROM seosed WHERE isikukood1 = NEW.isikukood AND seos = 'sama isik';
        IF @cnt > 0 THEN
            INSERT INTO `z_queue` (`isikukood1`, `isikukood2`, `task`, `params`)
            VALUES (NEW.isikukood, null, 'propagate checklists', '');
        END IF;
    END IF;

    SET NEW.user = user();
END;;
DELIMITER ;
