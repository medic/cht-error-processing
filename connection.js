let connection = function(){
  const { Client } = require('@elastic/elasticsearch')
  //can set auth inside object
  const client = new Client({
    node: 'https://localhost:9200'
  })
  return client
}

module.exports = connection;