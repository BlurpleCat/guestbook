# Guestbook

A simple guestbook web application built with Next.js and DynamoDB. Visitors can sign the guestbook with their name, and entries are displayed in reverse chronological order.

## Project Structure

```
src/
├── app/
│   ├── api/guestbook/
│   │   └── route.ts        # REST API (GET and POST /api/guestbook)
│   ├── layout.tsx           # Root layout with Geist font and global styles
│   ├── page.tsx             # Main guestbook UI (client component)
│   ├── globals.css          # Tailwind CSS and global styles
│   └── favicon.ico
├── lib/
│   └── dynamodb.ts          # DynamoDB client, table setup, and CRUD operations
└── __tests__/
    ├── page.test.tsx        # Component tests for the guestbook page
    └── setup.ts             # Vitest test setup
```

### Frontend — `src/app/page.tsx`

A React client component that renders the sign-up form and the list of guestbook entries. It fetches entries from the API on load and submits new entries via POST. Styled with Tailwind CSS.

### API — `src/app/api/guestbook/route.ts`

A Next.js Route Handler exposing two endpoints:

- **GET /api/guestbook** — Returns all guestbook entries, newest first.
- **POST /api/guestbook** — Accepts `{ firstName, lastName }` and creates a new entry.

### Database — `src/lib/dynamodb.ts`

Manages all DynamoDB interactions using the AWS SDK v3. The table uses a single partition key (`pk = "GUESTBOOK"`) with a sort key composed of a timestamp and UUID for ordering. Key behaviors:

- **Auto-creates the table** on first request if it doesn't exist.
- **Caps entries at 100** by trimming the oldest when the limit is exceeded.

### Tests — `src/__tests__/`

Component-level tests using Vitest, React Testing Library, and jsdom. Tests cover rendering, validation, form submission, and entry display.

## Local Development

### Prerequisites

- Node.js
- Docker (for local DynamoDB)

### Getting Started

1. Start the local DynamoDB instance:

   ```bash
   npm run docker:up
   ```

2. Create a `.env.local` file:

   ```
   DYNAMODB_ENDPOINT=http://localhost:8000
   AWS_REGION=us-east-1
   AWS_ACCESS_KEY_ID=local
   AWS_SECRET_ACCESS_KEY=local
   ```

3. Install dependencies and start the dev server:

   ```bash
   npm install
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000).

### Available Scripts

| Command            | Description                          |
| ------------------ | ------------------------------------ |
| `npm run dev`      | Start the Next.js development server |
| `npm run build`    | Create a production build            |
| `npm start`        | Serve the production build           |
| `npm run lint`     | Run ESLint                           |
| `npm test`         | Run tests once                       |
| `npm run test:watch` | Run tests in watch mode            |
| `npm run docker:up`  | Start DynamoDB Local via Docker    |
| `npm run docker:down`| Stop DynamoDB Local                |

### DynamoDB Admin UI

When Docker is running, a DynamoDB admin interface is available at [http://localhost:8001](http://localhost:8001) for inspecting table data.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS 4
- **Database:** Amazon DynamoDB (local via Docker for development)
- **Testing:** Vitest + React Testing Library
