\o ./output/log.jsonl

SELECT * 
FROM couchdb 
WHERE doc ->> 'type' = 'feedback' 
AND (doc -> 'meta' ->> 'time')::timestamp > '2021-04-01'::timestamp limit 10;

\o