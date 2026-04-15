import { Router, type IRouter } from "express";
import { eq, sql, desc } from "drizzle-orm";
import { db, todosTable } from "@workspace/db";
import {
  ListTodosQueryParams,
  ListTodosResponse,
  CreateTodoBody,
  UpdateTodoParams,
  UpdateTodoBody,
  UpdateTodoResponse,
  DeleteTodoParams,
  GetTodoSummaryResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/todos", async (req, res): Promise<void> => {
  const query = ListTodosQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }

  const status = query.data.status ?? "all";

  let whereClause;
  if (status === "active") {
    whereClause = eq(todosTable.completed, false);
  } else if (status === "completed") {
    whereClause = eq(todosTable.completed, true);
  }

  const todos = whereClause
    ? await db.select().from(todosTable).where(whereClause).orderBy(desc(todosTable.createdAt))
    : await db.select().from(todosTable).orderBy(desc(todosTable.createdAt));

  res.json(ListTodosResponse.parse(todos));
});

router.post("/todos", async (req, res): Promise<void> => {
  const parsed = CreateTodoBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [todo] = await db.insert(todosTable).values(parsed.data).returning();
  res.status(201).json(UpdateTodoResponse.parse(todo));
});

router.patch("/todos/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = UpdateTodoParams.safeParse({ id: rawId });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateTodoBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [todo] = await db
    .update(todosTable)
    .set(parsed.data)
    .where(eq(todosTable.id, params.data.id))
    .returning();

  if (!todo) {
    res.status(404).json({ error: "Todo not found" });
    return;
  }

  res.json(UpdateTodoResponse.parse(todo));
});

router.delete("/todos/:id", async (req, res): Promise<void> => {
  const rawId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const params = DeleteTodoParams.safeParse({ id: rawId });
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [todo] = await db
    .delete(todosTable)
    .where(eq(todosTable.id, params.data.id))
    .returning();

  if (!todo) {
    res.status(404).json({ error: "Todo not found" });
    return;
  }

  res.sendStatus(204);
});

router.get("/todos/summary", async (_req, res): Promise<void> => {
  const [result] = await db
    .select({
      total: sql<number>`count(*)::int`,
      active: sql<number>`count(*) filter (where not ${todosTable.completed})::int`,
      completed: sql<number>`count(*) filter (where ${todosTable.completed})::int`,
    })
    .from(todosTable);

  res.json(GetTodoSummaryResponse.parse(result));
});

export default router;
