import { Context, Next } from 'koa';

// Using a custom interface for context state
interface CustomState {
  user?: { id: string; name: string };
}
type CustomContext = Context & { state: CustomState };

export const authMiddleware = async (ctx: CustomContext, next: Next) => {
  const token = ctx.headers.authorization;
  // ... validate token and fetch user ....
  const user = { id: '', name: '' };
  ctx.state.user = user;
  await next();
};
