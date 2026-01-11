const admin = require("../firebase");

module.exports = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    console.log("🔍 Auth check on:", req.url);
    console.log("   Has auth header:", !!authHeader);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.error("❌ Missing or invalid Authorization header");
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    
    if (!token) {
      console.error("❌ Token is empty or malformed");
      return res.status(401).json({ message: "Invalid token format" });
    }
    
    console.log("✅ Token found, length:", token.length);

    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      console.log("✅ Token verified for user:", decodedToken.uid);

      req.user = decodedToken; 
      next();
    } catch (tokenError) {
      console.error("❌ Token verification failed:", tokenError.code, tokenError.message);
      return res.status(403).json({ 
        message: "Invalid or expired token",
        error: tokenError.code 
      });
    }
  } catch (error) {
    console.error("❌ Unexpected auth error:", error.message);
    return res.status(403).json({ message: "Authentication failed" });
  }
};
