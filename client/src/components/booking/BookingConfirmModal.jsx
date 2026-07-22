import { useState } from 'react';
import Button from '../common/Button';
import CustomQuestionsForm from './CustomQuestionsForm';
import FieldError from '../common/FieldError';
import { validateEmail, validateRequired } from '../../utils/validation';
import { utcToLocalLabel } from '../../utils/timezone';

const inputClass = 'border border-gray-300 rounded-md px-3 py-2 text-sm w-full';

export default function BookingConfirmModal({ slot, eventType, onConfirm, onClose }) {
  const [visitorName, setVisitorName] = useState('');
  const [visitorEmail, setVisitorEmail] = useState('');
  const [answers, setAnswers] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [questionErrors, setQuestionErrors] = useState({});
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const clearFieldError = (field) => setFieldErrors((f) => ({ ...f, [field]: '' }));
  const clearQuestionError = (questionId) => setQuestionErrors((q) => ({ ...q, [questionId]: '' }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');

    const answerFor = (questionId) => answers.find((a) => a.questionId === questionId)?.answer || '';
    const qErrors = {};
    (eventType.customQuestions || []).forEach((q) => {
      if (q.required) {
        const msg = validateRequired(answerFor(q.id), q.label);
        if (msg) qErrors[q.id] = msg;
      }
    });

    const errors = {
      visitorName: validateRequired(visitorName, 'Name'),
      visitorEmail: validateEmail(visitorEmail)
    };
    setFieldErrors(errors);
    setQuestionErrors(qErrors);
    if (errors.visitorName || errors.visitorEmail || Object.values(qErrors).some(Boolean)) return;

    setSubmitting(true);
    try {
      await onConfirm({ slotStartUTC: slot, visitorName, visitorEmail, customAnswers: answers });
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Could not confirm booking.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
      <form
        onSubmit={submit}
        noValidate
        className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 w-full max-w-sm flex flex-col gap-3"
      >
        <h3 className="text-lg font-semibold text-gray-800">Confirm booking</h3>
        <p className="text-gray-600 text-sm">{utcToLocalLabel(slot)}</p>

        <div>
          <input
            placeholder="Your name"
            value={visitorName}
            onChange={(e) => {
              setVisitorName(e.target.value);
              clearFieldError('visitorName');
            }}
            className={inputClass}
          />
          <FieldError message={fieldErrors.visitorName} />
        </div>

        <div>
          <input
            type="email"
            placeholder="Your email"
            value={visitorEmail}
            onChange={(e) => {
              setVisitorEmail(e.target.value);
              clearFieldError('visitorEmail');
            }}
            className={inputClass}
          />
          <FieldError message={fieldErrors.visitorEmail} />
        </div>

        <CustomQuestionsForm
          questions={eventType.customQuestions}
          answers={answers}
          onChange={setAnswers}
          errors={questionErrors}
          onClearError={clearQuestionError}
        />

        {error && <p className="text-red-500 text-sm">{error}</p>}
        <div className="flex gap-2 justify-end pt-2">
          <Button variant="ghost" type="button" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Booking...' : 'Confirm'}
          </Button>
        </div>
      </form>
    </div>
  );
}
