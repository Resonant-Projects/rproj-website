/**
 * React Contact Form Component
 * Uses Astro Actions with React's useActionState for seamless form handling
 * Based on: https://www.youtube.com/watch?v=-0pbaYcQJ-0
 */
import { useActionState, useEffect } from 'react';
import { actions } from 'astro:actions';
import { withState } from '@astrojs/react/actions';
import type { ContactFormState } from '~/actions';

interface InputOption {
  value: string;
  label: string;
}

interface Input {
  name: string;
  label?: string;
  type: string;
  required?: boolean;
  placeholder?: string;
  autocomplete?: string;
  options?: InputOption[];
  defaultValue?: string;
}

interface Textarea {
  name: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  rows?: number;
}

interface ContactFormProps {
  title?: string;
  subtitle?: string;
  inputs: Input[];
  textarea: Textarea;
  button: string;
  description?: string;
}

// State type for the form - represents the result from the action
type FormState = {
  data: ContactFormState | undefined;
  error: { message: string } | undefined;
};

// Initial state: no submission yet (type assertion needed for discriminated union compatibility)
const initialState: FormState = { data: undefined, error: undefined };

// Helper to determine if a field has an error (for aria-invalid)
const hasFieldError = (state: FormState, fieldName: string): boolean => {
  // Check for per-field errors from action response
  if (state.data?.errors?.[fieldName]) {
    return true;
  }
  // If there's a general form error after submission, all required fields may be invalid
  if (state.error?.message) {
    return true;
  }
  return false;
};

