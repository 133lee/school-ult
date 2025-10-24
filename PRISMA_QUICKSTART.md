# Prisma Quick Start Guide

## What's Been Set Up

✅ Prisma directory structure created (`/prisma`)
✅ Complete database schema (`/prisma/schema.prisma`)
✅ Prisma Client initialization file (`/lib/prisma.ts`)
✅ Environment configuration files (`.env`, `.env.example`)
✅ Useful npm scripts added to `package.json`
✅ Dependencies installed (`prisma` and `@prisma/client`)

## Next Steps

### 1. Set Up PostgreSQL Database

You need a PostgreSQL database. Choose one option:

**Option A: Local PostgreSQL**
- Download and install: https://www.postgresql.org/download/
- Create a database: `createdb school_management`

**Option B: Cloud Database (Recommended for quick start)**
- [Supabase](https://supabase.com/) - Free tier available
- [Neon](https://neon.tech/) - Serverless Postgres
- [Railway](https://railway.app/) - Easy deployment

### 2. Configure Database Connection

Edit the `.env` file in the project root:

```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
```

Example:
```env
DATABASE_URL="postgresql://postgres:mypassword@localhost:5432/school_management?schema=public"
```

### 3. Generate Prisma Client

```bash
pnpm db:generate
```

This creates the TypeScript types and Prisma Client based on your schema.

### 4. Create Database Tables

**For Development (Recommended first time):**
```bash
pnpm db:push
```

This pushes your schema to the database without creating migrations.

**For Production Setup:**
```bash
pnpm db:migrate
```

Enter a migration name (e.g., "init") when prompted.

### 5. Verify Setup

Open Prisma Studio to visually inspect your database:

```bash
pnpm db:studio
```

Access at: http://localhost:5555

## Usage in Your Application

Import and use the Prisma Client:

```typescript
import { prisma } from '@/lib/prisma'

// Example: Get all students
export async function getStudents() {
  const students = await prisma.student.findMany({
    include: {
      gradeLevel: true,
      parentRelations: {
        include: {
          parent: true
        }
      }
    }
  })
  return students
}

// Example: Create a new student
export async function createStudent(data: any) {
  const student = await prisma.student.create({
    data: {
      studentNumber: 'S2025001',
      firstName: 'John',
      lastName: 'Doe',
      gradeLevelId: 'grade-level-id-here',
      // ... other fields
    }
  })
  return student
}
```

## Available Commands

| Command | Description |
|---------|-------------|
| `pnpm db:generate` | Generate Prisma Client |
| `pnpm db:push` | Push schema changes (dev only) |
| `pnpm db:migrate` | Create and apply migrations |
| `pnpm db:studio` | Open Prisma Studio |
| `pnpm db:seed` | Seed database with initial data |
| `pnpm db:reset` | Reset database (⚠️ deletes all data) |

## Database Schema Highlights

### Core Models
- **User** - Multi-role users (Admin, Teacher, Student, Parent, Staff)
- **Student** - Comprehensive student records
- **GradeLevel** - Zambian education system (Grades 1-12)

### Academic
- **AcademicYear** & **Term** - School calendar
- **Subject** - Subjects by grade level
- **Class** - Class sections
- **Enrollment** - Student-class assignments

### Assessment
- **Assessment** - Exams and tests
- **Grade** - Student grades
- **ReportCard** - Generated reports

### Operations
- **Attendance** - Daily tracking
- **TimetableSlot** - Class schedules
- **DisciplinaryRecord** - Incident management

### System
- **AuditLog** - Complete audit trail
- **Notification** - System notifications
- **SchoolSettings** - School configuration

## Common Issues

### "Can't reach database server"
- Ensure PostgreSQL is running
- Check DATABASE_URL is correct
- Verify firewall/network settings

### "Migration failed"
- Ensure database is empty for first migration
- Check for data conflicts
- Review migration SQL

### "Module not found: @prisma/client"
- Run `pnpm db:generate` to generate the client
- Restart your development server

## Security Notes

⚠️ **IMPORTANT:**
- Never commit `.env` file (it's in `.gitignore`)
- Change default secrets in production
- Use strong database passwords
- Enable SSL for production databases
- Encrypt sensitive data at application level

## Next Steps

1. Set up database seeding (see `/prisma/README.md`)
2. Create API routes using Prisma Client
3. Implement authentication and authorization
4. Set up audit logging
5. Configure backup strategy

## Resources

- [Full Prisma Documentation](./prisma/README.md)
- [Prisma Official Docs](https://www.prisma.io/docs)
- [Next.js + Prisma Best Practices](https://www.prisma.io/docs/guides/other/troubleshooting-orm/help-articles/nextjs-prisma-client-dev-practices)

## Need Help?

Check these files:
- `/prisma/README.md` - Detailed Prisma documentation
- `/prisma/schema.prisma` - Database schema with comments
- `/.env.example` - Environment variable template
