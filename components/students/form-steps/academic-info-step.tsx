import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { StudentFormData } from '@/types/student';

interface AcademicInfoStepProps {
  formData: StudentFormData;
  updateFormData: (field: string, value: string) => void;
  errors: Record<string, string>;
  academicYears: string[];
}

export function AcademicInfoStep({
  formData,
  updateFormData,
  errors,
  academicYears,
}: AcademicInfoStepProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-2">
        <Label htmlFor="currentGradeLevel">Grade Level *</Label>
        <Select
          value={formData.currentGradeLevel}
          onValueChange={(value) => updateFormData('currentGradeLevel', value)}
        >
          <SelectTrigger className={errors.currentGradeLevel ? 'border-red-500' : ''}>
            <SelectValue placeholder="Select grade level" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1">Grade 1</SelectItem>
            <SelectItem value="2">Grade 2</SelectItem>
            <SelectItem value="3">Grade 3</SelectItem>
            <SelectItem value="4">Grade 4</SelectItem>
            <SelectItem value="5">Grade 5</SelectItem>
            <SelectItem value="6">Grade 6</SelectItem>
            <SelectItem value="7">Grade 7</SelectItem>
            <SelectItem value="8">Grade 8</SelectItem>
            <SelectItem value="9">Grade 9</SelectItem>
            <SelectItem value="10">Grade 10</SelectItem>
            <SelectItem value="11">Grade 11</SelectItem>
            <SelectItem value="12">Grade 12</SelectItem>
          </SelectContent>
        </Select>
        {errors.currentGradeLevel && (
          <p className="text-sm text-red-500">{errors.currentGradeLevel}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="admissionDate">Admission Date *</Label>
        <Input
          id="admissionDate"
          type="date"
          value={formData.admissionDate}
          onChange={(e) => updateFormData('admissionDate', e.target.value)}
          className={errors.admissionDate ? 'border-red-500' : ''}
        />
        {errors.admissionDate && (
          <p className="text-sm text-red-500">{errors.admissionDate}</p>
        )}
      </div>
    </div>
  );
}
