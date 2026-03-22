import { Prisma } from "@/generated/prisma/client";
import { Assessment, ExamType, AssessmentStatus, Role } from "@/types/prisma-enums";
import { assessmentRepository } from "./assessment.repository";
import { studentAssessmentResultRepository } from "../assessment-results/studentAssessmentResult.repository";
import { subjectRepository } from "../subjects/subject.repository";
import { classRepository } from "../classes/class.repository";
import { termRepository } from "../terms/term.repository";
import { calculateECZGrade } from "@/lib/grading/ecz-grading-system";
import { UnauthorizedError, NotFoundError, ValidationError } from "@/lib/errors";
import { requireMinimumRole, AuthContext } from "@/lib/auth/authorization";
import { hasRoleAuthority } from "@/lib/auth/role-hierarchy";
import prisma from "@/lib/db/prisma";

/**
 * Assessment Service - Business Logic Layer
 *
 * Manages assessments (exams, tests, quizzes).
 * Handles creation, grading, and analysis.
 */

// Custom Error Classes
export class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConflictError";
  }
}

// Service context for authorization
export type ServiceContext = AuthContext;

// Input DTOs
export interface CreateAssessmentInput {
  title: string;
  description?: string;
  subjectId: string;
  classId: string;
  termId: string;
  examType: ExamType;
  totalMarks?: number;
  passMark?: number;
  weight?: number;
  assessmentDate?: Date;
}

export interface UpdateAssessmentInput {
  title?: string;
  description?: string;
  totalMarks?: number;
  passMark?: number;
  weight?: number;
  assessmentDate?: Date;
  status?: AssessmentStatus;
}

export interface AssessmentFilters {
  subjectId?: string;
  classId?: string;
  termId?: string;
  examType?: ExamType;
  status?: AssessmentStatus;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface EnterResultInput {
  studentId: string;
  marksObtained: number;
  remarks?: string;
}

export class AssessmentService {
  // ==================== PERMISSION CHECKS ====================

  /**
   * Check if user can delete assessments
   * Only HEAD_TEACHER and ADMIN can delete assessments
   */
  private canDeleteAssessments(context: ServiceContext): boolean {
    return hasRoleAuthority(context.role, Role.HEAD_TEACHER);
  }

  /**
   * Check if user can manage assessments (create/update/enter results)
   * Teachers and above can manage assessments
   */
  private canManageAssessments(context: ServiceContext): boolean {
    return hasRoleAuthority(context.role, Role.TEACHER);
  }

  // ==================== VALIDATION ====================

  /**
   * Validate assessment data
   */
  private validateAssessmentData(data: CreateAssessmentInput): void {
    // Validate total marks
    if (data.totalMarks && (data.totalMarks <= 0 || data.totalMarks > 1000)) {
      throw new ValidationError("Total marks must be between 1 and 1000");
    }

    // Validate pass mark
    const totalMarks = data.totalMarks || 100;
    const passMark = data.passMark || 50;

    if (passMark < 0 || passMark > totalMarks) {
      throw new ValidationError(
        `Pass mark must be between 0 and ${totalMarks}`
      );
    }

    // Validate weight
    if (data.weight && (data.weight < 0 || data.weight > 10)) {
      throw new ValidationError("Weight must be between 0 and 10");
    }

    // Validate assessment date is not too far in future
    if (data.assessmentDate) {
      const oneYearFromNow = new Date();
      oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);

      if (data.assessmentDate > oneYearFromNow) {
        throw new ValidationError(
          "Assessment date cannot be more than 1 year in the future"
        );
      }
    }
  }

  /**
   * Validate that assessment date is within term dates
   */
  private async validateAssessmentDateInTerm(
    assessmentDate: Date,
    termId: string
  ): Promise<void> {
    const term = await termRepository.findById(termId);
    if (!term) {
      throw new NotFoundError("Term not found");
    }

    if (assessmentDate < term.startDate || assessmentDate > term.endDate) {
      throw new ValidationError(
        "Assessment date must be within term dates"
      );
    }
  }

  /**
   * Validate that subject exists in the class curriculum (ClassSubject)
   * This ensures assessments can only be created for subjects that are
   * part of the class's official curriculum.
   */
  private async validateClassSubject(
    subjectId: string,
    classId: string
  ): Promise<void> {
    const classSubject = await prisma.classSubject.findUnique({
      where: {
        classId_subjectId: {
          classId,
          subjectId,
        },
      },
    });

    if (!classSubject) {
      const [subject, classEntity] = await Promise.all([
        subjectRepository.findById(subjectId),
        classRepository.findById(classId),
      ]);

      const className = classEntity?.name || "this class";
      const subjectName = subject?.name || "Subject";

      throw new ValidationError(
        `${subjectName} is not in the curriculum for ${className}. ` +
        `Cannot create an assessment for a subject not in the class curriculum.`
      );
    }
  }

