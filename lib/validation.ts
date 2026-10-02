import { z } from 'zod';

export const destinationSchema = z
  .string()
  .trim()
  .regex(/^\+?[0-9]{6,20}$/, 'Destination must be a valid phone number');

export const callerIdSchema = z
  .string()
  .trim()
  .regex(/^$|^\+?[0-9]{3,20}$/, 'Caller ID must be blank or a valid phone number');

export const transferModeSchema = z.enum(['blind', 'attended']);
