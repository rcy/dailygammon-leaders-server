import { makeExecutableSchema } from 'graphql-tools';

import resolvers from './resolvers';

const schema = `
scalar Date

type Record {
  _id: String!
  userId: Int!
  username: String!
  rating: Int!
  experienc: Int!
  rank: Int!
  timestamp: Date
}

type Player {
  _id: String!
  userId: Int!
  username: String!
  rating: Int!
  experienc: Int!
  rank: Int!
  timestamp: Date
}

type Query {
  player(userId: Int!): Player
  players: [Player]
  topPlayers: [Player]
}

type Mutation {
  updatePlayer(
    userId: Int!
    username: String!
    rating: Int!
    rank: Int!
    experience: Int!
  ): Player
}
`;

export default makeExecutableSchema({
  typeDefs: schema,
  resolvers,
});
