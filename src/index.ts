import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { Hono } from "hono";

import { sign, decode, verify } from "hono/jwt";
import authRouter from "./routes/auth";
import blogRouter from "./routes/blogs";

const app = new Hono<{
  Bindings: {
    DATABASE_URL: string;
    JWT_SECRET: string;
  };
}>();
//middlewares

app.route("/api/v1/auth",authRouter)
app.route("/api/v1/blog",blogRouter)




app.get("/api/v1/blog", async (c) => {
  return c.text("authorized from get")
});
app.post("/api/v1/blog/hello", async (c) => {
  return c.text("authorized from post")
});
app.put("/api/v1/blog/:id", async (c) => {
  return c.text("authorized from put")
});

export default app;
