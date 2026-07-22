import { useState } from 'react';
import Button from '../common/Button';
import FieldError from '../common/FieldError';
import { validateRequired } from '../../utils/validation';

const EMPTY = {
  name: '',
  durationMinutes: 30,
  description: '',
  locationType: 'video_link',
  locationValue: '',
  bufferBeforeMinutes: 0,
  bufferAfterMinutes: 0,
  minNoticeMinutes: 0,
  bookingWindowDays: 60,
  maxBookingsPerDay: '',
  customQuestions: []
};

const inputClass = 'border border-gray-300 rounded-md px-3 py-2 text-sm w-full';
const labelClass = 'text-sm text-gray-600 flex flex-col gap-1';

export default function EventTypeForm({ onCreate }) {
  const [form, setForm] = useState(EMPTY);
  const [fieldErrors, setFieldErrors] = useState({ questionLabels: {} });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));
  const clearFieldError = (field) => setFieldErrors((f) => ({ ...f, [field]: '' }));

  const addQuestion = () => {
    update('customQuestions', [
      ...form.customQuestions,
      { id: `q${Date.now()}`, label: '', type: 'text', required: false }
    ]);
  };

  const updateQuestion = (idx, field, value) => {
    const next = [...form.customQuestions];
    next[idx] = { ...next[idx], [field]: value };
    update('customQuestions', next);
    if (field === 'label') {
      setFieldErrors((f) => ({ ...f, questionLabels: { ...f.questionLabels, [idx]: '' } }));
    }
  };

  const removeQuestion = (idx) => {
    update('customQuestions', form.customQuestions.filter((_, i) => i !== idx));
  };

  const submit = async (e) => {
    e.preventDefault();
    setError('');

    const questionLabels = {};
    form.customQuestions.forEach((q, idx) => {
      const msg = validateRequired(q.label, 'Question label');
      if (msg) questionLabels[idx] = msg;
    });

    const errors = {
      name: validateRequired(form.name, 'Name'),
      durationMinutes: form.durationMinutes >= 5 ? '' : 'Duration must be at least 5 minutes.',
      questionLabels
    };
    setFieldErrors(errors);
    if (errors.name || errors.durationMinutes || Object.values(questionLabels).some(Boolean)) return;

    try {
      setSubmitting(true);
      await onCreate({
        ...form,
        maxBookingsPerDay: form.maxBookingsPerDay === '' ? null : Number(form.maxBookingsPerDay)
      });
      setForm(EMPTY);
      setFieldErrors({ questionLabels: {} });
    } catch (err) {
      setError(err.response?.data?.error?.message || 'Failed to create event type.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-3 max-w-lg mb-6">
      <h3 className="font-medium text-gray-700">New event type</h3>
      <div>
        <input
          placeholder="Name"
          value={form.name}
          onChange={(e) => {
            update('name', e.target.value);
            clearFieldError('name');
          }}
          className={inputClass}
        />
        <FieldError message={fieldErrors.name} />
      </div>

      <label className={labelClass}>
        Duration (minutes)
        <input
          type="number"
          min={5}
          value={form.durationMinutes}
          onChange={(e) => {
            update('durationMinutes', Number(e.target.value));
            clearFieldError('durationMinutes');
          }}
          className={inputClass}
        />
        <FieldError message={fieldErrors.durationMinutes} />
      </label>

      <textarea
        placeholder="Description"
        value={form.description}
        onChange={(e) => update('description', e.target.value)}
        className={inputClass}
      />

      <select value={form.locationType} onChange={(e) => update('locationType', e.target.value)} className={inputClass}>
        <option value="video_link">Video link</option>
        <option value="phone">Phone</option>
        <option value="in_person">In person</option>
        <option value="custom">Custom</option>
      </select>
      <input
        placeholder="Location value (link, address, instructions)"
        value={form.locationValue}
        onChange={(e) => update('locationValue', e.target.value)}
        className={inputClass}
      />

      <div className="grid grid-cols-2 gap-3">
        <label className={labelClass}>
          Buffer before (min)
          <input
            type="number"
            min={0}
            value={form.bufferBeforeMinutes}
            onChange={(e) => update('bufferBeforeMinutes', Number(e.target.value))}
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          Buffer after (min)
          <input
            type="number"
            min={0}
            value={form.bufferAfterMinutes}
            onChange={(e) => update('bufferAfterMinutes', Number(e.target.value))}
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          Minimum notice (min)
          <input
            type="number"
            min={0}
            value={form.minNoticeMinutes}
            onChange={(e) => update('minNoticeMinutes', Number(e.target.value))}
            className={inputClass}
          />
        </label>
        <label className={labelClass}>
          Booking window (days out)
          <input
            type="number"
            min={1}
            value={form.bookingWindowDays}
            onChange={(e) => update('bookingWindowDays', Number(e.target.value))}
            className={inputClass}
          />
        </label>
      </div>

      <label className={labelClass}>
        Max bookings per day (blank = unlimited)
        <input
          type="number"
          min={1}
          value={form.maxBookingsPerDay}
          onChange={(e) => update('maxBookingsPerDay', e.target.value)}
          className={inputClass}
        />
      </label>

      <div>
        <h4 className="text-sm font-medium text-gray-700 mb-2">Custom questions</h4>
        {form.customQuestions.map((q, idx) => (
          <div key={q.id} className="mb-2">
            <div className="flex gap-2 items-center">
              <input
                placeholder="Question label"
                value={q.label}
                onChange={(e) => updateQuestion(idx, 'label', e.target.value)}
                className={inputClass}
              />
              <select value={q.type} onChange={(e) => updateQuestion(idx, 'type', e.target.value)} className={inputClass}>
                <option value="text">Text</option>
                <option value="textarea">Long text</option>
                <option value="dropdown">Dropdown</option>
              </select>
              <label className="flex items-center gap-1 text-sm text-gray-600 whitespace-nowrap">
                <input
                  type="checkbox"
                  checked={q.required}
                  onChange={(e) => updateQuestion(idx, 'required', e.target.checked)}
                />
                Required
              </label>
              <Button variant="ghost" type="button" onClick={() => removeQuestion(idx)}>
                Remove
              </Button>
            </div>
            <FieldError message={fieldErrors.questionLabels?.[idx]} />
          </div>
        ))}
        <Button variant="ghost" type="button" onClick={addQuestion}>
          + Add question
        </Button>
      </div>

      {error && <p className="text-red-500 text-sm">{error}</p>}
      <Button type="submit" disabled={submitting}>{submitting ? 'Creating...' : 'Create event type'}</Button>
    </form>
  );
}
