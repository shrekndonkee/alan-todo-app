# Todo API Documentation



---

## Base URL & Versioning

- **Base URL (example)**: `http://localhost:3000/api`
- **Version**: `v1` (if you version routes: `http://localhost:3000/api/v1`)

> Replace with your actual deployment URL.

---

## Authentication

- **Scheme**: Bearer token (JWT or similar)
- **Header**: `Authorization: Bearer <token>`

> If your API is public or uses a different scheme (cookies, API keys), update this section accordingly.

---

## Content Type

- All requests and responses are **JSON** unless otherwise noted.
- Use header: `Content-Type: application/json`

---

## Data Models

### `Category`

```ts
interface Category {
  id: string
  name: string
}
```

### `Todo`

```ts
interface Todo {
  id: string
  name: string
  status: 'pending' | 'in-progress' | 'completed'
  categoryId: string
  dueDate: string // ISO 8601 in transport; parse to Date on client
}
```

### `CreateTodoInput`

```ts
interface CreateTodoInput {
  name: string
  status?: 'pending' | 'in-progress' | 'completed' // default: 'pending'
  categoryId: string
  dueDate: string // ISO 8601
}
```

---

## Todos

### List Todos

**GET** `/todos`

**Query Parameters (optional):**

- `status` — one of `pending|in-progress|completed`
- `categoryId` — filter by category
- `dueBefore` — ISO date string
- `dueAfter` — ISO date string
- `search` — substring match on name
- `page` — default `1`
- `limit` — default `20`
- `sort` — e.g., `dueDate:asc`, `name:desc`

**Response** `200 OK`

```json
{
  "items": [
    {
      "id": "t_123",
      "name": "Finish homework",
      "status": "pending",
      "categoryId": "c_school",
      "dueDate": "2025-11-05T00:00:00.000Z"
    }
  ],
  "page": 1,
  "limit": 20,
  "total": 1
}
```

**Client mapping**: `fetchAllTodos()` / `getAllTodos()`

---

### Get a Todo (optional if implemented)

**GET** `/todos/:id`

**Response** `200 OK`

```json
{
  "id": "t_123",
  "name": "Finish homework",
  "status": "pending",
  "categoryId": "c_school",
  "dueDate": "2025-11-05T00:00:00.000Z"
}
```

`404 Not Found` if missing

---

### Create Todo

**POST** `/todos`

**Body**

```json
{
  "name": "Finish homework",
  "status": "pending",
  "categoryId": "c_school",
  "dueDate": "2025-11-05"
}
```

**Response** `201 Created`

```json
{
  "id": "t_123",
  "name": "Finish homework",
  "status": "pending",
  "categoryId": "c_school",
  "dueDate": "2025-11-05T00:00:00.000Z"
}
```

**Client mapping**: `createTodoAPI()` / `createTodo()`

---

### Update Todo

**PATCH** `/todos/:id`

**Body (any subset of fields)**

```json
{
  "name": "Finish math homework",
  "status": "in-progress",
  "categoryId": "c_school",
  "dueDate": "2025-11-07"
}
```

**Response** `200 OK`

```json
{
  "id": "t_123",
  "name": "Finish math homework",
  "status": "in-progress",
  "categoryId": "c_school",
  "dueDate": "2025-11-07T00:00:00.000Z"
}
```

**Client mapping**: `updateTodoAPI()` / `editTodo()`

---

### Delete Todo

**DELETE** `/todos/:id`

**Response** `204 No Content`

**Client mapping**: `deleteTodoAPI()` / `deleteTodo()`

---

### Clear Completed Todos

**POST** `/todos/clear-completed`

**Response** `200 OK`

```json
{ "deletedCount": 3 }
```

**Client mapping**: `clearCompletedTodosAPI()` / `clearCompletedTodos()`

---

## Categories

### List Categories

**GET** `/categories`

**Response** `200 OK`

