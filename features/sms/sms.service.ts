import { SMSStatus, SMSProvider, Role } from "@/types/prisma-enums";
import { smsLogRepository } from "./smsLog.repository";
import { smsTemplateRepository } from "./smsTemplate.repository";
import { africasTalkingService } from "./africasTalking.service";
import { parentRepository } from "../parents/parent.repository";
import { UnauthorizedError, NotFoundError, ValidationError } from "@/lib/errors";
import { AuthContext } from "@/lib/auth/authorization";
import { hasRoleAuthority } from "@/lib/auth/role-hierarchy";
import { logger } from "@/lib/logger/logger";

/**
 * SMS Service - Business Logic Layer
 *
 * Manages SMS sending, templates, and logging.
 * Handles authorization, validation, and orchestration.
 */

// Service context for authorization
export type ServiceContext = AuthContext & {
  teacherProfileId?: string;
};

// Input DTOs
export interface SendSMSInput {
  guardianId: string;
  studentId?: string;
  message: string;
  provider?: SMSProvider;
}

export interface SendBulkSMSInput {
  recipients: Array<{
    guardianId: string;
    studentId?: string;
  }>;
  message: string;
  provider?: SMSProvider;
}

export interface SendTemplatedSMSInput {
  guardianId: string;
  studentId?: string;
  templateName: string;
  variables: Record<string, string>;
  provider?: SMSProvider;
}

export interface SMSFilters {
  guardianId?: string;
  studentId?: string;
  status?: SMSStatus;
  provider?: SMSProvider;
  dateFrom?: Date;
  dateTo?: Date;
  sentBy?: string;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export class SMSService {
  // ==================== PERMISSION CHECKS ====================

  /**
   * Check if user can send SMS
   * Teachers and above can send SMS
   */
  private canSendSMS(context: ServiceContext): boolean {
    return hasRoleAuthority(context.role, Role.TEACHER);
  }

  /**
   * Check if user can view SMS logs
   * Teachers and above can view SMS logs
   */
  private canViewSMSLogs(context: ServiceContext): boolean {
    return hasRoleAuthority(context.role, Role.TEACHER);
  }

  /**
   * Check if user can manage SMS templates
   * Only admins can manage templates
   */
  private canManageTemplates(context: ServiceContext): boolean {
    return context.role === Role.ADMIN;
  }

  // ==================== VALIDATION ====================

  /**
   * Validate message content
   */
  private validateMessage(message: string): void {
    if (!message || message.trim().length === 0) {
      throw new ValidationError("Message content is required");
    }

    if (message.length > 1600) {
      throw new ValidationError("Message too long. Maximum 1600 characters (10 SMS segments)");
    }
  }

  /**
   * Validate phone number
   */
  private validatePhoneNumber(phone: string): void {
    if (!phone || phone.trim().length === 0) {
      throw new ValidationError("Phone number is required");
    }

    // Basic validation for Zambian numbers
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length < 9 || cleaned.length > 12) {
      throw new ValidationError("Invalid phone number format");
    }
  }

  // ==================== BUSINESS LOGIC ====================

  /**
   * Send SMS to a single recipient
   */
  async sendSMS(
    input: SendSMSInput,
    context: ServiceContext
  ): Promise<{ success: boolean; logId: string; error?: string }> {
    // Authorization
    if (!this.canSendSMS(context)) {
      throw new UnauthorizedError("You do not have permission to send SMS");
    }

    // Validation
    this.validateMessage(input.message);

    // Get guardian details
    const guardian = await parentRepository.findById(input.guardianId);
    if (!guardian) {
      throw new NotFoundError("Guardian not found");
    }

    this.validatePhoneNumber(guardian.phone);

    // Create log entry
    const log = await smsLogRepository.create({
      guardian: { connect: { id: input.guardianId } },
      ...(input.studentId && { student: { connect: { id: input.studentId } } }),
      phoneNumber: guardian.phone,
      message: input.message,
      status: "PENDING",
      provider: input.provider || "AFRICAS_TALKING",
      sentBy: context.userId,
    });

    logger.info("Created SMS log entry", { logId: log.id });

    // Send SMS via provider
    const provider = input.provider || "AFRICAS_TALKING";
    let result;

    if (provider === "AFRICAS_TALKING") {
      result = await africasTalkingService.sendSMS(guardian.phone, input.message);
    } else {
      // Other providers can be added here
      throw new ValidationError(`Unsupported SMS provider: ${provider}`);
    }

    // Update log with result
    if (result.success) {
      await smsLogRepository.update(log.id, {
        status: "SENT",
        messageId: result.messageId,
        cost: result.cost,
        sentAt: new Date(),
      });

      logger.info("SMS sent successfully", { logId: log.id });

      return {
        success: true,
        logId: log.id,
      };
    } else {
      await smsLogRepository.update(log.id, {
        status: "FAILED",
        error: result.error,
      });

      logger.error("SMS failed to send", { logId: log.id, error: result.error });

      return {
        success: false,
        logId: log.id,
        error: result.error,
      };
    }
  }

