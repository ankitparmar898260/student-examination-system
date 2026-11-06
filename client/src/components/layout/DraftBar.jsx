import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useEnrollmentDraft } from "../../context/EnrollmentDraftContext";
import ConfirmDialog from "../ui/ConfirmDialog";
import { X } from "lucide-react";

/**
 * Component: DraftBar
 * Purpose: Minimal persistent floating pill notifying users of active enrollment draft selections on non-enrollment pages.
 */
export default function DraftBar() {
  const { selectedIds, draftExamId, clear } = useEnrollmentDraft();
  const location = useLocation();
  const navigate = useNavigate();
  const [showConfirmDiscard, setShowConfirmDiscard] = useState(false);

  // Hidden on the /enrollment page or when there are no draft selections
  if (location.pathname === "/enrollment" || !selectedIds || selectedIds.size === 0) {
    return null;
  }

  const count = selectedIds.size;

  const handleContinue = () => {
    if (draftExamId) {
      navigate(`/enrollment?examId=${draftExamId}`);
    } else {
      navigate("/enrollment");
    }
  };

  return (
    <>
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 no-print animate-in fade-in slide-in-from-bottom-2 duration-200">
        <div className="flex items-center gap-3 bg-white border border-slate-200 shadow-md rounded-full px-4 py-2 text-sm text-slate-700 whitespace-nowrap">
          <span>{count} selected for enrollment</span>
          <button
            type="button"
            onClick={handleContinue}
            className="text-blue-600 font-medium hover:underline cursor-pointer"
          >
            Continue
          </button>
          <button
            type="button"
            onClick={() => setShowConfirmDiscard(true)}
            className="text-slate-400 hover:text-slate-600 transition-colors p-0.5 rounded cursor-pointer"
            title="Discard draft"
            aria-label="Discard draft"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Confirmation Dialog before discarding draft */}
      <ConfirmDialog
        isOpen={showConfirmDiscard}
        onCancel={() => setShowConfirmDiscard(false)}
        onConfirm={() => {
          clear();
          setShowConfirmDiscard(false);
        }}
        message={`Are you sure you want to discard your draft selection of ${count} candidate(s)?`}
        confirmLabel="Discard Draft"
      />
    </>
  );
}
