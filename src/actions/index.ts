/**
 * Astro Actions for form handling
 * Uses React useActionState integration for enhanced form experiences
 */
import { defineAction, ActionError } from 'astro:actions';
import { z } from 'astro:schema';
import { Client } from '@notionhq/client';
import { Resend } from 'resend';
import { render } from '@react-email/render';
import React from 'react';
import ResonantWelcomeEmail from '~/utils/welcome-email';

const resend = new Resend(import.meta.env.RESEND_API_KEY);
const notion = new Client({
  auth: import.meta.env.NOTION_TOKEN,
  notionVersion: '2025-09-03',
});

const ALLOWED_SERVICES = ['Design', 'Rhythm', 'Color', 'Motion'] as const;

// State type for useActionState integration
export interface ContactFormState {
  success: boolean;
  message: string;
  redirect?: string;
  errors?: Record<string, string>;
}

export const server = {
  /**
   * Contact form submission action
   * Designed to work with React's useActionState via actions.contact.withState
   */
  contact: defineAction({
    accept: 'form',
    input: z.object({
      name: z.string().min(1, 'Name is required').max(100, 'Name is too long'),
      email: z.string().email('Invalid email address'),
      service: z.enum(ALLOWED_SERVICES, {
        errorMap: () => ({ message: 'Please select a valid service' }),
      }),
      message: z.string().min(1, 'Message is required').max(5000, 'Message is too long (5000 characters max)'),
    }),
    handler: async ({ name, email, service, message }): Promise<ContactFormState> => {
      console.debug('[action:contact] Processing form submission for:', name);

      // Business logic validation
      const prohibitedWords = ['spam', 'test123', 'dummy'];
      for (const word of prohibitedWords) {
        if (message.toLowerCase().includes(word) || name.toLowerCase().includes(word)) {
          throw new ActionError({
            code: 'BAD_REQUEST',
            message: 'Your submission contains content that cannot be processed. Please revise and try again.',
          });
        }
      }

      try {
        // Resolve data_source_id from database_id (API 2025-09-03)
        const databaseId = import.meta.env.NOTION_DATABASE_ID;
        let dataSourceId: string | null = null;

        try {
          const db = await notion.databases.retrieve({ database_id: databaseId });
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const dataSources = (db as any).data_sources;
          if (dataSources?.[0]?.id) {
            dataSourceId = dataSources[0].id;
            console.debug('[action:contact] Resolved data_source_id');
          }
        } catch (e) {
          console.warn('[action:contact] Failed to resolve data_source_id:', e);
        }

        // Dynamically choose parent type based on resolution result
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const parent: any = dataSourceId
          ? { type: 'data_source_id', data_source_id: dataSourceId }
          : { database_id: databaseId };

        // Create Notion page
        console.debug('[action:contact] Creating Notion page');
        await notion.pages.create({
          parent,
          properties: {
            Name: {
              title: [{ text: { content: name } }],
            },
            Email: { email },
            Service: {
              select: { name: service },
            },
            Message: {
              rich_text: [{ text: { content: message } }],
            },
          },
        });

        // Compose and send welcome email
        const steps = [
          {
            id: 1,
            description: `Thank you, ${name}! I'll review your message about ${service} and respond with tailored insights or next steps.`,
          },
          {
            id: 2,
            description: `Project exploration. We'll discuss your goals, inspirations, and how Resonant Projects.art can support your vision.`,
          },
          {
            id: 3,
            description: `Resource sharing. You'll receive curated resources, ideas, and opportunities to collaborate or learn more.`,
          },
        ];

        const html = await render(React.createElement(ResonantWelcomeEmail, { steps }));

        await resend.emails.send({
          from: 'info@rproj.art',
          to: email,
          subject: 'Welcome to Resonant Projects.art!',
          html,
        });

        console.debug('[action:contact] Form submitted and email sent successfully');

        return {
          success: true,
          message: 'Form submitted successfully!',
          redirect: '/thank-you',
        };
      } catch (error) {
        console.error('[action:contact] Error processing form:', error);

        // Re-throw ActionErrors as-is
        if (error instanceof ActionError) {
          throw error;
        }

        // Classify and throw appropriate error
        const errorString = String(error).toLowerCase();

        if (errorString.includes('notion')) {
          throw new ActionError({
            code: 'INTERNAL_SERVER_ERROR',
            message: 'External service temporarily unavailable. Please try again.',
          });
        }

        if (errorString.includes('resend') || errorString.includes('email')) {
          // Non-critical: form was submitted but email failed
          console.warn('[action:contact] Email failed but form was submitted');
          return {
            success: true,
            message: 'Form submitted! Confirmation email may be delayed.',
            redirect: '/thank-you',
          };
        }

        throw new ActionError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An error occurred. Please try again later.',
        });
      }
    },
  }),
};
