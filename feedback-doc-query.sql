\o ./output/log.jsonl

SELECT * 
FROM couchdb 
WHERE doc ->> 'type' = 'feedback' 
AND (doc -> 'meta' ->> 'time')::timestamp > '2020-01-01'::timestamp limit 250;

\o

