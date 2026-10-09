import { Check, Mail, X } from 'lucide-react';
import { buildGmailLink, buildStudentMailto, getStatusLabel } from '../../utils/applicationStatus';

interface ApplicantActionsProps {
  status: string;
  busy: boolean;
  studentName: string;
  email?: string | null;
  jobTitle?: string;
  companyName: string;
  onChange: (status: string) => void;
}

// The decision buttons for one applicant. Used on the review board and on the
// applicant profile page so both always behave the same way.
const ApplicantActions = ({
  status,
  busy,
  studentName,
  email,
  jobTitle,
  companyName,
  onChange,
}: ApplicantActionsProps) => {
  const isSelected = status === 'ACCEPTED';
  const isDeclined = status === 'REJECTED';
  const isOpen = !isSelected && !isDeclined;
  const name = studentName.trim() || 'this student';

  const decide = (next: 'ACCEPTED' | 'REJECTED') => {
    const message =
      next === 'ACCEPTED'
        ? `Select ${name}? The student will see "Selected" on their applications page.`
        : `Decline ${name}? The student will see "Not selected" on their applications page.`;
    if (window.confirm(message)) onChange(next);
  };

  const mailInput = email
    ? { email, status, studentName, jobTitle: jobTitle ?? '', companyName }
    : null;
  const gmailLink = mailInput ? buildGmailLink(mailInput) : null;
  const mailto = mailInput ? buildStudentMailto(mailInput) : null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {isOpen && (
        <>
          {status === 'SHORTLISTED' ? (
            <div className="flex items-center gap-2 bg-teal-light text-teal-dark text-sm font-semibold px-4 py-2.5 rounded-xl">
              <Check className="w-4 h-4 text-teal" /> Shortlisted
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onChange('SHORTLISTED')}
              disabled={busy}
              className="bg-navy text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-navy-light transition-colors disabled:opacity-50">
              {busy ? '...' : 'Shortlist'}
            </button>
          )}
          <button
            type="button"
            onClick={() => decide('ACCEPTED')}
            disabled={busy}
            className="bg-teal text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-teal-dark transition-colors disabled:opacity-50">
            Select
          </button>
          <button
            type="button"
            onClick={() => decide('REJECTED')}
            disabled={busy}
            className="border border-red-200 text-red-500 text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-red-50 transition-colors disabled:opacity-50">
            Decline
          </button>
        </>
      )}

      {isSelected && (
        <div className="flex items-center gap-2 bg-teal-light text-teal-dark text-sm font-semibold px-4 py-2.5 rounded-xl">
          <Check className="w-4 h-4 text-teal" /> {getStatusLabel(status)}
        </div>
      )}

      {isDeclined && (
        <div className="flex items-center gap-2 bg-red-50 text-red-500 text-sm font-semibold px-4 py-2.5 rounded-xl">
          <X className="w-4 h-4" /> {getStatusLabel(status)}
        </div>
      )}

      {!isOpen && gmailLink && (
        <div className="flex items-center gap-2">
          <a
            href={gmailLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 border border-gray-200 text-navy text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-gray-50 transition-colors">
            <Mail className="w-4 h-4" /> Email student
          </a>
          <a
            href={mailto ?? undefined}
            className="text-xs font-semibold text-gray-400 hover:text-navy underline underline-offset-2 transition-colors">
            Use mail app
          </a>
        </div>
      )}

      {!isOpen && (
        <button
          type="button"
          onClick={() => onChange('SHORTLISTED')}
          disabled={busy}
          className="text-xs font-semibold text-gray-400 hover:text-navy underline underline-offset-2 transition-colors disabled:opacity-50">
          Change decision
        </button>
      )}
    </div>
  );
};

export default ApplicantActions;