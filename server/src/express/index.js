// import instana from '@instana/collector';
if(false) {
  // eslint-disable-next-line no-undef
  instana({
    tracing: {
      enabled: true,
    },
  });
}
import dotenv from 'dotenv';
dotenv.config()

import { isLocalDev } from "../helpers/logging";
import { Prisma } from '../generated/prisma';

import { makeExecutableSchema } from 'graphql-tools';

import { typeDefs } from '../apiSchema';
import resolvers from '../resolvers';

console.log('PRISMA_ENDPOINT', process.env.PRISMA_ENDPOINT);
const prisma = new Prisma({
  // the endpoint of the Prisma DB service (value is set in .env)
  endpoint: process.env.PRISMA_ENDPOINT,
  // taken from database/prisma.yml (value is set in .env)
  secret: process.env.PRISMA_MANAGEMENT_API_SECRET,
  // log all GraphQL queries & mutations
  debug: true,
});

const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

import { ApolloServer } from 'apollo-server-express';

const server = new ApolloServer({
  schema,
  introspection: isLocalDev,
  playground: isLocalDev,
  debug: true,
  context: req => ({
    ...req,
    prisma
  }),
});

server.express.post(
  server.options.endpoint,
  (req, res, next) => {console.info('snip 8< ------------------------------------------------'); next()},
  (err, req, res, next) => {
    if (err) {
      console.error('JWT token verification check/auth failed!', err);
      return res.status(401).json({ err });
    }
    next();
  }
);

const httpServer = server.createHttpServer({
  // Apollo-server-based tracing:
  // This extends graphql response, and send extra detailed timing info,
  // with overhead, so I disabled it here:
  // tracing: true,
  debug: true,
});

const port = process.env.PORT ?? 5000;

httpServer.listen({ port }, () =>
  console.log(
    `Server with GraphQL server is running on http://localhost:${port}`
  )
);
