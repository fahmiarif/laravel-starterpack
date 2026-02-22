import { z } from "zod";

const baseUserSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters").max(255),
    email: z.string().email("Invalid email address").max(255),
    password: z.string().min(8, "Password must be at least 8 characters").optional().or(z.literal("")),
    password_confirmation: z.string().optional().or(z.literal("")),
    role: z.string().min(1, "Role is required"),
});

export const userSchema = baseUserSchema.refine(
    (data) => {
        if (data.password && data.password !== data.password_confirmation) {
            return false;
        }
        return true;
    },
    {
        message: "Passwords do not match",
        path: ["password_confirmation"],
    }
);

export type UserFormData = z.infer<typeof userSchema>;

export const createUserSchema = baseUserSchema
    .extend({
        password: z.string().min(8, "Password must be at least 8 characters"),
        password_confirmation: z.string().min(8, "Password confirmation is required"),
    })
    .refine(
        (data) => {
            if (data.password && data.password !== data.password_confirmation) {
                return false;
            }
            return true;
        },
        {
            message: "Passwords do not match",
            path: ["password_confirmation"],
        }
    );

export type CreateUserFormData = z.infer<typeof createUserSchema>;
