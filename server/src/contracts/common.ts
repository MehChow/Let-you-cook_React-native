import { z } from "zod";

export const opaqueIdSchema = z.string().min(1);
export const isoTimestampSchema = z.iso.datetime({ offset: false });

export const nonValidationErrorCodes = [
  "malformed_request",
  "authentication_required",
  "invalid_access_token",
  "invalid_credentials",
  "invalid_refresh_token",
  "refresh_token_expired",
  "refresh_token_reuse_detected",
  "resource_not_found",
  "route_not_found",
  "email_already_registered",
  "not_implemented",
  "internal_server_error",
] as const;

export const nonValidationErrorCodeSchema = z.enum(
  nonValidationErrorCodes,
);

export const fieldErrorsSchema = z.record(
  z.string(),
  z.array(z.string()).min(1),
);

export const validationApiErrorSchema = z.strictObject({
  code: z.literal("validation_failed"),
  message: z.string(),
  fieldErrors: fieldErrorsSchema,
  requestId: z.uuid(),
});

export const nonValidationApiErrorSchema = z.strictObject({
  code: nonValidationErrorCodeSchema,
  message: z.string(),
  requestId: z.uuid(),
});

export const apiErrorEnvelopeSchema = z.strictObject({
  error: z.union([
    validationApiErrorSchema,
    nonValidationApiErrorSchema,
  ]),
});

export const pageInfoSchema = z.union([
  z.strictObject({
    nextCursor: z.string().min(1),
    hasNextPage: z.literal(true),
  }),
  z.strictObject({
    nextCursor: z.null(),
    hasNextPage: z.literal(false),
  }),
]);

// Builds a strict cursor-page schema around one feature item contract.
export const cursorPageSchema = <ItemSchema extends z.ZodType>(
  itemSchema: ItemSchema,
) =>
  z.strictObject({
    items: z.array(itemSchema),
    pageInfo: pageInfoSchema,
  });

export type NonValidationErrorCode = z.infer<
  typeof nonValidationErrorCodeSchema
>;
export type FieldErrors = z.infer<typeof fieldErrorsSchema>;
export type ValidationApiError = z.infer<typeof validationApiErrorSchema>;
export type NonValidationApiError = z.infer<
  typeof nonValidationApiErrorSchema
>;
export type ApiErrorEnvelope = z.infer<typeof apiErrorEnvelopeSchema>;
export type PageInfo = z.infer<typeof pageInfoSchema>;
