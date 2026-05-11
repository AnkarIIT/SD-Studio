import { z } from 'zod';

/**
 * Email validation
 */
export const emailSchema = z.string().email('Invalid email address');

/**
 * Phone number validation (Indian format)
 */
export const phoneSchema = z
  .string()
  .regex(/^[6-9]\d{9}$/, 'Invalid Indian phone number');

/**
 * Address validation schema
 */
export const addressSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
  phone: phoneSchema,
  street: z.string().min(5, 'Street address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().regex(/^\d{6}$/, 'Pincode must be 6 digits'),
  country: z.string().default('India'),
});

/**
 * Login validation schema
 */
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

/**
 * Signup validation schema
 */
export const signupSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: emailSchema,
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

/**
 * Newsletter subscription validation
 */
export const newsletterSchema = z.object({
  email: emailSchema,
});

/**
 * Product review validation
 */
export const reviewSchema = z.object({
  rating: z.number().min(1, 'Rating is required').max(5, 'Rating must be between 1 and 5'),
  text: z.string().min(10, 'Review must be at least 10 characters').max(1000, 'Review must be less than 1000 characters'),
});

/**
 * Contact form validation
 */
export const contactSchema = z.object({
  name: z.string().min(2, 'Name is required'),
  email: emailSchema,
  phone: phoneSchema.optional(),
  subject: z.string().min(5, 'Subject is required'),
  message: z.string().min(20, 'Message must be at least 20 characters'),
});

/**
 * Validate and return errors
 */
export const validateForm = (schema: z.ZodSchema, data: unknown) => {
  try {
    const result = schema.parse(data);
    return { success: true, data: result, errors: {} };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach(err => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      return { success: false, data: null, errors };
    }
    return { success: false, data: null, errors: { form: 'Validation failed' } };
  }
};
