import jwksRsa from "jwks-rsa";
import jwt from "jsonwebtoken";

const client = jwksRsa({
  jwksUri: `https://${process.env.AUTH0_DOMAIN}/.well-known/jwks.json`,
});

const getKey = (header, callback) => {
  if (!header.kid) {
    console.error("No KID specified in JWT header");
    return callback(new Error("No KID specified in JWT header"));
  }

  client.getSigningKey(header.kid, (err, key) => {
    if (err) {
      console.error("Error getting signing key:", err);
      return callback(err);
    }
    if (!key || typeof key.getPublicKey !== "function") {
      console.error("Invalid key object:", key);
      return callback(new Error("Invalid key object"));
    }
    const signingKey = key.getPublicKey();
    callback(null, signingKey);
  });
};

const authMiddleware = async (req, res, next) => {
  if (
    !req.headers.authorization ||
    !req.headers.authorization.startsWith("Bearer ")
  ) {
    req.user = null;
    return next();
  }

  const token = req.headers.authorization.split(" ")[1];

  if (!token || token === "null" || token === "undefined") {
    req.user = null;
    return false;
  }
  try {

    jwt.verify(
      token,
      getKey,
      {
        audience: process.env.AUTH0_AUDIENCE,
        issuer: `https://${process.env.AUTH0_DOMAIN}`,
        algorithms: ["RS256"],
      },
      async (err, decoded) => {
        if (err) {
          console.error("JWT verification error:", err);
          req.user = null;
          return next();
        }
        req.user = decoded;
        return next();
      }
    );
  } catch (err) {
    console.error("JWT verification error:", err);
    req.user = null;
    return next();
  }
};

export default authMiddleware;
