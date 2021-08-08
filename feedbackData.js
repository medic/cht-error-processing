const {Client } = require('pg')
const fetchAllRows = async (password) => {
    const client = new Client({
        user: 'ethanr',
        host: 'localhost',
        database: 'pih_malawi',
        password: password,
        port: 63333,
      })
      await client.connect()
      const query = "SELECT * FROM couchdb WHERE doc ->> 'type' = 'feedback' AND (doc -> 'meta' ->> 'time')::timestamp > '2016-04-01'::timestamp limit 10";
      const result = client
      .query(query)
      .finally(()=>{
        client.end();
      });
      return result;
};

module.exports = {fetchAllRows};
