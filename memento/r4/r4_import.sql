------------
-- Import --
------------
-- Update from existing codes
UPDATE r4 im
       LEFT JOIN isikud i
              ON i.eesnimi = im.eesnimi
                 AND i.perenimi = im.perenimi
                 AND i.sünniaasta = im.sünniaasta
SET    im.isikukood = i.id
WHERE  im.isikukood IS NULL;

-- Check unidentified records
SELECT Count(1)
FROM   r4
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
FROM            r4
WHERE           sünniaasta > 0
AND             isikukood IS NULL;

-- Loose update from existing codes
UPDATE r4 im
       LEFT JOIN isikud i
              ON i.eesnimi = im.eesnimi
                 AND i.perenimi = im.perenimi
--                  AND i.sünniaasta = im.sünniaasta
SET    im.isikukood = i.id
WHERE  im.isikukood IS NULL;


-- Get unidentified records of interest
SELECT *
FROM   r4
WHERE  isikukood IS NULL
       AND kasHukkunud = 1;
