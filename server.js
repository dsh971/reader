import fs from 'fs';
import express from 'express';
import Schema from './data/schema';
import GraphQLHTTP from 'express-graphql';
import {MongoClient} from 'mongodb';

import {graphql} from 'graphql';
import {introspectionQuery} from 'graphql/utilities';

let app = express();

app.use(express.static('public'))

(async () => {
  let db = await MongoClient.connect(process.env.MONGO_URL);  // Wait for the promise to resolve or reject with an error before proceeding ot the next step
  let schema = Schema(db)

  do something with db
    app.use('/graphql', GraphQLHTTP({
      schema,
      graphiql: true
    }));

  app.listen(3000, ()=> console.log('Listening on port 3000'));

  // Generate Schema.json
  let json = await graphql(schema, introspectionQuery); //Need this for hte Babel replay Plugin. Don't do this in production
  fs.writeFile('./data/schema.json', JSON.stringify(json, null, 2), err => {
    if(err) throw err;

    console.log("JSON schema created");
  })

})();

// USing Async await....
// let db;
//
// MongoClient.connect(process.env.MONGO_URL, (err, database) => {
//   if (err) throw err;
//
//   db = database;
//   app.use('/graphql', GraphQLHTTP({
//     schema: schema(db), // passing the db object to schema thus schema.js will be able to access mongodb db object
//     graphiql: true
//   }));
//
//   app.listen(3000, ()=> console.log('Listening on port 3000'));
// });

// app.get("/data/links", (req, res) => {
//   db.collection("links").find({}).toArray((err, links) => {
//     if (err) throw err;
//     res.json(links);
//   })
// });
