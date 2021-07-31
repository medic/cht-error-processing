\o ./output/log.json

SELECT * 
FROM couchdb 
WHERE doc ->> 'type' = 'feedback' 
AND (doc -> 'meta' ->> 'time')::timestamp > '2016-01-01'::timestamp limit 200;

\o