export function ContactFormReact({ title, subtitle, inputs, textarea, button, description }: ContactFormProps) {
  // withState wraps the action for useActionState compatibility

  const [state, formAction, isPending] = useActionState(withState(actions.contact), initialState as any) as [
    FormState,
    (payload: FormData) => void,
    boolean,
  ];

  // Handle redirect on successful submission
  useEffect(() => {
    if (state.data?.success && state.data?.redirect) {
      window.location.href = state.data.redirect;
    }
  }, [state.data]);

  // Show success message if redirect isn't happening
  if (state.data?.success && !state.data?.redirect) {
    return (
      <div className="bg-accent/15 mx-auto flex w-full max-w-xl flex-col rounded-lg border border-accent p-4 shadow-md backdrop-blur-sm sm:p-6 lg:p-8">
        <div className="rounded border border-green-200 bg-green-50 px-4 py-3 text-green-700">
          <div className="flex items-center gap-2">
            <span className="text-xl">✅</span>
            <span>{state.data.message}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-accent/15 mx-auto flex w-full max-w-xl flex-col rounded-lg border border-accent p-4 shadow-md backdrop-blur-sm sm:p-6 lg:p-8">
      {/* Title and Subtitle */}
      {(title || subtitle) && (
        <div className="mb-6 text-center">
          {title && <h2 className="text-2xl font-bold text-foreground">{title}</h2>}
          {subtitle && <p className="text-muted-foreground mt-2">{subtitle}</p>}
        </div>
      )}

      {/* Error Display */}
      {state.error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-100 px-4 py-2 text-sm text-red-800" role="alert">
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01M4.93 4.93l14.14 14.14M9 21h6a2 2 0 002-2V9l-3-3H7a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
            <span>{state.error.message || 'An error occurred. Please try again.'}</span>
          </div>
        </div>
      )}

      {/* Form with action integration */}
      <form
        action={formAction}
        id="notion-contact-form"
        role="form"
        aria-label="Contact form"
        aria-describedby="form-description form-status"
      >
        {/* ARIA Live Regions */}
        <div className="sr-only">
          <div id="form-status" aria-live="polite" aria-atomic="true" />
          <div id="form-errors" aria-live="assertive" aria-atomic="false" />
          <div id="form-success" aria-live="polite" aria-atomic="true" />
          <div id="form-loading" aria-live="polite" aria-atomic="true">
            {isPending ? 'Submitting form...' : ''}
          </div>
        </div>

        {/* Input Fields */}
        {inputs.map(input => (
          <div key={input.name} className="mb-6">
            {input.label && (
              <label htmlFor={input.name} className="mb-2 block text-sm font-medium text-foreground">
                {input.label}
                {input.required && (
                  <span className="ml-1 text-red-500" aria-label="required">
                    *
                  </span>
                )}
              </label>
            )}

            {input.type === 'select' ? (
              <select
                name={input.name}
                id={input.name}
                required={input.required}
                aria-required={input.required ? 'true' : 'false'}
                aria-invalid={hasFieldError(state, input.name)}
                aria-describedby={`${input.name}-error ${input.name}-help`}
                defaultValue={input.defaultValue || ''}
                disabled={isPending}
                className="input-field text-md bg-muted/50 block w-full rounded-lg border border-border px-4 py-3 text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
              >
                {input.options?.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            ) : (
              <input
                type={input.type}
                name={input.name}
                id={input.name}
                autoComplete={input.autocomplete || 'on'}
                placeholder={input.placeholder}
                required={input.required}
                aria-required={input.required ? 'true' : 'false'}
                aria-invalid={hasFieldError(state, input.name)}
                aria-describedby={`${input.name}-error ${input.name}-help`}
                disabled={isPending}
                className="input-field text-md bg-muted/50 placeholder:text-muted-foreground block w-full rounded-lg border border-border px-4 py-3 text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
              />
            )}

            <div
              id={`${input.name}-error`}
              className="field-error-message"
              role="alert"
              aria-live="assertive"
              style={{ display: 'none' }}
            />
            <div id={`${input.name}-help`} className="field-help-text sr-only">
              {input.required ? `${input.label} is required` : `${input.label} is optional`}
            </div>
          </div>
        ))}

        {/* Textarea */}
        {textarea && (
          <div className="mb-6">
            <label htmlFor="textarea" className="mb-2 block text-sm font-medium text-foreground">
              {textarea.label}
              {textarea.required && (
                <span className="ml-1 text-red-500" aria-label="required">
                  *
                </span>
              )}
            </label>
            <textarea
              id="textarea"
              name={textarea.name || 'message'}
              rows={textarea.rows || 4}
              placeholder={textarea.placeholder}
              required={textarea.required}
              aria-required={textarea.required ? 'true' : 'false'}
              aria-invalid={hasFieldError(state, textarea.name || 'message')}
              aria-describedby="textarea-error textarea-help"
              disabled={isPending}
              className="input-field text-md resize-vertical bg-muted/50 placeholder:text-muted-foreground block w-full rounded-lg border border-border px-4 py-3 text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
            />
            <div
              id="textarea-error"
              className="field-error-message"
              role="alert"
              aria-live="assertive"
              style={{ display: 'none' }}
            />
            <div id="textarea-help" className="field-help-text sr-only">
              {textarea.required ? `${textarea.label} is required` : `${textarea.label} is optional`}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div className="mt-10 grid">
          <button
            type="submit"
            disabled={isPending}
            aria-describedby="submit-status"
            className="btn btn-primary text-primary-foreground hover:bg-primary/90 w-full rounded-lg bg-primary px-6 py-3 font-semibold shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPending ? (
              <span className="flex items-center justify-center gap-2">
                <svg
                  className="h-5 w-5 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Sending...
              </span>
            ) : (
              button
            )}
          </button>
          <div id="submit-status" className="sr-only" aria-live="polite">
            {isPending ? 'Submitting your message...' : ''}
          </div>
        </div>

        {/* Description */}
        {description && (
          <div className="mt-3 text-center">
            <p id="form-description" className="text-muted-foreground text-sm">
              {description}
            </p>
          </div>
        )}
      </form>
    </div>
  );
}

export default ContactFormReact;
