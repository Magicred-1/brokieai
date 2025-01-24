import { JwksClient } from "jwks-rsa";
import jwt, { JwtPayload } from "jsonwebtoken";

const DYNAMIC_ID = process.env.DYNAMIC_PROJECT_ID;

export async function middleware(req: Request) {
  const jwksUrl = `https://app.dynamic.xyz/api/v0/sdk/${DYNAMIC_ID}/.well-known/jwks`;

  const client = new JwksClient({
    jwksUri: jwksUrl,
    rateLimit: true,
    cache: true,
    cacheMaxEntries: 5,
    cacheMaxAge: 600000, // 10 minutes
  });

  const signingKey = await client.getSigningKey();
  const publicKey = signingKey.getPublicKey();

  const token = req.headers
    .get("Authorization")
    ?.split(" ")[1]
    .replace(/"/g, "");

  if (!token) {
    return "401";
  }

  try {
    const decodedToken = jwt.verify(token, publicKey, {
      ignoreExpiration: false,
    }) as JwtPayload;

    if (decodedToken.scopes?.includes("requiresAdditionalAuth")) {
      return "403";
    }

    const userAddress = decodedToken.verified_credentials?.[0]?.address;
    return userAddress;
  } catch (error) {
    return "401";
  }
}
