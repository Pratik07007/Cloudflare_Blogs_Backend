import { Hono } from "hono";
import authRouter from "./routes/auth";
import blogRouter from "./routes/blogs";

const app = new Hono();

app.route("/api/v1/auth", authRouter);
app.route("/api/v1/blog", blogRouter);

export default app;
