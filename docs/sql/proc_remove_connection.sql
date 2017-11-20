DELIMITER ;;
CREATE OR REPLACE PROCEDURE remove_connection(IN ik1 CHAR(10), IN ik2 CHAR(10))
BEGIN
    DELETE FROM seosed
    WHERE isikukood1 = ik1 AND isikukood2 = ik2;
    DELETE FROM seosed
    WHERE isikukood1 = ik2 AND isikukood2 = ik1;
END;;
DELIMITER ;
