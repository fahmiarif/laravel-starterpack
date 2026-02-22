import { z } from 'zod';

export const menuSchema = z.object({
    title: z.string().min(1, 'Judul menu wajib diisi'),
    url: z.string().nullable().optional(),
    icon: z.string().nullable().optional(),
    parent_id: z.string().nullable().optional(),
    order: z.number().int().min(0).default(0),
    is_active: z.boolean().default(true),
    roles: z.array(z.number()).default([]),
});

export type MenuFormData = z.infer<typeof menuSchema>;
