/**
 * React Contact Form Component
 * Uses Astro Actions with React's useActionState for seamless form handling
 * Based on: https://www.youtube.com/watch?v=-0pbaYcQJ-0
 */
import { useActionState, useEffect } from 'react';
import { actions } from 'astro:actions';
import { withState } from '@astrojs/react/actions';
import type { ContactFormState } from '~/actions';

/**
 * Option for select/dropdown inputs
 * @property value - The value submitted with the form
 * @property label - Display text shown to users
 */
interface InputOption {
  value: string;
  label: string;
}

/**
 * Configuration for a form input field
 * @property name - Input name attribute (used as form data key)
 * @property label - Optional label text displayed above the input
 * @property type - Input type (text, email, select, etc.)
 * @property required - Whether the field is required
 * @property placeholder - Placeholder text shown when empty
 * @property autocomplete - HTML autocomplete attribute value
 * @property options - Options for select inputs
 * @property defaultValue - Initial value for the input
 */
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

/**
 * Configuration for the textarea field
 * @property name - Textarea name attribute
 * @property label - Label text displayed above the textarea
 * @property required - Whether the field is required
 * @property placeholder - Placeholder text shown when empty
 * @property rows - Number of visible text rows
 */
interface Textarea {
  name: string;
  label: string;
  required?: boolean;
  placeholder?: string;
  rows?: number;
}

/**
 * Props for the ContactFormReact component
 * @property title - Optional form title
 * @property subtitle - Optional subtitle text
 * @property inputs - Array of input field configurations
 * @property textarea - Textarea field configuration
 * @property button - Submit button text
 * @property description - Optional description shown below the form
 */
interface ContactFormProps {
  title?: string;
  subtitle?: string;
  inputs: Input[];
  textarea: Textarea;
  button: string;
  description?: string;
}

/** Initial state before any form submission - matches SafeResult success variant */
const initialState = {
  data: { success: false, message: '' } as ContactFormState,
  error: undefined,
};

/**
 * Determines if a form field has a validation error.
 * @param state - Current form state from useActionState (SafeResult union)
 * @param fieldName - Name of the field to check
 * @returns True if the field has an explicit error
 */
const hasFieldError = (
  state: { data?: ContactFormState | undefined; error?: { message: string } | undefined },
  fieldName: string
): boolean => {
  return Boolean(state.data?.errors?.[fieldName]);
};

/**
 * Contact form component using Astro Actions with React's useActionState.
 *
 * Features:
 * - Server-side form handling via Astro Actions
 * - Pending state indication during submission
 * - Automatic redirect on successful submission
 * - Per-field and global error display
 * - Full ARIA accessibility support
 *
 * @param props - Form configuration props
 * @param props.title - Optional title displayed above the form
 * @param props.subtitle - Optional subtitle text
 * @param props.inputs - Array of input field configurations
 * @param props.textarea - Textarea configuration for the message field
 * @param props.button - Text for the submit button
 * @param props.description - Optional description shown below the submit button
 *
 * @example
 * <ContactFormReact
 *   title="Get in Touch"
 *   inputs={[
 *     { name: 'name', label: 'Name', type: 'text', required: true },
 *     { name: 'email', label: 'Email', type: 'email', required: true },
 *   ]}
 *   textarea={{ name: 'message', label: 'Message', required: true }}
 *   button="Send Message"
 * />
 */
export function ContactFormReact({ title, subtitle, inputs, textarea, button, description }: ContactFormProps) {
  const [state, formAction, isPending] = useActionState(withState(actions.contact), initialState);

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
        {textarea &&
          (() => {
            const textareaId = textarea.name || 'message';
            return (
              <div className="mb-6">
                <label htmlFor={textareaId} className="mb-2 block text-sm font-medium text-foreground">
                  {textarea.label}
                  {textarea.required && (
                    <span className="ml-1 text-red-500" aria-label="required">
                      *
                    </span>
                  )}
                </label>
                <textarea
                  id={textareaId}
                  name={textareaId}
                  rows={textarea.rows || 4}
                  placeholder={textarea.placeholder}
                  required={textarea.required}
                  aria-required={textarea.required ? 'true' : 'false'}
                  aria-invalid={hasFieldError(state, textareaId)}
                  aria-describedby={`${textareaId}-error ${textareaId}-help`}
                  disabled={isPending}
                  className="input-field text-md resize-vertical bg-muted/50 placeholder:text-muted-foreground block w-full rounded-lg border border-border px-4 py-3 text-foreground transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
                />
                <div
                  id={`${textareaId}-error`}
                  className="field-error-message"
                  role="alert"
                  aria-live="assertive"
                  style={{ display: 'none' }}
                />
                <div id={`${textareaId}-help`} className="field-help-text sr-only">
                  {textarea.required ? `${textarea.label} is required` : `${textarea.label} is optional`}
                </div>
              </div>
            );
          })()}

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
