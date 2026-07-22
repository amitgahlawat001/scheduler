import FieldError from '../common/FieldError';

const inputClass = 'border border-gray-300 rounded-md px-3 py-2 text-sm w-full mt-1';

export default function CustomQuestionsForm({ questions, answers, onChange, errors = {}, onClearError }) {
  if (!questions || questions.length === 0) return null;

  const setAnswer = (questionId, answer) => {
    const next = answers.filter((a) => a.questionId !== questionId);
    next.push({ questionId, answer });
    onChange(next);
    onClearError?.(questionId);
  };

  const valueFor = (questionId) => answers.find((a) => a.questionId === questionId)?.answer || '';

  return (
    <div className="flex flex-col gap-3">
      {questions.map((q) => (
        <label key={q.id} className="text-sm text-gray-700">
          {q.label}
          {q.required ? ' *' : ''}
          {q.type === 'textarea' ? (
            <textarea value={valueFor(q.id)} onChange={(e) => setAnswer(q.id, e.target.value)} className={inputClass} />
          ) : q.type === 'dropdown' ? (
            <select value={valueFor(q.id)} onChange={(e) => setAnswer(q.id, e.target.value)} className={inputClass}>
              <option value="">Select...</option>
              {(q.options || []).map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          ) : (
            <input value={valueFor(q.id)} onChange={(e) => setAnswer(q.id, e.target.value)} className={inputClass} />
          )}
          <FieldError message={errors[q.id]} />
        </label>
      ))}
    </div>
  );
}
