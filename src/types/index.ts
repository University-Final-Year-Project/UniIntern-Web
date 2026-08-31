export type Role = 'STUDENT' | 'COMPANY' | 'ADMIN';

export interface StudentProfile {
  id: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  university: string | null;
  courseOfStudy: string | null;
  yearOfStudy: number | null;
  skills: string[];
  biography: string | null;
  avatarUrl: string | null;
  coverUrl: string | null;
  verificationStatus: string;
}

export interface CompanyProfile {
  id: string;
  companyName: string;
  industry: string | null;
  description: string | null;
  website: string | null;
  location: string | null;
  logoUrl: string | null;
  coverUrl: string | null;
  verificationStatus: string;
}

export interface User {
  id: string;
  email: string;
  role: Role;
  isActive: boolean;
  studentProfile: StudentProfile | null;
  companyProfile: CompanyProfile | null;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Job {
  id: string;
  title: string;
  description: string;
  skillsRequired: string[];
  responsibilities: string[];
  academicRequirements: string | null;
  imageUrl: string | null;
  location: string | null;
  type: string;
  isPaid: boolean;
  stipend: number | null;
  duration: string | null;
  vacancies: number;
  deadline: string | null;
  isActive: boolean;
  createdAt: string;
  company: {
    id: string;
    companyProfile: {
      companyName: string;
      industry: string | null;
      logoUrl: string | null;
      location: string | null;
    } | null;
  };
  _count: {
    applications: number;
  };
}

export interface Application {
  id: string;
  status: string;
  appliedAt: string;
  coverNote: string | null;
  jobPosting: {
    id: string;
    title: string;
    company: {
      companyProfile: {
        companyName: string;
      } | null;
    };
  };
}

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}