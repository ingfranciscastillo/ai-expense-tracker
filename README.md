# AI Expense Tracker

An intelligent expense tracking application with AI-powered receipt processing, budget management, and comprehensive analytics.

## Features

- **Expense Management**: Create, edit, and delete expenses with categories, payment methods, and tax deductions
- **AI Receipt Processing**: Upload receipts and let AI extract merchant, amount, and category automatically
- **Budget Tracking**: Set monthly budgets per category or global budgets with visual progress indicators
- **Dark/Light Mode**: Full theme support with system preference detection
- **Responsive Design**: Works seamlessly on desktop and mobile devices

## Tech Stack

- **Framework**: Next.js 16 with App Router
- **Language**: TypeScript
- **Database**: Neon Serverless PostgreSQL with Drizzle ORM
- **Authentication**: Better Auth
- **Forms**: TanStack Form with Zod validation
- **Data Fetching**: TanStack Query
- **UI**: shadcn/ui with Tailwind CSS v4
- **Icons**: Hugeicons
- **AI**: AI SDK with Groq for receipt processing
- **File Storage**: Cloudinary for receipt images
- **Date Handling**: date-fns with Spanish locale

## Prerequisites

- Node.js 18+
- Neon database account
- Groq API key (for AI features)
- Cloudinary account (for file uploads)

## Setup

### 1. Clone and Install

```bash
npm install
```

### 2. Environment Variables

Create a `.env` file in the root directory:

```env
# Database (Neon)
DATABASE_URL=your_neon_connection_string

# Auth (Better Auth)
BETTER_AUTH_SECRET=your_secret_key
BETTER_AUTH_URL=http://localhost:3000

# AI (Groq)
GROQ_API_KEY=your_groq_api_key

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your_upload_preset
```

### 3. Database Setup

```bash
# Generate Drizzle migrations
npm run db:generate

# Run migrations
npm run db:migrate

# (Optional) Open database studio
npm run db:studio
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
app/
├── dashboard/           # Protected dashboard routes
│   ├── budgets/       # Budget management
│   ├── expenses/      # Expense management
│   ├── receipts/     # Receipt upload and review
│   ├── reports/      # Analytics and reports
│   └── settings/     # User settings
├── api/              # API routes
├── lib/
│   ├── actions/      # Server actions
│   ├── auth-client/  # Auth client
│   ├── db/          # Database schema and config
│   ├── queries/     # TanStack Query hooks
│   └── validations/  # Zod schemas
└── providers.tsx     # React providers (QueryClient, etc.)
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:generate` | Generate Drizzle migrations |
| `npm run db:migrate` | Run database migrations |
| `npm run db:studio` | Open Drizzle Studio |

## Key Features Implementation

### Expense Creation

Expenses can be created manually or from uploaded receipts. Each expense includes:
- Merchant name
- Description
- Date
- Amount and currency
- Category (10 predefined categories)
- Payment method
- Tax deductibility

### Receipt Upload & AI Processing

1. Upload receipt image (supports JPG, PNG, PDF)
2. AI extracts: merchant, date, amount, category
3. User reviews and confirms extracted data
4. Creates expense from receipt

### Budget Tracking

- Set monthly budgets per category
- Global budgets apply to all categories
- Visual progress bar with color indicators:
  - Green: < 80% used
  - Yellow: 80-90% used
  - Red: > 90% used

## Database Schema

Main tables:
- `users` - User accounts
- `expenses` - Individual expense records
- `budgets` - Monthly budget limits
- `receipts` - Uploaded receipt metadata
- `alerts` - Budget warning notifications

## Contributing

This is a personal project. For internal modifications:

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Create a pull request

## License

Private - All rights reserved
