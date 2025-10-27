import { useState, useEffect } from 'react';

export interface Student {
  id: string;
  name: string;
  studentNumber: string;
  email?: string;
  phone: string;
  year: number;
  photoUrl: string;
  grade: string;
  currentGradeLevel: string;
  gender: string;
  dateOfBirth: string;
  address: string;
  parentName: string;
  parentEmail: string;
  status: "Active" | "Inactive" | "Suspended";
  enrollmentDate: string;
  admissionDate: string;
}

const STORAGE_KEY = 'school-ult-students';

// Default students - initial data
const defaultStudents: Student[] = [
  {
    id: '1',
    name: 'John Doe',
    studentNumber: 'STU001',
    email: 'john.doe@student.edu',
    phone: '(555) 123-4567',
    year: 2019,
    photoUrl: 'https://i.pravatar.cc/150?img=12',
    grade: 'Grade 9',
    currentGradeLevel: 'Grade 9',
    gender: 'Male',
    dateOfBirth: '15-08-2005',
    address: '1234 Main Street, San Francisco, CA 94103',
    parentName: 'James Doe',
    parentEmail: 'james.doe@email.com',
    status: 'Active',
    enrollmentDate: new Date().toLocaleDateString(),
    admissionDate: '2019-01-15',
  },
  // ... add more default students as needed
];

export function useStudents() {
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load students from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          setStudents(JSON.parse(stored));
        } catch (error) {
          console.error('Failed to parse stored students:', error);
          setStudents(defaultStudents);
        }
      } else {
        setStudents(defaultStudents);
      }
      setIsLoaded(true);
    }
  }, []);

  // Save students to localStorage whenever they change
  useEffect(() => {
    if (isLoaded && typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
    }
  }, [students, isLoaded]);

  const addStudent = (student: Omit<Student, 'id'>) => {
    const newStudent: Student = {
      ...student,
      id: `STU${Date.now()}`,
    };
    setStudents([...students, newStudent]);
    return newStudent;
  };

  const updateStudent = (id: string, updates: Partial<Student>) => {
    setStudents(
      students.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );
  };

  const deleteStudent = (id: string) => {
    setStudents(students.filter((s) => s.id !== id));
  };

  return {
    students,
    isLoaded,
    addStudent,
    updateStudent,
    deleteStudent,
  };
}
