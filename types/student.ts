export interface StudentFormData {
  id?: number;
  firstName: string;
  lastName: string;
  studentNumber: string;
  dateOfBirth: string;
  gender: string;
  address?: string;
  currentGradeLevel: string;
  admissionDate: string;
  classId?: string;
  parentPhone?: string;
  parentEmail?: string;
}

export interface ClassData {
  id: string;
  name: string;
  gradeLevel: string;
  capacity?: number;
  enrollments?: any[];
}

export interface ValidationErrors {
  firstName?: string;
  lastName?: string;
  studentNumber?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  currentGradeLevel?: string;
  admissionDate?: string;
  classId?: string;
  parentPhone?: string;
  parentEmail?: string;
}
