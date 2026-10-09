export type ApplicationStatus =
  | 'PENDING'
  | 'SHORTLISTED'
  | 'INTERVIEWING'
  | 'ACCEPTED'
  | 'REJECTED';

// The words a company sees. ACCEPTED and REJECTED are what the database stores.
export const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Under review',
  SHORTLISTED: 'Shortlisted',
  INTERVIEWING: 'Interviewing',
  ACCEPTED: 'Selected',
  REJECTED: 'Not selected',
};

export const getStatusLabel = (status: string): string =>
  STATUS_LABELS[status] ?? status;

export const isFinalDecision = (status: string): boolean =>
  status === 'ACCEPTED' || status === 'REJECTED';

interface MailInput {
  email: string;
  status: string;
  studentName: string;
  jobTitle: string;
  companyName: string;
}

// Opens the company's own email app with a ready to edit message.
export const buildStudentMailto = ({
  email,
  status,
  studentName,
  jobTitle,
  companyName,
}: MailInput): string => {
  const name = studentName.trim() || 'there';
  const role = jobTitle.trim() || 'the internship';
  let subject: string;
  let body: string;

  if (status === 'ACCEPTED') {
    subject = `Good news about your application for ${role}`;
    body =
      `Dear ${name},\n\n` +
      `Thank you for applying for the ${role} internship at ${companyName}. ` +
      `We are happy to tell you that you have been selected.\n\n` +
      `We will share the next steps with you soon. Please reply to this email to confirm that you accept the offer.\n\n` +
      `Kind regards,\n${companyName}`;
  } else if (status === 'REJECTED') {
    subject = `Your application for ${role}`;
    body =
      `Dear ${name},\n\n` +
      `Thank you for applying for the ${role} internship at ${companyName} and for the time you put into your application.\n\n` +
      `After careful thought, we have not selected you for this position. ` +
      `This is not a reflection of your potential, and we encourage you to apply for other roles with us in the future.\n\n` +
      `We wish you the very best.\n\n` +
      `Kind regards,\n${companyName}`;
  } else {
    subject = `About your application for ${role}`;
    body = `Dear ${name},\n\nThank you for applying for the ${role} internship at ${companyName}.\n\n\nKind regards,\n${companyName}`;
  }

  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};