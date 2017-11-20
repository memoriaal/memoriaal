DELIMITER ;;
CREATE or replace PROCEDURE `validate_checklist`(IN ik1 CHAR(10), IN ik2 CHAR(10))
BEGIN
    DECLARE kivi1, mittekivi1, attn1, rel1, mr1 enum('', '!');
    DECLARE kivi2, mittekivi2, attn2, rel2, mr2 enum('', '!');
    DECLARE msg VARCHAR(200);
    
    SELECT kivi, mittekivi, attn, rel, mr
      INTO kivi1, mittekivi1, attn1, rel1, mr1
      FROM kirjed WHERE isikukood = ik1;
    SELECT kivi, mittekivi, attn, rel, mr
      INTO kivi2, mittekivi2, attn2, rel2, mr2
      FROM kirjed WHERE isikukood = ik2;

    IF kivi1 = '!' AND mittekivi2 = '!' THEN
        SELECT CONCAT( 'Kirjed konfliktivad, sest ', 
            ik2, ' on MITTEKIVI, ', 
            ik1, ' on KIVI' ) INTO msg;
        SIGNAL SQLSTATE '03100' SET MESSAGE_TEXT = msg;
    ELSEIF kivi2 = '!' AND mittekivi1 = '!' THEN
        SELECT CONCAT( 'Kirjed konfliktivad, sest ', 
            ik1, ' on MITTEKIVI, aga ', ik2, ' on KIVI.' ) INTO msg;
        SIGNAL SQLSTATE '03100' SET MESSAGE_TEXT = msg;
        
    ELSEIF kivi1 = '!' AND mr2 = '!' THEN
        SELECT CONCAT( 'Kirjed konfliktivad, sest ', 
            ik1, ' on KIVI, aga ', ik2, ' on MR.' ) INTO msg;
        SIGNAL SQLSTATE '03100' SET MESSAGE_TEXT = msg;
    ELSEIF kivi2 = '!' AND mr1 = '!' THEN
        SELECT CONCAT( 'Kirjed konfliktivad, sest ', 
            ik1, ' on MR, aga ', ik2, ' on KIVI.' ) INTO msg;
        SIGNAL SQLSTATE '03100' SET MESSAGE_TEXT = msg;

    ELSEIF rel1 = '!' AND mr2 = '!' THEN
        SELECT CONCAT( 'Kirjed konfliktivad, sest ', 
            ik1, ' on REL, aga ', ik2, ' on MR.' ) INTO msg;
        SIGNAL SQLSTATE '03100' SET MESSAGE_TEXT = msg;
    ELSEIF rel2 = '!' AND mr1 = '!' THEN
        SELECT CONCAT( 'Kirjed konfliktivad, sest ', 
            ik1, ' on MR, aga ', ik2, ' on REL.' ) INTO msg;
        SIGNAL SQLSTATE '03100' SET MESSAGE_TEXT = msg;

    END IF;
END;;
DELIMITER ;