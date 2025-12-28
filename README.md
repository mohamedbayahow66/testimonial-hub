# Testimonial Hub

A SaaS platform for testimonial management and conversion optimization. Collect, clean, verify, and display customer testimonials professionally.

## Tech Stack

- **Frontend**: Next.js 14+ (App Router), TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js v5 (Auth.js)
- **Validation**: Zod

## Features

- 🔐 **Authentication**: Email/password authentication with NextAuth.js
- 📝 **Testimonial Collection**: Create shareable links to collect customer testimonials
- ✨ **AI-Powered Cleaning**: Improve testimonial text while preserving authenticity
- ✅ **Verification Badges**: Add trust with verified customer badges
- 🎨 **Embeddable Widgets**: Create stunning carousels, grids, and lists
- 📊 **Analytics**: Track widget views and testimonial performance

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- npm or yarn

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd testimonial-hub
```

2. **Install dependencies**

```bash
npm install
```

3. **Set up environment variables**

```bash
cp .env.example .env
```

Edit `.env` and fill in your values:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/testimonials"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret-key"
```

Generate a secure secret:

```bash
openssl rand -base64 32
```

4. **Set up the database**

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# (Optional) Seed the database with test data
npx prisma db seed
```

5. **Start the development server**

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Test Credentials

After running the seed script:

- **Email**: test@example.com
- **Password**: TestPass123

## Project Structure

```
├── app/
│   ├── (auth)/           # Auth pages (login, signup)
│   ├── (dashboard)/      # Protected dashboard pages
│   ├── api/              # API routes
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Landing page
├── components/
│   ├── auth/             # Auth form components
│   ├── dashboard/        # Dashboard components
│   └── ui/               # shadcn/ui components
├── hooks/
│   └── use-toast.ts      # Toast notification hook
├── lib/
│   ├── auth.ts           # NextAuth configuration
│   ├── auth-utils.ts     # Auth helper functions
│   ├── db.ts             # Prisma client
│   ├── utils.ts          # Utility functions
│   └── validations.ts    # Zod schemas
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Seed script
├── types/
│   └── next-auth.d.ts    # NextAuth type extensions
└── middleware.ts         # Route protection middleware
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma client
- `npm run db:migrate` - Run database migrations
- `npm run db:push` - Push schema to database
- `npm run db:seed` - Seed the database
- `npm run db:studio` - Open Prisma Studio

## Database Schema

### Models

- **User**: Business owners/admins with subscription tiers
- **Testimonial**: Customer testimonials with status, verification, and media
- **Widget**: Embeddable testimonial display widgets
- **CollectionLink**: Public URLs for collecting testimonials

## API Routes

### Authentication

- `POST /api/auth/signup` - Create new account
- `POST /api/auth/signin` - Sign in (handled by NextAuth)
- `POST /api/auth/signout` - Sign out (handled by NextAuth)

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `NEXTAUTH_URL` | Base URL of your application | Yes |
| `NEXTAUTH_SECRET` | Secret key for session encryption | Yes |

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables
4. Deploy

### Docker

```bash
# Build the image
docker build -t testimonial-hub .

# Run the container
docker run -p 3000:3000 testimonial-hub
```

## License

MIT License - see LICENSE file for details.


