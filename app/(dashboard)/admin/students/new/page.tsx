'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, Save, Check } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
// Import types
import { StudentFormData } from '@/types/student';

// Import modular components
import { PersonalInfoStep } from '@/components/students/form-steps/personal-info-step';
import { AcademicInfoStep } from '@/components/students/form-steps/academic-info-step';
import { ReviewStep } from '@/components/students/form-steps/review-step';
import {
  generateStudentNumber,
  generateAcademicYears,
  validateStep,
} from '@/components/students/form-steps/form-helpers';

const initialFormData: StudentFormData = {
  firstName: '',
  lastName: '',
  studentNumber: '',
  dateOfBirth: '',
  gender: '',
  address: '',
  currentGradeLevel: '',
  admissionDate: new Date().toISOString().split('T')[0],
};

const steps = [
  {
    id: 1,
    title: 'Personal Information',
    description: 'Basic student details and contact information',
  },
  {
    id: 2,
    title: 'Academic Details',
    description: 'School enrollment and academic information',
  },
  {
    id: 3,
    title: 'Review',
    description: 'Review and confirm all information',
  },
];

export default function AddEditStudentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');
  const isEditing = !!editId;

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<StudentFormData>(initialFormData);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  // Generate academic years
  const academicYears = generateAcademicYears();

  // Load student data when editing
  useEffect(() => {
    if (isEditing && editId) {
      const loadStudent = async () => {
        try {
          const token = localStorage.getItem('token');
          if (!token) return;

          const response = await fetch(`/api/students/${editId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const result = await response.json();
            if (result.success && result.data) {
              const student = result.data;
              setFormData({
                id: student.id,
                firstName: student.firstName,
                lastName: student.lastName,
                studentNumber: student.studentNumber,
                dateOfBirth: student.dateOfBirth
                  ? new Date(student.dateOfBirth).toISOString().split('T')[0]
                  : '',
                gender: student.gender?.toLowerCase() || '',
                address: student.address || '',
                currentGradeLevel: student.currentGradeLevel,
                admissionDate: new Date(student.admissionDate)
                  .toISOString()
                  .split('T')[0],
              });
            }
          }
        } catch (error) {
          console.error('Error loading student:', error);
          toast.error('Failed to load student data');
        }
      };
      loadStudent();
    }
  }, [isEditing, editId]);

  const updateFormData = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleGenerateStudentNumber = () => {
    updateFormData('studentNumber', generateStudentNumber());
  };

  const validateCurrentStep = (): boolean => {
    const newErrors = validateStep(currentStep, formData);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep() && currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setErrors({});
    }
  };

  const handleSubmit = async () => {
    if (!validateCurrentStep()) {
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');

      if (!token) {
        toast.error('Please log in to continue');
        router.push('/login');
        return;
      }

      const apiData = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        studentNumber: formData.studentNumber,
        dateOfBirth: formData.dateOfBirth
          ? new Date(formData.dateOfBirth)
          : undefined,
        gender: formData.gender.toUpperCase() as 'MALE' | 'FEMALE',
        address: formData.address,
        currentGradeLevel: formData.currentGradeLevel,
        admissionDate: new Date(formData.admissionDate),
      };

      const url = isEditing ? `/api/students/${editId}` : '/api/students';
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(apiData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || `Failed to ${isEditing ? 'update' : 'create'} student`
        );
      }

      toast.success(
        result.message ||
        `Student ${isEditing ? 'updated' : 'created'} successfully`
      );


      router.push('/admin/students');
    } catch (error) {
      console.error('Error saving student:', error);
      toast.error(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <PersonalInfoStep
            formData={formData}
            updateFormData={updateFormData}
            errors={errors}
            isEditing={isEditing}
            onGenerateStudentId={handleGenerateStudentNumber}
          />
        );

      case 2:
        return (
          <AcademicInfoStep
            formData={formData}
            updateFormData={updateFormData}
            errors={errors}
            academicYears={academicYears}
          />
        );

      case 3:
        return <ReviewStep formData={formData} />;

      default:
        return null;
    }
  };

  const progress = (currentStep / 3) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/students">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Students
            </Button>
          </Link>
        </div>
        <div>
          <h1 className="text-lg font-bold text-right">
            {isEditing ? 'Edit Student' : 'Add New Student'}
          </h1>
          <p className="text-muted-foreground text-xs">
            {isEditing
              ? `Update ${formData.firstName} ${formData.lastName}'s information`
              : 'Complete the form below to add a new student'}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm font-medium">
          {steps.map((step) => (
            <div
              key={step.id}
              className={`flex items-center ${
                currentStep >= step.id
                  ? 'text-primary'
                  : 'text-muted-foreground'
              }`}
            >
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center mr-2 ${
                  currentStep === step.id
                    ? 'bg-primary text-primary-foreground'
                    : currentStep > step.id
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                }`}
              >
                {currentStep > step.id ? (
                  <Check className="h-4 w-4" />
                ) : (
                  step.id
                )}
              </div>
              <span className="hidden sm:inline">{step.title}</span>
            </div>
          ))}
        </div>
        <Progress value={progress} className="w-full mt-6" />
      </div>

      {/* Step Content */}
      <Card>
        <CardHeader>
          <CardTitle>{steps[currentStep - 1].title}</CardTitle>
          <CardDescription>
            {steps[currentStep - 1].description}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Wrapper div with consistent max-width for all form content */}
          <div className="max-w-2xl mx-auto">
            {renderStepContent()}
          </div>
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 1}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>

        <div className="flex gap-2">
          {currentStep < 3 ? (
            <Button onClick={handleNext}>
              Next
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? (
                'Saving...'
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {isEditing ? 'Update Student' : 'Add Student'}
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