  /**
   * Send bulk SMS to multiple recipients
   */
  async sendBulkSMS(
    input: SendBulkSMSInput,
    context: ServiceContext
  ): Promise<{
    total: number;
    successful: number;
    failed: number;
    results: Array<{ guardianId: string; success: boolean; logId: string; error?: string }>;
  }> {
    // Authorization
    if (!this.canSendSMS(context)) {
      throw new UnauthorizedError("You do not have permission to send SMS");
    }

    // Validation
    this.validateMessage(input.message);

    if (!input.recipients || input.recipients.length === 0) {
      throw new ValidationError("At least one recipient is required");
    }

    if (input.recipients.length > 100) {
      throw new ValidationError("Maximum 100 recipients per bulk send");
    }

    logger.info("Starting bulk SMS send", {
      recipientCount: input.recipients.length,
    });

    const results = [];
    let successful = 0;
    let failed = 0;

    for (const recipient of input.recipients) {
      try {
        const result = await this.sendSMS(
          {
            guardianId: recipient.guardianId,
            studentId: recipient.studentId,
            message: input.message,
            provider: input.provider,
          },
          context
        );

        results.push({
          guardianId: recipient.guardianId,
          success: result.success,
          logId: result.logId,
          error: result.error,
        });

        if (result.success) {
          successful++;
        } else {
          failed++;
        }
      } catch (error: any) {
        logger.error("Error sending SMS to recipient", {
          guardianId: recipient.guardianId,
          error: error.message,
        });

        results.push({
          guardianId: recipient.guardianId,
          success: false,
          logId: "",
          error: error.message,
        });

        failed++;
      }

      // Small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    logger.info("Bulk SMS send completed", {
      total: input.recipients.length,
      successful,
      failed,
    });

