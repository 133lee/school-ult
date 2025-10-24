import { StudentFormData, ValidationErrors } from '@/types/student';

export const generateStudentNumber = (): string => {
  const year = new Date().getFullYear().toString().slice(-2);
  const random = Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, '0');
  return `STU${year}${random}`;
};

export const generateAcademicYears = (): string[] => {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth();
  const years: string[] = [];

  let baseYear = currentYear;
  if (currentMonth < 8) {
    baseYear = currentYear - 1;
  }

  for (let i = -2; i <= 4; i++) {
    const startYear = baseYear + i;
    const endYear = startYear + 1;
    years.push(`${startYear}-${endYear}`);
  }

  return years;
};

export const validateStep = (
  step: number,
  formData: StudentFormData
): Partial<ValidationErrors> => {
  const errors: Partial<ValidationErrors> = {};

  switch (step) {
    case 1:
      if (!formData.firstName?.trim()) {
        errors.firstName = 'First name is required';
      }
      if (!formData.lastName?.trim()) {
        errors.lastName = 'Last name is required';
      }
      if (!formData.studentNumber?.trim()) {
        errors.studentNumber = 'Student number is required';
      }
      if (!formData.dateOfBirth) {
        errors.dateOfBirth = 'Date of birth is required';
      }
      if (!formData.gender) {
        errors.gender = 'Gender is required';
      }
      if (formData.parentEmail && !/\S+@\S+\.\S+/.test(formData.parentEmail)) {
        errors.parentEmail = 'Please enter a valid email address';
      }
      break;

    case 2:
      if (!formData.currentGradeLevel) {
        errors.currentGradeLevel = 'Grade level is required';
      }
      if (!formData.admissionDate) {
        errors.admissionDate = 'Admission date is required';
      }
      break;
  }

  return errors;
};
