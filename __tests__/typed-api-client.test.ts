import { createTypedApiClient } from "@/lib/typedApiClient";
import type { InferResponseType } from "hono/client";

const profileResponse = {
  profile: {
    id: "00000000-0000-4000-8000-000000000001",
    email: "cook@example.com",
    displayName: "Cook",
    bio: null,
    avatarImageUrl: null,
  },
};

describe("createTypedApiClient", () => {
  it("sends a typed protected profile request to the normalized v1 URL", async () => {
    let capturedRequest: Request | undefined;

    // Captures the real Hono client request without external network access.
    const fetchImpl: typeof fetch = async (input, init) => {
      capturedRequest = new Request(input, init);
      return new Response(JSON.stringify(profileResponse), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    };
    const client = createTypedApiClient({
      baseUrl: "http://api.test///",
      fetch: fetchImpl,
    });

    const response = await client.v1.profiles.me.$get(undefined, {
      headers: { Authorization: "Bearer access-token" },
    });
    type PrivateProfileResponse = InferResponseType<
      typeof client.v1.profiles.me.$get,
      200
    >;
    if (response.status !== 200) {
      throw new Error(`Expected a 200 profile response, received ${response.status}`);
    }
    const body: PrivateProfileResponse = await response.json();

    expect(capturedRequest).toBeDefined();
    expect(capturedRequest?.url).toBe("http://api.test/v1/profiles/me");
    expect(capturedRequest?.method).toBe("GET");
    expect(capturedRequest?.headers.get("Authorization")).toBe("Bearer access-token");
    expect(body).toEqual(profileResponse);
  });
});
