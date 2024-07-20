import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";

import { sign, decode, verify } from "hono/jwt";

const app = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
}>();

app.post("/api/v1/signup", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  try {
    const { email, password, name } = await c.req.json();
    //We can de something like checkif user exist is exist return resposen based on that(for now we are return faiel din catch block works well fornow)
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password,
      },
    });
    const token = await sign({ id: user.id }, c.env.JWT_SECRET);
    return c.json({ msg: "user created succesfully", token });
  } catch (error) {
    return c.json({ msg: "user creation failed" });
  }
});

app.post("/api/v1/signin", async (c) => {
  const prisma = new PrismaClient({
    datasourceUrl: c.env.DATABASE_URL,
  }).$extends(withAccelerate());
  const { email, password } = await c.req.json();
  try {
    const userFound = await prisma.user.findFirst({
      where: {
        email,
        password,
      },
    });
    if (userFound === null) {
      return c.json({ msg: "Invalid Credentials" });
    }
    const token = await sign({ id: userFound.id }, c.env.JWT_SECRET);
    return c.json({ msg: "user signed in succesfully", token });
  } catch (error) {}
});

export default app;
