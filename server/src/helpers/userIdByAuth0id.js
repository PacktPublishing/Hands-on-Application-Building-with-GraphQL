const cache = {};

export function injectUserIdByAuth0id(userId, auth0Id) {
  cache[auth0Id] = userId;
}

export async function userIdByAuth0id(auth0id, fetchUserByAuth0id) {
  let cachedUserId = cache[auth0id];
  if (cachedUserId && !(process.env.OPTIMIZED == 'false')) {
    return cachedUserId;
  }

  const user = await fetchUserByAuth0id({ auth0id });

  if (user) {
    const { id } = user;
    if (id) injectUserIdByAuth0id(id, auth0id);
  }

  return user && user.id;
}
