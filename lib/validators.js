import { z } from 'zod';

const emailSchema = z.string().trim().email('Enter a valid email address.').max(254);
const passwordSchema = z.string().min(8, 'Password must be at least 8 characters.').max(100);

export const signupSchema = z.object({
  name: z.string().trim().min(2, 'Enter your full name.').max(100),
  email: emailSchema,
  phone: z.string().trim().min(7, 'Enter a valid mobile number.').max(24),
  password: passwordSchema,
  state: z.string().trim().min(1, 'Choose your state.').max(80),
  city: z.string().trim().min(1, 'Enter your city.').max(80),
});

export const reportSchema = z.object({
  name: z.string().trim().min(2, 'Enter an item name.').max(120),
  category: z.string().trim().min(1, 'Choose a category.'),
  description: z.string().trim().min(12, 'Add a few more details (at least 12 characters).').max(3000),
  brand: z.string().trim().max(80).optional().default(''),
  color: z.string().trim().max(80).optional().default(''),
  marks: z.string().trim().max(1000).optional().default(''),
  date: z.string().trim().min(1, 'Choose the date.'),
  time: z.string().trim().max(20).optional().default(''),
  state: z.string().trim().min(1, 'Choose the state.'),
  city: z.string().trim().min(1, 'Enter the city.'),
  location: z.string().trim().min(3, 'Add a nearby landmark or location.').max(250),
  image: z.string().max(1_500_000).refine((value) => !value || /^data:image\/(?:jpeg|png|webp|gif);base64,/i.test(value), 'Upload a valid image file.').optional().default(''),
  additionalInfo: z.string().trim().max(2000).optional().default(''),
  secured: z.boolean().optional().default(false),
});
