const express = require('express');
const router = express.Router();

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
router.post('/signup', async (req, res) => {
  try {
    const supabase = req.supabase;
    const { email } = req.body;

    // Validate input
    if (!email) {
      console.error('Signup: Email not provided');
      return res.status(400).json({ error: 'Email is required' });
    }

    if (!isValidEmail(email)) {
      console.error(`Signup: Invalid email format - ${email}`);
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const normalizedEmail = email.toLowerCase();

    // Check if user already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('id')
      .eq('email', normalizedEmail)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('Signup: Error checking existing user:', checkError);
      return res.status(500).json({ error: 'Database error' });
    }

    if (existingUser) {
      console.error(`Signup: Email already exists - ${normalizedEmail}`);
      return res.status(409).json({ error: 'Email already registered' });
    }

    // Generate verification code
    const verificationCode = generateVerificationCode();

    // Create new user
    const { data: newUser, error: createUserError } = await supabase
      .from('users')
      .insert([
        {
          email: normalizedEmail,
          verified: false
        }
      ])
      .select()
      .single();

    if (createUserError) {
      console.error('Signup: Error creating user:', createUserError);
      return res.status(500).json({ error: 'Failed to create user' });
    }

    // Store verification code
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 minutes
    const { error: codeError } = await supabase
      .from('verification_codes')
      .insert([
        {
          email: normalizedEmail,
          code: verificationCode,
          expires_at: expiresAt
        }
      ]);

    if (codeError) {
      console.error('Signup: Error storing verification code:', codeError);
      return res.status(500).json({ error: 'Failed to generate verification code' });
    }

    console.log(`User signed up: ${normalizedEmail}, user_id: ${newUser.id}`);

    res.status(201).json({
      success: true,
      user_id: newUser.id,
      email: normalizedEmail,
      code: verificationCode,
      message: 'User created. Use this code to verify: ' + verificationCode
    });

  } catch (err) {
    console.error('Error in POST /api/auth/signup:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// POST /api/auth/verify - Verify email with code
router.post('/verify', async (req, res) => {
  try {
    const supabase = req.supabase;
    const { email, code } = req.body;

    // Validate input
    if (!email || !code) {
      console.error('Verify: Email or code not provided');
      return res.status(400).json({ error: 'Email and code are required' });
    }

    const normalizedEmail = email.toLowerCase();

    // Find verification code
    const { data: verificationRecord, error: codeError } = await supabase
      .from('verification_codes')
      .select('*')
      .eq('email', normalizedEmail)
      .eq('code', code)
      .single();

    if (codeError || !verificationRecord) {
      console.error(`Verify: Invalid code for ${normalizedEmail}`);
      return res.status(400).json({ error: 'Invalid verification code' });
    }

    // Check if code expired
    const expiryTime = new Date(verificationRecord.expires_at).getTime();
    const currentTime = Date.now();

    if (currentTime > expiryTime) {
      console.error(`Verify: Code expired for ${normalizedEmail}`);
      return res.status(400).json({ error: 'Verification code expired' });
    }

    // Get user
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', normalizedEmail)
      .single();

    if (userError || !user) {
      console.error(`Verify: User not found - ${normalizedEmail}`);
      return res.status(404).json({ error: 'User not found' });
    }

    // Mark user as verified
    const { error: verifyError } = await supabase
      .from('users')
      .update({ verified: true })
      .eq('id', user.id);

    if (verifyError) {
      console.error('Verify: Error updating user:', verifyError);
      return res.status(500).json({ error: 'Failed to verify email' });
    }

    // Delete used verification code
    await supabase
      .from('verification_codes')
      .delete()
      .eq('email', normalizedEmail);

    console.log(`Email verified: ${normalizedEmail}, user_id: ${user.id}`);

    res.json({
      success: true,
      user_id: user.id,
      email: normalizedEmail,
      message: 'Email verified successfully'
    });

  } catch (err) {
    console.error('Error in POST /api/auth/verify:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
