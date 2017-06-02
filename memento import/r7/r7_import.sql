------------
-- Import --
------------
-- Update from existing codes
UPDATE r7 im
       LEFT JOIN isikud i
              ON i.eesnimi = im.eesnimi
                 AND i.perenimi = im.perenimi
                 AND i.sünniaasta = im.sünniaasta
SET    im.isikukood = i.id
WHERE  im.isikukood IS NULL;

-- Update from existing inter-table links
-- (both directions)
UPDATE r7 AS r71
       LEFT JOIN r7 AS r72
              ON r71.mviide = r72.memento
SET    r71.isikukood = r72.isikukood
WHERE  r71.mviide != ''
       AND r72.isikukood IS NOT NULL
       AND r71.isikukood IS NULL;

UPDATE r7 AS r71
       LEFT JOIN r7 AS r72
              ON r71.memento = r72.mviide
SET    r71.isikukood = r72.isikukood
WHERE  r72.mviide != ''
       AND r72.isikukood IS NOT NULL
       AND r71.isikukood IS NULL;

-- Check unidentified records
SELECT Count(1)
FROM   r7
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
FROM            r7
WHERE           sünniaasta > 0
AND             isikukood IS NULL;


------------
-- Other  --
------------

-- Get unidentified records of interest
SELECT *
FROM   r7
WHERE  isikukood IS NULL
       AND kasHukkunud = 1;


select r71.*, r72.isikukood
from r7 as r71
left join r7 as r72 on r71.mviide = r72.memento
where r71.mviide != ''
and r72.isikukood is not null;

select r7.*
from r7
where r7.mviide != ''
and r7.isikukood is not null;
