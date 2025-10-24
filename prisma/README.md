# Prisma Database Setup

This directory contains the Prisma schema and database configuration for the Zambian School Management System.

## Directory Structure

```
prisma/
├── schema.prisma      # Database schema definition
└── README.md          # This file
```

## Prerequisites

1. **PostgreSQL Database**: Ensure you have PostgreSQL installed and running
   - Download from: https://www.postgresql.org/download/
   - Or use a cloud provider (Supabase, Neon, Railway, etc.)

2. **Environment Variables**: Configure your database connection in `.env`

## Initial Setup

### 1. Configure Database Connection

Create or update the `.env` file in the project root:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
```

Example for local development:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/school_management?schema=public"
```

### 2. Generate Prisma Client

Generate the Prisma Client to use in your application:

```bash
pnpm db:generate
```

### 3. Create the Database Schema

**Option A: Using Prisma Migrate (Recommended for Production)**

Create and apply migrations:
```bash
pnpm db:migrate
```

This will:
- Create a new migration file in `prisma/migrations/`
- Apply the migration to your database
- Generate the Prisma Client

**Option B: Using Prisma DB Push (Development Only)**

For rapid prototyping without migrations:
```bash
pnpm db:push
```

⚠️ Note: `db:push` is useful for development but doesn't create migration history.

## Available Scripts

All scripts are defined in `package.json` and prefixed with `db:`:

- `pnpm db:generate` - Generate Prisma Client
- `pnpm db:push` - Push schema changes to database (no migrations)
- `pnpm db:migrate` - Create and apply migrations
- `pnpm db:migrate:deploy` - Deploy migrations (production)
- `pnpm db:seed` - Seed the database with initial data
- `pnpm db:studio` - Open Prisma Studio (visual database browser)
- `pnpm db:reset` - Reset database and re-run migrations

## Prisma Studio

Prisma Studio provides a visual interface to view and edit your database:

```bash
pnpm db:studio
```

Open http://localhost:5555 in your browser.

## Schema Overview

The schema includes comprehensive models for:

### Core Entities
- **Users** - Admin, Teachers, Parents, Staff with role-based access
- **Students** - Student records with academic and medical information
- **GradeLevels** - Grade 1-12 with Primary/Junior/Senior categorization

### Academic Management
- **AcademicYear** & **Term** - School calendar management
- **Subjects** - Subject definitions by grade level
- **Classes** - Class sections and management
- **Enrollments** - Student-class-subject assignments

### Assessment & Grading
- **AssessmentType** - Different assessment categories
- **Assessment** - Specific assessments/exams
- **Grade** - Individual student grades
- **ReportCard** - Generated report cards

### Operational
- **Attendance** - Daily attendance tracking
- **TimetableSlot** - Class schedules
- **DisciplinaryRecord** - Incident tracking
- **Notification** - System notifications

### Configuration
- **SchoolSettings** - School-wide configuration
- **GradingConfig** - Grading system per grade level

### Security & Audit
- **UserSession** - Session management
- **AuditLog** - All system changes
- **SystemLog** - Application logs

## Database Migrations

### Creating a New Migration

After modifying `schema.prisma`:

```bash
pnpm db:migrate
```

You'll be prompted to name the migration. Use descriptive names:
- `add_student_medical_fields`
- `create_attendance_table`
- `update_grading_config`

### Applying Migrations in Production

```bash
pnpm db:migrate:deploy
```

### Rolling Back

To undo the last migration:
```bash
pnpm db:reset
```

⚠️ Warning: This will delete all data!

## Best Practices

### Development Workflow

1. Modify `schema.prisma`
2. Run `pnpm db:migrate` to create migration
3. Test the changes locally
4. Commit both schema and migration files
5. Deploy to production with `pnpm db:migrate:deploy`

### Security Considerations

- **Never commit `.env`** - It's in `.gitignore`
- **Use strong database passwords**
- **Limit database user permissions** in production
- **Enable SSL** for production database connections
- **Encrypt sensitive fields** at application level (medical data, 2FA secrets)

### Performance Tips

1. **Indexes**: The schema includes strategic indexes for common queries
2. **Connections**: Use connection pooling in production
3. **Soft Deletes**: Most models use `deletedAt` instead of hard deletes
4. **Optimistic Locking**: `version` field prevents concurrent update conflicts

## Seeding the Database

Create a seed file at `prisma/seed.ts`:

```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Create grade levels
  await prisma.gradeLevel.createMany({
    data: [
      { name: 'Grade 1', code: 'G1', numericLevel: 1, category: 'PRIMARY', sortOrder: 1 },
      { name: 'Grade 2', code: 'G2', numericLevel: 2, category: 'PRIMARY', sortOrder: 2 },
      // ... more grades
    ]
  })

  // Create academic year
  const academicYear = await prisma.academicYear.create({
    data: {
      name: '2025',
      startDate: new Date('2025-01-15'),
      endDate: new Date('2025-12-15'),
      isCurrent: true,
    }
  })

  console.log('Seed data created successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
```

Then add to `package.json`:
```json
"prisma": {
  "seed": "tsx prisma/seed.ts"
}
```

Run with:
```bash
pnpm db:seed
```

## Troubleshooting

### Connection Issues

**Error: Can't reach database server**
- Check if PostgreSQL is running
- Verify DATABASE_URL in `.env`
- Check firewall settings

**Error: Authentication failed**
- Verify username and password
- Check database user permissions

### Migration Issues

**Error: Migration failed to apply cleanly**
- Check for conflicting data
- Review migration SQL
- Consider manual fixes before retry

**Error: Database schema drift**
- Run `pnpm db:push` to sync without migrations (dev only)
- Or create a new migration to fix drift

### Schema Issues

**Error: Invalid Prisma Schema**
- Validate syntax in schema.prisma
- Check for missing relations
- Ensure unique constraints are valid

## Using Prisma Client in Your App

Import the singleton instance:

```typescript
import { prisma } from '@/lib/prisma'

// Query examples
const users = await prisma.user.findMany()
const student = await prisma.student.findUnique({
  where: { studentNumber: 'S2025001' },
  include: { gradeLevel: true }
})
```

## Resources

- [Prisma Documentation](https://www.prisma.io/docs)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Prisma Client API](https://www.prisma.io/docs/reference/api-reference/prisma-client-reference)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

## Support

For issues specific to this schema:
1. Check existing migrations in `prisma/migrations/`
2. Review the schema comments in `schema.prisma`
3. Consult the main project documentation
