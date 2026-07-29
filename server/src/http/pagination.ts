import { z } from "zod";

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 50;
export const MAX_CURSOR_LENGTH = 2048;

export type CursorValue = string | number | null;
export type CursorContext = Readonly<Record<string, string>>;

export type CursorDecodeResult =
  | { success: true; values: CursorValue[] }
  | { success: false };

export interface CursorPageInfo {
  nextCursor: string | null;
  hasNextPage: boolean;
}

export interface CursorPage<T> {
  items: T[];
  pageInfo: CursorPageInfo;
}

const canonicalLimitSchema = z
  .string()
  .regex(/^(?:[1-9]|[1-4][0-9]|50)$/)
  .default(String(DEFAULT_PAGE_SIZE))
  .transform(Number);

export const paginationQuerySchema = z.object({
  cursor: z.string().min(1).max(MAX_CURSOR_LENGTH).optional(),
  limit: canonicalLimitSchema,
});

const cursorValueSchema = z.union([
  z.string(),
  z.number().finite(),
  z.null(),
]);

const cursorPayloadSchema = z
  .object({
    v: z.literal(1),
    context: z.record(z.string(), z.string()),
    values: z.array(cursorValueSchema),
  })
  .strict();

// Sorts context keys so equivalent normalized queries encode identically.
const normalizeContext = (context: CursorContext): Record<string, string> =>
  Object.fromEntries(
    Object.entries(context).sort(([first], [second]) =>
      first.localeCompare(second),
    ),
  );

// Encodes ordered seek values into a versioned URL-safe token.
export const encodeCursor = (
  context: CursorContext,
  values: ReadonlyArray<CursorValue>,
): string => {
  const payload = cursorPayloadSchema.parse({
    v: 1,
    context: normalizeContext(context),
    values,
  });
  const token = Buffer.from(JSON.stringify(payload), "utf8").toString(
    "base64url",
  );

  if (token.length > MAX_CURSOR_LENGTH) {
    throw new RangeError("Cursor exceeds the maximum encoded length.");
  }

  return token;
};

// Safely decodes only cursors compatible with the current normalized query.
export const decodeCursor = (
  token: string,
  expectedContext: CursorContext,
  expectedValueCount: number,
): CursorDecodeResult => {
  if (
    token.length === 0 ||
    token.length > MAX_CURSOR_LENGTH ||
    !/^[A-Za-z0-9_-]+$/.test(token) ||
    !Number.isInteger(expectedValueCount) ||
    expectedValueCount < 0
  ) {
    return { success: false };
  }

  try {
    const rawPayload: unknown = JSON.parse(
      Buffer.from(token, "base64url").toString("utf8"),
    );
    const result = cursorPayloadSchema.safeParse(rawPayload);

    if (
      !result.success ||
      result.data.values.length !== expectedValueCount ||
      JSON.stringify(normalizeContext(result.data.context)) !==
        JSON.stringify(normalizeContext(expectedContext))
    ) {
      return { success: false };
    }

    return { success: true, values: result.data.values };
  } catch {
    return { success: false };
  }
};

// Converts a limit-plus-one result set into the shared response page.
export const buildCursorPage = <T>(
  rows: ReadonlyArray<T>,
  limit: number,
  context: CursorContext,
  cursorValues: (item: T) => ReadonlyArray<CursorValue>,
): CursorPage<T> => {
  if (
    !Number.isInteger(limit) ||
    limit < 1 ||
    limit > MAX_PAGE_SIZE ||
    rows.length > limit + 1
  ) {
    throw new RangeError("Invalid cursor page input.");
  }

  const hasNextPage = rows.length > limit;
  const items = rows.slice(0, limit);
  const lastItem = hasNextPage ? items.at(-1) : undefined;

  return {
    items,
    pageInfo: {
      nextCursor:
        lastItem === undefined
          ? null
          : encodeCursor(context, cursorValues(lastItem)),
      hasNextPage,
    },
  };
};
