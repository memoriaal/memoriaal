UPDATE r6v1
SET    perenimi = Substring_index(nimi, ',', 1),
       eesnimi = Substring_index(Substring_index(nimi, ',', 2), ',', -1),
       isanimi = IF(Length(nimi) - Length(REPLACE(nimi, ',', '')) > 1,
                           Substring_index(Substring_index(nimi, ',', 3), ',',
                           -1), '')
WHERE  isikukood IS NULL;

UPDATE r6v1 im
SET    eesnimi = IF (eesnimi IS NULL, '', Trim(eesnimi)),
       perenimi = IF (perenimi IS NULL, '', Trim(perenimi)),
       isanimi = IF (isanimi IS NULL, '', Trim(isanimi));

-- ------ --
-- Import --
-- ------ --
-- Update from existing codes
UPDATE r6v1 im
       LEFT JOIN isikud i
              ON i.eesnimi = im.eesnimi
                 AND i.perenimi = im.perenimi
                 AND i.isanimi = im.isanimi
                 AND i.sünniaasta = im.sünniaasta
SET    im.isikukood = i.id
WHERE  im.isikukood IS NULL;

-- Check unidentified records
SELECT Count(1)
FROM   r6v1
WHERE  isikukood IS NULL;

-- Add new well-defined identities
-- sünniaastaga isikutel "piisab" unikaalsuseks aasta, perenimi, eesnimi
INSERT IGNORE
into   isikud
SELECT DISTINCT NULL,
                sünniaasta,
                perenimi,
                eesnimi,
                '',
                ''
FROM            r6v1
WHERE           sünniaasta > 0
AND             isikukood IS NULL;

-- Loose update from existing codes
UPDATE r6v1 im
       LEFT JOIN isikud i
              ON i.eesnimi = im.eesnimi
                 AND i.perenimi = im.perenimi
--                  AND i.sünniaasta = im.sünniaasta
SET    im.isikukood = i.id
WHERE  im.isikukood IS NULL;


-- Get unidentified records of interest
SELECT *
FROM   r6v1
WHERE  isikukood IS NULL
       AND kasHukkunud = 1;
