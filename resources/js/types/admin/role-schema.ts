import { z } from 'zod';

export const roleSchema = z.object({
    name: z.string().min(1, 'Name is required').max(255),
    permissions: z.array(z.string()),
});

export type RoleFormData = z.infer<typeof roleSchema>;
