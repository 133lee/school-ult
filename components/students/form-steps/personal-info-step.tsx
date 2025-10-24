import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { StudentFormData } from '@/types/student';

interface PersonalInfoStepProps {
  formData: StudentFormData;
  updateFormData: (field: string, value: string) => void;
  errors: Record<string, string>;
  isEditing: boolean;
  onGenerateStudentId: () => void;
}

export function PersonalInfoStep({
  formData,
  updateFormData,
  errors,
  isEditing,
  onGenerateStudentId,
}: PersonalInfoStepProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <Label htmlFor="firstName">First Name *</Label>
        <Input
          id="firstName"
          value={formData.firstName}
          onChange={(e) => updateFormData('firstName', e.target.value)}
          placeholder="Enter first name"
          className={errors.firstName ? 'border-red-500' : ''}
        />
        {errors.firstName && (
          <p className="text-sm text-red-500">{errors.firstName}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="lastName">Last Name *</Label>
        <Input
          id="lastName"
          value={formData.lastName}
          onChange={(e) => updateFormData('lastName', e.target.value)}
          placeholder="Enter last name"
          className={errors.lastName ? 'border-red-500' : ''}
        />
        {errors.lastName && (
          <p className="text-sm text-red-500">{errors.lastName}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="studentNumber">Student Number *</Label>
        <div className="flex gap-2">
          <Input
            id="studentNumber"
            value={formData.studentNumber}
            onChange={(e) => updateFormData('studentNumber', e.target.value)}
            placeholder="STU24001"
            className={errors.studentNumber ? 'border-red-500' : ''}
          />
          {!isEditing && (
            <Button
              type="button"
              variant="outline"
              onClick={onGenerateStudentId}
            >
              Generate
            </Button>
          )}
        </div>
        {errors.studentNumber && (
          <p className="text-sm text-red-500">{errors.studentNumber}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="dateOfBirth">Date of Birth *</Label>
        <Input
          id="dateOfBirth"
          type="date"
          value={formData.dateOfBirth}
          onChange={(e) => updateFormData('dateOfBirth', e.target.value)}
          className={errors.dateOfBirth ? 'border-red-500' : ''}
        />
        {errors.dateOfBirth && (
          <p className="text-sm text-red-500">{errors.dateOfBirth}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="gender">Gender *</Label>
        <Select
          value={formData.gender}
          onValueChange={(value) => updateFormData('gender', value)}
        >
          <SelectTrigger className={errors.gender ? 'border-red-500' : ''}>
            <SelectValue placeholder="Select gender" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="male">Male</SelectItem>
            <SelectItem value="female">Female</SelectItem>
          </SelectContent>
        </Select>
        {errors.gender && (
          <p className="text-sm text-red-500">{errors.gender}</p>
        )}
      </div>

      <div className="md:col-span-2 space-y-2">
        <Label htmlFor="address">Address</Label>
        <Textarea
          id="address"
          value={formData.address || ''}
          onChange={(e) => updateFormData('address', e.target.value)}
          placeholder="Enter full address"
          rows={3}
        />
      </div>
    </div>
  );
}
