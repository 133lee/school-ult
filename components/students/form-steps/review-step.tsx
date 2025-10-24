import { StudentFormData } from '@/types/student';

interface ReviewStepProps {
  formData: StudentFormData;
}

export function ReviewStep({ formData }: ReviewStepProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="font-medium text-gray-900 mb-3">
            Personal Information
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Name:</span>
              <span className="font-medium">
                {formData.firstName} {formData.lastName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Student Number:</span>
              <span className="font-medium">{formData.studentNumber}</span>
            </div>
            {formData.dateOfBirth && (
              <div className="flex justify-between">
                <span className="text-gray-600">Date of Birth:</span>
                <span className="font-medium">{formData.dateOfBirth}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Gender:</span>
              <span className="font-medium capitalize">{formData.gender}</span>
            </div>
            {formData.address && (
              <div className="flex justify-between">
                <span className="text-gray-600">Address:</span>
                <span className="font-medium">{formData.address}</span>
              </div>
            )}
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-3">
            Academic Information
          </h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Grade Level:</span>
              <span className="font-medium">
                Grade {formData.currentGradeLevel}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Admission Date:</span>
              <span className="font-medium">{formData.admissionDate}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
