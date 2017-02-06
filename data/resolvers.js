import { GraphQLScalarType } from 'graphql';
import { Kind } from 'graphql/language';
import { find, filter } from 'lodash';
import { pubsub } from './subscriptions';
import MongoClient from 'mongodb';
import assert from 'assert';

const mongoUrl = process.env.MONGODB_URI;

let db;
let Players;
let Records;

// Use connect method to connect to the server
MongoClient.connect(mongoUrl, function(err, _db) {
  assert.equal(null, err);
  console.log("Connected successfully to server");
  db = _db;

  Players = db.collection('players');
  Records = db.collection('records');
});

const resolveFunctions = {
  Query: {
    player(_, { userId }) {
      return Players.findOne({ userId });
    },
    topPlayers() {
      return new Promise(function (fulfill, reject) {
        Players.find({})
               .sort({ rating: -1 })
               .limit(3)
               .toArray(function (err, docs) {
                 if (err) reject(err);
                 else fulfill(docs);
               });
      });
    },
    players() {
      return new Promise(function (fulfill, reject) {
        Players.find({})
               .toArray(function (err, docs) {
                 if (err) reject(err);
                 else fulfill(docs);
               });
      });
    },
  },
  Mutation: {
    updatePlayer(_, { userId, username, rating, rank, experience }) {
      const doc = { userId, username, rating, rank, experience, timestamp: new Date() };

      return Records
        .insert(Object.assign({}, doc, { w: 1 })) // insert modifies doc
        .then(function() {
          return Players
            .updateOne({ userId }, doc, { upsert: true, w: 1 } );
        })
        .then(function() {
          return Players
            .findOne({ userId });
        });
    },
  },
  Date: new GraphQLScalarType({
    name: 'Date',
    description: 'Date custom scalar type',
    parseValue(value) {
      return new Date(value); // value from the client
    },
    serialize(value) {
      return value.getTime(); // value sent to the client
    },
    parseLiteral(ast) {
      if (ast.kind === Kind.INT) {
        return parseInt(ast.value, 10); // ast value is always in string format
      }
      return null;
    },
  }),
};

export default resolveFunctions;