  // ==================== BUSINESS LOGIC ====================

  /**
   * Create a new assessment
   */
  async createAssessment(
    data: CreateAssessmentInput,
    context: ServiceContext
  ): Promise<Assessment> {
    // Authorization: Teachers and above can create assessments
    requireMinimumRole(
      context,
      Role.TEACHER,
      "You do not have permission to create assessments"
    );

    // Validate data
    this.validateAssessmentData(data);

    // Validate references exist
    const [subject, classEntity, term] = await Promise.all([
      subjectRepository.findById(data.subjectId),
      classRepository.findById(data.classId),
      termRepository.findByIdWithRelations(data.termId),
    ]);

    if (!subject) {
      throw new NotFoundError("Subject not found");
    }

    if (!classEntity) {
      throw new NotFoundError("Class not found");
    }

    if (!term) {
      throw new NotFoundError("Term not found");
    }

    // Business rule: Cannot create assessment in closed academic year
    if (term.academicYear.isClosed) {
      throw new ValidationError(
        "Cannot create assessment in a closed academic year"
      );
    }

    // Business rule: Subject must be in the class curriculum (ClassSubject)
    // This is the AUTHORITATIVE check - ensures curriculum integrity
    await this.validateClassSubject(data.subjectId, data.classId);

    // Validate assessment date is within term dates
    if (data.assessmentDate) {
      await this.validateAssessmentDateInTerm(data.assessmentDate, data.termId);
    }

    // Create assessment
    const assessment = await assessmentRepository.create({
      title: data.title,
      description: data.description,
      subject: { connect: { id: data.subjectId } },
      class: { connect: { id: data.classId } },
      term: { connect: { id: data.termId } },
      examType: data.examType,
      totalMarks: data.totalMarks || 100,
      passMark: data.passMark || 50,
      weight: data.weight || 1.0,
      assessmentDate: data.assessmentDate,
      status: AssessmentStatus.DRAFT,
    });

    return assessment;
  }

  /**
   * Get assessment by ID
   */
  async getAssessmentById(
    id: string,
    context: ServiceContext
  ): Promise<Assessment> {
    // Everyone can read assessments
    const assessment = await assessmentRepository.findById(id);

    if (!assessment) {
      throw new NotFoundError("Assessment not found");
    }

    return assessment;
  }

  /**
   * Get assessment with relations
   */
  async getAssessmentWithRelations(id: string, context: ServiceContext) {
    // Everyone can read assessments
    const assessment = await assessmentRepository.findByIdWithRelations(id);

    if (!assessment) {
      throw new NotFoundError("Assessment not found");
    }

    return assessment;
  }

