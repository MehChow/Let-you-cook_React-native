import { z } from "zod";

export const updateProfileInputSchema = z.object({
  displayName: z.string().min(1).max(80).optional(),
  bio: z.string().max(500).nullable().optional(),
  avatarImageUrl: z.url().nullable().optional(),
});

export const editableProfileSchema = z.strictObject({
  displayName: z.string().min(1).max(80),
  bio: z.string().max(500).nullable(),
  avatarImageUrl: z.url().nullable(),
});

export const privateProfileSchema = editableProfileSchema.extend({
  id: z.uuid(),
  email: z.email(),
});

export const privateProfileResponseSchema = z.strictObject({
  profile: privateProfileSchema,
});

export const updateProfileResponseSchema = z.strictObject({
  profile: editableProfileSchema,
});

export type UpdateProfileInput = z.infer<
  typeof updateProfileInputSchema
>;
export type EditableProfile = z.infer<typeof editableProfileSchema>;
export type PrivateProfile = z.infer<typeof privateProfileSchema>;
export type PrivateProfileResponse = z.infer<
  typeof privateProfileResponseSchema
>;
export type UpdateProfileResponse = z.infer<
  typeof updateProfileResponseSchema
>;