```json
[
  { "id": "c_school", "name": "School" },
  { "id": "c_work", "name": "Work" }
]
```

**Client mapping**: `fetchAllCategories()` / `getAllCategories()`

---

### Create Category

**POST** `/categories`

**Body**

```json
{ "name": "School" }
```

**Response** `201 Created`

```json
{ "id": "c_school", "name": "School" }
```

**Client mapping**: `createCategoryAPI()` / `addCategory()`

---

### Delete Category

**DELETE** `/categories/:id`

**Response** `204 No Content`

**Client mapping**: `deleteCategoryAPI()` / `deleteCategory()`

---

## Request Examples

### cURL

```bash
# List todos
curl -H "Authorization: Bearer $TOKEN" \
     -H "Accept: application/json" \
     "$BASE_URL/todos?status=pending&limit=20"

# Create todo
curl -X POST "$BASE_URL/todos" \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "name": "Finish homework",
       "status": "pending",
       "categoryId": "c_school",
       "dueDate": "2025-11-05"
     }'

# Update todo
curl -X PATCH "$BASE_URL/todos/t_123" \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{ "status": "completed" }'

# Delete todo
curl -X DELETE "$BASE_URL/todos/t_123" \
     -H "Authorization: Bearer $TOKEN"

# Clear completed
curl -X POST "$BASE_URL/todos/clear-completed" \
     -H "Authorization: Bearer $TOKEN"

# List categories
curl -H "Authorization: Bearer $TOKEN" \
     "$BASE_URL/categories"

# Create category
curl -X POST "$BASE_URL/categories" \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{ "name": "School" }'

# Delete category
curl -X DELETE "$BASE_URL/categories/c_school" \
     -H "Authorization: Bearer $TOKEN"
```

### Fetch (TypeScript)

```ts
const BASE_URL = import.meta.env.VITE_API_URL

export async function fetchAllTodos(): Promise<{ items: Todo[]; page: number; limit: number; total: number }>{
  const res = await fetch(`${BASE_URL}/todos`, {
    headers: { 'Authorization': `Bearer ${getToken()}` }
  })
  if (!res.ok) throw await asApiError(res)
  return res.json()
}

export async function createTodoAPI(input: CreateTodoInput): Promise<Todo> {
  const res = await fetch(`${BASE_URL}/todos`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getToken()}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(input)
  })
  if (!res.ok) throw await asApiError(res)
  return res.json()
}
```

> Mirror additional functions (`updateTodoAPI`, `deleteTodoAPI`, etc.) similarly.

---

## Status Codes

- `200 OK` — Successful read/update
- `201 Created` — Resource created
- `204 No Content` — Successful delete
- `400 Bad Request` — Validation/format error
- `401 Unauthorized` — Missing/invalid auth
- `403 Forbidden` — Not allowed
- `404 Not Found` — Missing resource
- `409 Conflict` — Duplicate or state conflict
- `422 Unprocessable Entity` — Field validation failed
- `429 Too Many Requests` — Rate limited
- `500 Internal Server Error` — Unexpected error

---

## Error Format (recommended)

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "dueDate must be a valid ISO date",
    "details": [{ "field": "dueDate", "reason": "invalid" }],
    "requestId": "req_abc123"
  }
}
```

---

## Validation Rules (reference)

### Todo

- `name`: required, 1–200 chars
- `status`: defaults to `pending`; must be one of the enum values
- `categoryId`: required and must reference an existing category
- `dueDate`: required, ISO 8601 date string; server normalizes to UTC

### Category

- `name`: required, 1–100 chars; unique (case-insensitive) per user

---

## Sorting & Pagination (recommended contract)

- `page` (>= 1), `limit` (1–100)
- `sort` supports comma-separated fields with direction, e.g. `sort=dueDate:asc,name:desc`
- Responses include: `items`, `page`, `limit`, `total`

---

## Changelog

- **2025-10-29**: Initial draft aligning with `apiService` functions used by the client.

