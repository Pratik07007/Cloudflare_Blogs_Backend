import { Hono } from "hono";
import { verify } from "hono/jwt";

const blogRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
}>();

blogRouter.use("/*", async (c, next) => {
  const token: string = c.req.header("authorization") || "";
  try {
    const resp = await verify(token, c.env.JWT_SECRET);
    if (resp.id) {
      await next();
    } else {
      return c.json("unauthorized, please login to continue");
    }
  } catch (error) {
    return c.json({ msg: "unauthorized, please login to continue" });
  }
});

export default blogRouter;