import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";
import { verify } from "hono/jwt";

const blogRouter = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
  Variables: {
    userId: any;
  };
}>();

blogRouter.use("/*", async (c, next) => {
  const token: string = c.req.header("authorization") || "";
  try {
    const resp = await verify(token, c.env.JWT_SECRET);
    if (resp.id) {
      c.set("userId", resp.id);
      await next();
    } else {
      return c.json("unauthorized, please login to continue");
    }
  } catch (error) {
    return c.json({ msg: "unauthorized, please login to continue" });
  }
});

blogRouter.post("/", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  const { title, content } = await c.req.json();
  const authorId = c.get("userId");
  try {
    const post = await prisma.post.create({
      data: {
        title,
        content,
        authorId,
      },
    });
    return c.json({
      msg: "Blog created succesfully",
      id: post.id,
    });
  } catch (error) {
    return c.json({ msg: "Blog creation failed" });
  }
});

blogRouter.get("single/:id", async (c) => {
  const id = c.req.param("id");
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  const singleBlog = await prisma.post.findFirst({
    where: {
      id,
    },
  });

  return c.json(singleBlog);
});

blogRouter.put("/", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  const { id, title, content } = await c.req.json();
  try {
    await prisma.post.update({
      // @ts-ignore  //didn't get a better way to fix this, still learning typescript
      where: {
        id,
      },
      data: {
        title,
        content,
      },
    });
    return c.json({ msg: "updated succesfully" });
  } catch (error) {
    return c.json({ msg: "error while updating blog" });
  }
});

blogRouter.get("/all", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  const blogs = await prisma.post.findMany();
  return c.json(blogs);
});

export default blogRouter;
