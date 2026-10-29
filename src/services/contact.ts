import { getClient } from '@/lib/supabase';

export interface ContactInput {
  name: string;
  email: string;
  message: string;
  /** Honeypot: must stay empty. */
  website: string;
}

const MESSAGES: Record<string, string> = {
  too_fast: 'That was very quick. Please review your message and send it again.',
  rate_limited: 'Too many messages were sent recently. Please try again later or email me directly.',
  invalid_input: 'Please check your name, email and message, then try again.',
};

/** Validation and spam checks are enforced again inside the database function. */
export async function sendContactMessage(input: ContactInput, elapsedMs: number): Promise<void> {
  const { error } = await getClient().rpc('submit_contact_message', {
    p_name: input.name,
    p_email: input.email,
    p_message: input.message,
    p_website: input.website,
    p_elapsed_ms: Math.round(elapsedMs),
  });
  if (error) {
    throw new Error(MESSAGES[error.message] ?? 'The message could not be sent. Please try again or email me directly.');
  }
}
