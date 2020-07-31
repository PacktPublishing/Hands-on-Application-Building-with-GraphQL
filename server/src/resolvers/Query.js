import { getUserId, verifyAuth0HeaderToken, verifyUserIsAuthenticated } from './utils';
import { injectUserIdByAuth0id } from '../helpers/userIdByAuth0id';
import { createNewUser } from '../helpers/registerNewUser';
import { isLocalDev } from '../helpers/logging';

const Query = {
  async board(parent, { where }, ctx, info) {
    if (process.env.OPTIMIZED == 'false') {
      await getUserId(ctx);
    }
    else {
      await verifyUserIsAuthenticated(ctx);
    }
    const { prisma } = ctx;
    return prisma.board(where, info);
  },

  async list(parent, { where }, ctx, info) {
    if (process.env.OPTIMIZED == 'false') {
      await getUserId(ctx);
    }
    else {
      await verifyUserIsAuthenticated(ctx);
    }
    const { prisma } = ctx;
    return prisma.list(where, info);
  },

  me: async function(parent, args, ctx) {
    if (process.env.OPTIMIZED == 'false') {
      const userId = await getUserId(ctx);
      const { prisma } = ctx;
      const user = await prisma.user({ id: userId });
      return user;
    }


    const userToken = await verifyAuth0HeaderToken(
      ctx
    );
    const auth0id = userToken.sub.split('|')[1];

    const { prisma } = ctx;
    const user = await prisma.user({ auth0id });
    if (user) {
      if (user.id) {
        injectUserIdByAuth0id(user.id, auth0id);
      }
      return user;
    }

    const u = await createNewUser(userToken, prisma.createUser);

    if (isLocalDev)
      console.log('created prisma user:', u);

    if (u && u.id) {
      injectUserIdByAuth0id(u.id, auth0id);
    }
    return u;
  },
};

export default Query;