  /**
   * List assessments with filters
   */
  async listAssessments(
    filters: AssessmentFilters,
    pagination: PaginationParams,
    context: ServiceContext
  ) {
    // Everyone can list assessments

    const { page, pageSize } = pagination;
    const skip = (page - 1) * pageSize;

    // Build where clause
    const where: Prisma.AssessmentWhereInput = {};

    if (filters.subjectId) {
      where.subjectId = filters.subjectId;
    }

    if (filters.classId) {
      where.classId = filters.classId;
    }

    if (filters.termId) {
      where.termId = filters.termId;
    }

    if (filters.examType) {
      where.examType = filters.examType;
    }

    if (filters.status) {
      where.status = filters.status;
    }

    // Fetch data
    const [assessments, total] = await Promise.all([
      assessmentRepository.findMany({
        skip,
        take: pageSize,
        where,
        include: {
          subject: true,
          class: {
            include: {
              grade: true,
            },
          },
          term: {
            include: {
              academicYear: true,
            },
          },
          _count: {
            select: {
              results: true,
            },
          },
        },
        orderBy: { assessmentDate: "desc" },
      }),
      assessmentRepository.count(where),
    ]);

    return {
      data: assessments,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  /**
   * Update assessment
   */
  async updateAssessment(
    id: string,
    data: UpdateAssessmentInput,
    context: ServiceContext
  ): Promise<Assessment> {
    // Authorization: Teachers and above can update assessments
    requireMinimumRole(
      context,
      Role.TEACHER,
      "You do not have permission to update assessments"
    );

    // Check if assessment exists
    const existingAssessment =
      await assessmentRepository.findByIdWithRelations(id);
    if (!existingAssessment) {
      throw new NotFoundError("Assessment not found");
    }

    // Business rule: Cannot update published/completed assessment if it has results
    if (
      existingAssessment.status !== AssessmentStatus.DRAFT &&
      (await assessmentRepository.hasResults(id))
    ) {
      throw new ValidationError(
        "Cannot update assessment that has results. Delete results first."
      );
    }

    // Business rule: Cannot update in closed year
    if (existingAssessment.term.academicYear.isClosed) {
      throw new ValidationError(
        "Cannot update assessment in a closed academic year"
      );
    }

    // Validate data
    if (data.totalMarks || data.passMark) {
      const totalMarks = data.totalMarks || existingAssessment.totalMarks;
      const passMark = data.passMark || existingAssessment.passMark;

      if (passMark > totalMarks) {
        throw new ValidationError(
          "Pass mark cannot be greater than total marks"
        );
      }
    }

    // Validate assessment date is within term dates
    if (data.assessmentDate) {
      await this.validateAssessmentDateInTerm(
        data.assessmentDate,
        existingAssessment.termId
      );
    }

    // Update
    const updatedAssessment = await assessmentRepository.update(id, data);

    return updatedAssessment;
  }

  /**
   * Publish assessment (make it available for grading)
   */
  async publishAssessment(
    id: string,
    context: ServiceContext
  ): Promise<Assessment> {
    // Authorization: Teachers and above can publish assessments
    requireMinimumRole(
      context,
      Role.TEACHER,
      "You do not have permission to publish assessments"
    );

    const assessment = await assessmentRepository.findById(id);
    if (!assessment) {
      throw new NotFoundError("Assessment not found");
    }

    if (assessment.status !== AssessmentStatus.DRAFT) {
      throw new ValidationError("Only draft assessments can be published");
    }

    return assessmentRepository.updateStatus(id, AssessmentStatus.PUBLISHED);
  }

  /**
   * Complete assessment (finalize grading)
   */
  async completeAssessment(
    id: string,
    context: ServiceContext
  ): Promise<Assessment> {
    // Authorization: Teachers and above can complete assessments
    requireMinimumRole(
      context,
      Role.TEACHER,
      "You do not have permission to complete assessments"
    );

    const assessment = await assessmentRepository.findById(id);
    if (!assessment) {
      throw new NotFoundError("Assessment not found");
    }

    if (assessment.status !== AssessmentStatus.PUBLISHED) {
      throw new ValidationError("Only published assessments can be completed");
    }

    return assessmentRepository.updateStatus(id, AssessmentStatus.COMPLETED);
  }

  /**
   * Delete assessment
   */
  async deleteAssessment(
    id: string,
    context: ServiceContext
  ): Promise<void> {
    // Check if assessment exists
    const assessment = await assessmentRepository.findByIdWithRelations(id);
    if (!assessment) {
      throw new NotFoundError("Assessment not found");
    }

    // Authorization - Teachers can only delete their own DRAFT assessments
    // Admins and HEAD_TEACHER can delete any draft assessment
    const isAdmin = hasRoleAuthority(context.role, Role.ADMIN);
    const isHeadTeacher = hasRoleAuthority(context.role, Role.HEAD_TEACHER);
    const isTeacher = context.role === Role.TEACHER;

    if (!isAdmin && !isHeadTeacher) {
      // Teachers can only delete DRAFT assessments
      if (assessment.status !== AssessmentStatus.DRAFT) {
        throw new UnauthorizedError(
          "You can only delete draft assessments. Published or completed assessments cannot be deleted."
        );
      }

      // Teachers can only delete assessments they have permission to manage
      if (!isTeacher) {
        throw new UnauthorizedError(
          "You do not have permission to delete assessments"
        );
      }
    }

    // Business rule: Cannot delete from closed year
    if (assessment.term.academicYear.isClosed) {
      throw new ValidationError(
        "Cannot delete assessment from a closed academic year"
      );
    }

    // Business rule: Admins/Head Teachers cannot delete published assessments with results
    if (assessment.status !== AssessmentStatus.DRAFT) {
      const results = await studentAssessmentResultRepository.findByAssessmentId(id);
      if (results && results.length > 0) {
        throw new ValidationError(
          "Cannot delete assessment with existing results. Delete results first."
        );
      }
    }

    // Delete assessment
    await assessmentRepository.delete(id);
  }

  /**
   * Get all results for an assessment
   */
  async getAssessmentResults(id: string, context: ServiceContext) {
    // Everyone can view results
    const assessment = await assessmentRepository.findById(id);
    if (!assessment) {
      throw new NotFoundError("Assessment not found");
    }

    return studentAssessmentResultRepository.findByAssessmentId(id);
  }

  /**
   * Enter/update a single student result
   */
  async enterResult(
    assessmentId: string,
    data: EnterResultInput,
    context: ServiceContext
  ) {
    // Authorization
    if (!this.canManageAssessments(context)) {
      throw new UnauthorizedError(
        "You do not have permission to enter results"
      );
    }

    // Check if assessment exists
    const assessment = await assessmentRepository.findByIdWithRelations(
      assessmentId
    );
    if (!assessment) {
      throw new NotFoundError("Assessment not found");
    }

    // Business rule: Assessment must be published to enter results
    if (assessment.status === AssessmentStatus.DRAFT) {
      throw new ValidationError(
        "Cannot enter results for draft assessment. Publish it first."
      );
    }

    // Business rule: Cannot enter results in closed year
    if (assessment.term.academicYear.isClosed) {
      throw new ValidationError(
        "Cannot enter results in a closed academic year"
      );
    }

    // Validate marks
    if (data.marksObtained < 0 || data.marksObtained > assessment.totalMarks) {
      throw new ValidationError(
        `Marks must be between 0 and ${assessment.totalMarks}`
      );
    }

    // Calculate grade using centralized grading system
    const percentage = (data.marksObtained / assessment.totalMarks) * 100;

    // Determine grade level from the class's grade
    const classWithGrade = await classRepository.findById(assessment.classId);
    if (!classWithGrade || !classWithGrade.grade) {
      throw new NotFoundError("Class or grade information not found");
    }

    const { mapPrismaGradeLevelToECZLevel } = await import("@/lib/grading/ecz-grading-system");
    const gradeLevel = mapPrismaGradeLevelToECZLevel(classWithGrade.grade.level);
    const grade = calculateECZGrade(percentage, gradeLevel);

    // Check if result already exists
    const existingResult =
      await studentAssessmentResultRepository.findByStudentAssessmentSubject(
        data.studentId,
        assessmentId,
        assessment.subjectId
      );

    if (existingResult) {
      // Update existing result
      return studentAssessmentResultRepository.update(existingResult.id, {
        marksObtained: data.marksObtained,
        grade,
        remarks: data.remarks,
      });
    } else {
      // Create new result
      return studentAssessmentResultRepository.create({
        studentId: data.studentId,
        assessmentId,
        subjectId: assessment.subjectId,
        marksObtained: data.marksObtained,
        grade,
        remarks: data.remarks,
      });
    }
  }

  /**
   * Bulk enter results for multiple students
   */
  async bulkEnterResults(
    assessmentId: string,
    results: EnterResultInput[],
    context: ServiceContext
  ) {
    // Authorization
    if (!this.canManageAssessments(context)) {
      throw new UnauthorizedError(
        "You do not have permission to enter results"
      );
    }

    const successful: any[] = [];
    const failed: Array<{ studentId: string; error: string }> = [];

    for (const result of results) {
      try {
        const savedResult = await this.enterResult(
          assessmentId,
          result,
          context
        );
        successful.push(savedResult);
      } catch (error: any) {
        failed.push({
          studentId: result.studentId,
          error: error.message || "Unknown error",
        });
      }
    }

    return {
      successful: successful.length,
      failed,
    };
  }

  /**
   * Get assessment statistics
   */
  async getAssessmentStatistics(id: string, context: ServiceContext) {
    // Everyone can view statistics
    const assessment = await assessmentRepository.findByIdWithRelations(id);
    if (!assessment) {
      throw new NotFoundError("Assessment not found");
    }

    const results = await studentAssessmentResultRepository.findByAssessmentId(
      id
    );

    if (results.length === 0) {
      return {
        totalStudents: 0,
        gradedStudents: 0,
        average: 0,
        highest: 0,
        lowest: 0,
        passRate: 0,
        gradeDistribution: {},
      };
    }

    const marks = results.map((r) => r.marksObtained);
    const total = marks.reduce((sum, mark) => sum + mark, 0);
    const average = total / marks.length;
    const passed = results.filter(
      (r) => r.marksObtained >= assessment.passMark
    ).length;

    // Grade distribution
    const gradeDistribution: Record<string, number> = {};
    results.forEach((result) => {
      const grade = result.grade || "UNGRADED";
      gradeDistribution[grade] = (gradeDistribution[grade] || 0) + 1;
    });

    return {
      totalStudents: results.length,
      gradedStudents: results.length,
      average: Math.round(average * 100) / 100,
      highest: Math.max(...marks),
      lowest: Math.min(...marks),
      passRate: Math.round((passed / results.length) * 100 * 100) / 100,
      gradeDistribution,
    };
  }
}

// Singleton instance
export const assessmentService = new AssessmentService();
