import { PrismaClient, Role, Gender, BloodType } from '@prisma/client'
import * as crypto from 'crypto'

const prisma = new PrismaClient()

// Helper function to hash passwords (use bcrypt in production)
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex')
}

async function main() {
  console.log('🌱 Starting database seed...')

  // =============================================
  // 1. CREATE GRADE LEVELS
  // =============================================
  console.log('📚 Creating grade levels...')

  const gradeLevels = await Promise.all([
    // Primary School (Grades 1-7)
    prisma.gradeLevel.upsert({
      where: { code: 'G1' },
      update: {},
      create: { name: 'Grade 1', code: 'G1', numericLevel: 1, category: 'PRIMARY', sortOrder: 1 }
    }),
    prisma.gradeLevel.upsert({
      where: { code: 'G2' },
      update: {},
      create: { name: 'Grade 2', code: 'G2', numericLevel: 2, category: 'PRIMARY', sortOrder: 2 }
    }),
    prisma.gradeLevel.upsert({
      where: { code: 'G3' },
      update: {},
      create: { name: 'Grade 3', code: 'G3', numericLevel: 3, category: 'PRIMARY', sortOrder: 3 }
    }),
    prisma.gradeLevel.upsert({
      where: { code: 'G4' },
      update: {},
      create: { name: 'Grade 4', code: 'G4', numericLevel: 4, category: 'PRIMARY', sortOrder: 4 }
    }),
    prisma.gradeLevel.upsert({
      where: { code: 'G5' },
      update: {},
      create: { name: 'Grade 5', code: 'G5', numericLevel: 5, category: 'PRIMARY', sortOrder: 5 }
    }),
    prisma.gradeLevel.upsert({
      where: { code: 'G6' },
      update: {},
      create: { name: 'Grade 6', code: 'G6', numericLevel: 6, category: 'PRIMARY', sortOrder: 6 }
    }),
    prisma.gradeLevel.upsert({
      where: { code: 'G7' },
      update: {},
      create: { name: 'Grade 7', code: 'G7', numericLevel: 7, category: 'PRIMARY', sortOrder: 7 }
    }),

    // Junior Secondary (Grades 8-9)
    prisma.gradeLevel.upsert({
      where: { code: 'G8' },
      update: {},
      create: { name: 'Grade 8', code: 'G8', numericLevel: 8, category: 'JUNIOR', sortOrder: 8 }
    }),
    prisma.gradeLevel.upsert({
      where: { code: 'G9' },
      update: {},
      create: { name: 'Grade 9', code: 'G9', numericLevel: 9, category: 'JUNIOR', sortOrder: 9 }
    }),

    // Senior Secondary (Grades 10-12)
    prisma.gradeLevel.upsert({
      where: { code: 'G10' },
      update: {},
      create: { name: 'Grade 10', code: 'G10', numericLevel: 10, category: 'SENIOR', sortOrder: 10 }
    }),
    prisma.gradeLevel.upsert({
      where: { code: 'G11' },
      update: {},
      create: { name: 'Grade 11', code: 'G11', numericLevel: 11, category: 'SENIOR', sortOrder: 11 }
    }),
    prisma.gradeLevel.upsert({
      where: { code: 'G12' },
      update: {},
      create: { name: 'Grade 12', code: 'G12', numericLevel: 12, category: 'SENIOR', sortOrder: 12 }
    }),
  ])

  console.log(`✅ Created ${gradeLevels.length} grade levels`)

  // =============================================
  // 2. CREATE ACADEMIC YEAR
  // =============================================
  console.log('📅 Creating academic year...')

  const academicYear = await prisma.academicYear.upsert({
    where: { name: '2025' },
    update: {},
    create: {
      name: '2025',
      startDate: new Date('2025-01-15'),
      endDate: new Date('2025-12-15'),
      isCurrent: true,
      description: 'Academic Year 2025'
    }
  })

  console.log(`✅ Created academic year: ${academicYear.name}`)

  // =============================================
  // 3. CREATE TERMS
  // =============================================
  console.log('📆 Creating terms...')

  const terms = await Promise.all([
    prisma.term.upsert({
      where: {
        academicYearId_number: {
          academicYearId: academicYear.id,
          number: 1
        }
      },
      update: {},
      create: {
        academicYearId: academicYear.id,
        name: 'Term 1',
        number: 1,
        startDate: new Date('2025-01-15'),
        endDate: new Date('2025-04-15'),
        isCurrent: true
      }
    }),
    prisma.term.upsert({
      where: {
        academicYearId_number: {
          academicYearId: academicYear.id,
          number: 2
        }
      },
      update: {},
      create: {
        academicYearId: academicYear.id,
        name: 'Term 2',
        number: 2,
        startDate: new Date('2025-05-01'),
        endDate: new Date('2025-08-15'),
        isCurrent: false
      }
    }),
    prisma.term.upsert({
      where: {
        academicYearId_number: {
          academicYearId: academicYear.id,
          number: 3
        }
      },
      update: {},
      create: {
        academicYearId: academicYear.id,
        name: 'Term 3',
        number: 3,
        startDate: new Date('2025-09-01'),
        endDate: new Date('2025-12-15'),
        isCurrent: false
      }
    })
  ])

  console.log(`✅ Created ${terms.length} terms`)

  // =============================================
  // 4. CREATE ASSESSMENT TYPES
  // =============================================
  console.log('📝 Creating assessment types...')

  const assessmentTypes = await Promise.all([
    prisma.assessmentType.upsert({
      where: { code: 'CA1' },
      update: {},
      create: {
        name: 'Continuous Assessment 1',
        code: 'CA1',
        description: 'First continuous assessment',
        weight: 0.15,
        sortOrder: 1,
        minScore: 0,
        maxScore: 100,
        passingScore: 50,
        showOnReportCard: true,
        isMandatory: true
      }
    }),
    prisma.assessmentType.upsert({
      where: { code: 'CA2' },
      update: {},
      create: {
        name: 'Continuous Assessment 2',
        code: 'CA2',
        description: 'Second continuous assessment',
        weight: 0.15,
        sortOrder: 2,
        minScore: 0,
        maxScore: 100,
        passingScore: 50,
        showOnReportCard: true,
        isMandatory: true
      }
    }),
    prisma.assessmentType.upsert({
      where: { code: 'MIDTERM' },
      update: {},
      create: {
        name: 'Mid-Term Exam',
        code: 'MIDTERM',
        description: 'Mid-term examination',
        weight: 0.30,
        sortOrder: 3,
        minScore: 0,
        maxScore: 100,
        passingScore: 50,
        showOnReportCard: true,
        isMandatory: true
      }
    }),
    prisma.assessmentType.upsert({
      where: { code: 'FINAL' },
      update: {},
      create: {
        name: 'Final Exam',
        code: 'FINAL',
        description: 'Final examination',
        weight: 0.40,
        sortOrder: 4,
        minScore: 0,
        maxScore: 100,
        passingScore: 50,
        showOnReportCard: true,
        isMandatory: true
      }
    })
  ])

  console.log(`✅ Created ${assessmentTypes.length} assessment types`)

  // =============================================
  // 5. CREATE ADMIN USER
  // =============================================
  console.log('👤 Creating admin user...')

  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@school.zm' },
    update: {},
    create: {
      email: 'admin@school.zm',
      passwordHash: hashPassword('Admin@123'), // Change in production!
      firstName: 'System',
      lastName: 'Administrator',
      role: Role.ADMIN,
      isActive: true,
      isVerified: true,
      phone: '+260-XXX-XXXXXX'
    }
  })

  console.log(`✅ Created admin user: ${adminUser.email}`)

  // =============================================
  // 6. CREATE SCHOOL SETTINGS
  // =============================================
  console.log('🏫 Creating school settings...')

  const schoolSettings = await prisma.schoolSettings.upsert({
    where: { schoolCode: 'ZMSCH001' },
    update: {},
    create: {
      schoolName: 'Sample Zambian School',
      schoolCode: 'ZMSCH001',
      address: 'Lusaka, Zambia',
      phone: '+260-XXX-XXXXXX',
      email: 'info@school.zm',
      website: 'https://school.zm',
      motto: 'Excellence in Education',
      establishedYear: 2000,
      currentAcademicYearId: academicYear.id,
      currentTermId: terms[0].id,
      timezone: 'Africa/Lusaka',
      currency: 'ZMW',
      enableNotifications: true,
      enableEmail: true,
      enableSMS: false
    }
  })

  console.log(`✅ Created school settings: ${schoolSettings.schoolName}`)

  // =============================================
  // 7. CREATE SAMPLE SUBJECTS (Grade 1 only for example)
  // =============================================
  console.log('📖 Creating sample subjects...')

  const grade1 = gradeLevels.find(g => g.code === 'G1')

  if (grade1) {
    const subjects = await Promise.all([
      prisma.subject.upsert({
        where: {
          code_gradeLevelId_deletedAt: {
            code: 'ENG-G1',
            gradeLevelId: grade1.id,
            deletedAt: null
          }
        },
        update: {},
        create: {
          name: 'English',
          code: 'ENG-G1',
          gradeLevelId: grade1.id,
          category: 'LANGUAGE',
          description: 'English Language',
          isMandatory: true,
          credits: 1.0,
          createdBy: adminUser.id
        }
      }),
      prisma.subject.upsert({
        where: {
          code_gradeLevelId_deletedAt: {
            code: 'MATH-G1',
            gradeLevelId: grade1.id,
            deletedAt: null
          }
        },
        update: {},
        create: {
          name: 'Mathematics',
          code: 'MATH-G1',
          gradeLevelId: grade1.id,
          category: 'MATHEMATICS',
          description: 'Basic Mathematics',
          isMandatory: true,
          credits: 1.0,
          createdBy: adminUser.id
        }
      }),
      prisma.subject.upsert({
        where: {
          code_gradeLevelId_deletedAt: {
            code: 'SCI-G1',
            gradeLevelId: grade1.id,
            deletedAt: null
          }
        },
        update: {},
        create: {
          name: 'Science',
          code: 'SCI-G1',
          gradeLevelId: grade1.id,
          category: 'SCIENCE',
          description: 'Basic Science',
          isMandatory: true,
          credits: 1.0,
          createdBy: adminUser.id
        }
      })
    ])

    console.log(`✅ Created ${subjects.length} sample subjects for Grade 1`)
  }

  console.log('\n🎉 Database seeding completed successfully!')
  console.log('\n📋 Summary:')
  console.log(`   - Grade Levels: ${gradeLevels.length}`)
  console.log(`   - Academic Years: 1`)
  console.log(`   - Terms: ${terms.length}`)
  console.log(`   - Assessment Types: ${assessmentTypes.length}`)
  console.log(`   - Admin Users: 1`)
  console.log(`   - School Settings: 1`)
  console.log('\n🔐 Default Admin Credentials:')
  console.log(`   Email: admin@school.zm`)
  console.log(`   Password: Admin@123`)
  console.log('\n⚠️  IMPORTANT: Change the admin password immediately!')
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
