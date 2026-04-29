const express = require("express");
const router = express.Router();
const { sendVerificationEmail } = require("../utils/emailService");
const { generateToken, authenticateToken } = require("../utils/jwtUtils");

// Generate random 6-digit verification code
function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Validate email format
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// POST /api/auth/signup - Create a new user account
router.post("/signup", async (req, res) => {
  try {
    const supabase = req.supabase;
    const { email } = req.body;

    // Validate input
    if (!email) {
      console.error("Signup: Email not provided");
      return res.status(400).json({ error: "Email is required" });
    }

    if (!isValidEmail(email)) {
      console.error(`Signup: Invalid email format - ${email}`);
      return res.status(400).json({ error: "Invalid email format" });
    }

    const normalizedEmail = email.toLowerCase();

    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from("users")
      .select("id")
      .eq("email", normalizedEmail)
      .single();

    if (checkError && checkError.code !== "PGRST116") {
      console.error("Signup: Error checking existing user:", checkError);
      return res.status(500).json({ error: "Database error" });
    }

    let userId = existingUser?.id;

    // If user doesn't exist, create them
    if (!existingUser) {
      const { data: newUser, error: createUserError } = await supabase
        .from("users")
        .insert([
          {
            email: normalizedEmail,
            verified: false,
          },
        ])
        .select()
        .single();

      if (createUserError) {
        console.error("Signup: Error creating user:", createUserError);
        return res.status(500).json({ error: "Failed to create user" });
      }

      userId = newUser.id;
      console.log(`New user created: ${normalizedEmail}, user_id: ${userId}`);
    } else {
      console.log(`Existing user logging in: ${normalizedEmail}`);
    }

    // Generate verification code
    const verificationCode = generateVerificationCode();

    // Store verification code
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes
    const { error: codeError } = await supabase
      .from("verification_codes")
      .insert([
        {
          email: normalizedEmail,
          code: verificationCode,
          expires_at: expiresAt,
        },
      ]);

    if (codeError) {
      console.error("Signup: Error storing verification code:", codeError);
      return res
        .status(500)
        .json({ error: "Failed to generate verification code" });
    }

    // Send verification code via email
    const emailSent = await sendVerificationEmail(
      normalizedEmail,
      verificationCode
    );

    if (!emailSent) {
      console.error("Signup: Failed to send email");
      return res.status(500).json({
        error: "Failed to send verification email. Please try again.",
      });
    }

    res.status(200).json({
      success: true,
      user_id: userId,
      email: normalizedEmail,
      message: "Check your email for the verification code.",
    });
  } catch (err) {
    console.error("Error in POST /api/auth/signup:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/auth/send-code - Send verification code for login
router.post("/send-code", async (req, res) => {
  try {
    const supabase = req.supabase;
    const { email } = req.body;

    // Validate input
    if (!email) {
      console.error("Send-code: Email not provided");
      return res.status(400).json({ error: "Email is required" });
    }

    if (!isValidEmail(email)) {
      console.error(`Send-code: Invalid email format - ${email}`);
      return res.status(400).json({ error: "Invalid email format" });
    }

    const normalizedEmail = email.toLowerCase();

    // Check if user exists
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("email", normalizedEmail)
      .single();

    if (userError && userError.code !== "PGRST116") {
      console.error("Send-code: Database error:", userError);
      return res.status(500).json({ error: "Database error" });
    }

    if (!user) {
      console.error(`Send-code: User not found - ${normalizedEmail}`);
      return res
        .status(404)
        .json({ error: "Email not registered. Please sign up first." });
    }

    // Generate verification code
    const verificationCode = generateVerificationCode();

    // Store verification code
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes
    const { error: codeError } = await supabase
      .from("verification_codes")
      .insert([
        {
          email: normalizedEmail,
          code: verificationCode,
          expires_at: expiresAt,
        },
      ]);

    if (codeError) {
      console.error("Send-code: Error storing verification code:", codeError);
      return res
        .status(500)
        .json({ error: "Failed to generate verification code" });
    }

    console.log(`Verification code generated for: ${normalizedEmail}`);

    // Send verification code via email
    const emailSent = await sendVerificationEmail(
      normalizedEmail,
      verificationCode
    );

    if (!emailSent) {
      console.error("Send-code: Failed to send email");
      return res.status(500).json({
        error: "Failed to send verification email. Please try again.",
      });
    }

    res.json({
      success: true,
      email: normalizedEmail,
      message: "Verification code sent to your email",
    });
  } catch (err) {
    console.error("Error in POST /api/auth/send-code:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/auth/verify - Verify email with code
router.post("/verify", async (req, res) => {
  try {
    const supabase = req.supabase;
    const { email, code } = req.body;

    // Validate input
    if (!email || !code) {
      console.error("Verify: Email or code not provided");
      return res.status(400).json({ error: "Email and code are required" });
    }

    const normalizedEmail = email.toLowerCase();

    // Find verification code
    const { data: verificationRecord, error: codeError } = await supabase
      .from("verification_codes")
      .select("*")
      .eq("email", normalizedEmail)
      .eq("code", code)
      .single();

    if (codeError || !verificationRecord) {
      console.error(`Verify: Invalid code for ${normalizedEmail}`);
      return res.status(400).json({ error: "Invalid verification code" });
    }

    // Check if code expired
    const expiryTime = new Date(verificationRecord.expires_at).getTime();
    const currentTime = Date.now();

    if (currentTime > expiryTime) {
      console.error(`Verify: Code expired for ${normalizedEmail}`);
      return res.status(400).json({ error: "Verification code expired" });
    }

    // Get user
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("id")
      .eq("email", normalizedEmail)
      .single();

    if (userError || !user) {
      console.error(`Verify: User not found - ${normalizedEmail}`);
      return res.status(404).json({ error: "User not found" });
    }

    // Mark user as verified
    const { error: verifyError } = await supabase
      .from("users")
      .update({ verified: true })
      .eq("id", user.id);

    if (verifyError) {
      console.error("Verify: Error updating user:", verifyError);
      return res.status(500).json({ error: "Failed to verify email" });
    }

    // Delete used verification code
    await supabase
      .from("verification_codes")
      .delete()
      .eq("email", normalizedEmail);

    console.log(`Email verified: ${normalizedEmail}, user_id: ${user.id}`);

    // Generate JWT token
    const token = generateToken(user.id, normalizedEmail);

    res.json({
      success: true,
      token: token,
      user_id: user.id,
      email: normalizedEmail,
      message: "Email verified successfully",
    });
  } catch (err) {
    console.error("Error in POST /api/auth/verify:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/auth/me - Test JWT authentication
router.get("/me", authenticateToken, (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
});

module.exports = router;