    return {
      total: input.recipients.length,
      successful,
      failed,
      results,
    };
  }

  /**
   * Send SMS using a template
   */
  async sendTemplatedSMS(
    input: SendTemplatedSMSInput,
    context: ServiceContext
  ): Promise<{ success: boolean; logId: string; error?: string }> {
    // Authorization
    if (!this.canSendSMS(context)) {
      throw new UnauthorizedError("You do not have permission to send SMS");
    }

    // Get template
    const template = await smsTemplateRepository.findByName(input.templateName);
    if (!template) {
      throw new NotFoundError(`SMS template '${input.templateName}' not found`);
    }

    if (!template.isActive) {
      throw new ValidationError(`SMS template '${input.templateName}' is inactive`);
    }

    // Process template
    let message = template.template;

    for (const [key, value] of Object.entries(input.variables)) {
      message = message.replace(new RegExp(`\\{${key}\\}`, "g"), value);
    }

    // Check if all variables were replaced
    const unreplacedVars = message.match(/\{([^}]+)\}/g);
    if (unreplacedVars) {
      logger.warn("Template has unreplaced variables", {
        template: input.templateName,
        unreplacedVars,
      });
    }

    // Send SMS with processed message
    return this.sendSMS(
      {
        guardianId: input.guardianId,
        studentId: input.studentId,
        message,
        provider: input.provider,
      },
      context
    );
  }

  /**
   * Get SMS logs with filters and pagination
   */
  async getSMSLogs(
    filters: SMSFilters,
    pagination: PaginationParams,
    context: ServiceContext
  ) {
    // Authorization
    if (!this.canViewSMSLogs(context)) {
      throw new UnauthorizedError("You do not have permission to view SMS logs");
    }

    const where: any = {};

    if (filters.guardianId) where.guardianId = filters.guardianId;
    if (filters.studentId) where.studentId = filters.studentId;
    if (filters.status) where.status = filters.status;
    if (filters.provider) where.provider = filters.provider;
    if (filters.sentBy) where.sentBy = filters.sentBy;

    if (filters.dateFrom || filters.dateTo) {
      where.createdAt = {};
      if (filters.dateFrom) where.createdAt.gte = filters.dateFrom;
      if (filters.dateTo) where.createdAt.lte = filters.dateTo;
    }

    const skip = (pagination.page - 1) * pagination.pageSize;
    const take = Math.min(pagination.pageSize, 100);

    const [logs, total] = await Promise.all([
      smsLogRepository.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
      }),
      smsLogRepository.count(where),
    ]);

    return {
      logs,
      pagination: {
        page: pagination.page,
        pageSize: pagination.pageSize,
        total,
        totalPages: Math.ceil(total / pagination.pageSize),
      },
    };
  }

  /**
   * Get SMS statistics
   */
  async getStatistics(
    filters: {
      startDate?: Date;
      endDate?: Date;
      provider?: SMSProvider;
    },
    context: ServiceContext
  ) {
    // Authorization
    if (!this.canViewSMSLogs(context)) {
      throw new UnauthorizedError("You do not have permission to view SMS statistics");
    }

    return smsLogRepository.getStatistics(filters);
  }

  /**
   * Check SMS balance (Africa's Talking)
   */
  async checkBalance(context: ServiceContext) {
    // Authorization
    if (!this.canSendSMS(context)) {
      throw new UnauthorizedError("You do not have permission to check SMS balance");
    }

    return africasTalkingService.checkBalance();
  }

  /**
   * Test SMS connection
   */
  async testConnection(context: ServiceContext) {
    // Authorization (only admins can test)
    if (context.role !== Role.ADMIN) {
      throw new UnauthorizedError("You do not have permission to test SMS connection");
    }

    return africasTalkingService.testConnection();
  }

  /**
   * Get all SMS templates
   */
  async getTemplates(context: ServiceContext) {
    // Authorization
    if (!this.canSendSMS(context)) {
      throw new UnauthorizedError("You do not have permission to view SMS templates");
    }

    return smsTemplateRepository.findActive();
  }

  /**
   * Create SMS template (admin only)
   */
  async createTemplate(
    data: {
      name: string;
      description?: string;
      template: string;
      variables: string[];
      category: string;
    },
    context: ServiceContext
  ) {
    // Authorization
    if (!this.canManageTemplates(context)) {
      throw new UnauthorizedError("You do not have permission to create SMS templates");
    }

    return smsTemplateRepository.create(data);
  }

  /**
   * Update SMS template (admin only)
   */
  async updateTemplate(
    id: string,
    data: {
      description?: string;
      template?: string;
      variables?: string[];
      isActive?: boolean;
    },
    context: ServiceContext
  ) {
    // Authorization
    if (!this.canManageTemplates(context)) {
      throw new UnauthorizedError("You do not have permission to update SMS templates");
    }

    return smsTemplateRepository.update(id, data);
  }

  /**
   * Delete SMS template (admin only)
   */
  async deleteTemplate(id: string, context: ServiceContext) {
    // Authorization
    if (!this.canManageTemplates(context)) {
      throw new UnauthorizedError("You do not have permission to delete SMS templates");
    }

    return smsTemplateRepository.delete(id);
  }

  /**
   * Seed default templates (admin only)
   */
  async seedDefaultTemplates(context: ServiceContext) {
    // Authorization
    if (context.role !== Role.ADMIN) {
      throw new UnauthorizedError("You do not have permission to seed templates");
    }

    return smsTemplateRepository.seedDefaultTemplates();
  }
}

// Singleton instance
export const smsService = new SMSService();
