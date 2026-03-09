const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');
const { getPool, sql } = require('../db');

/**
 * POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required.' });
    }

    const pool   = await getPool();
    const result = await pool.request()
      .input('username', sql.NVarChar, username)
      .query('SELECT * FROM Users WHERE username = @username');

    if (result.recordset.length === 0) {
      return res.status(401).json({ success: false, message: 'Invalid username or password.' });
    }

    const user    = result.recordset[0];
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid username or password.' });
    }

    const token = jwt.sign(
      { user_id: user.user_id, username: user.username, full_name: user.full_name, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    res.json({
      success: true,
      message: 'Login successful.',
      token,
      user: { user_id: user.user_id, username: user.username, full_name: user.full_name, role: user.role }
    });
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

/**
 * POST /api/auth/register
 */
const register = async (req, res) => {
  try {
    const { username, password, full_name } = req.body;
    if (!username || !password || !full_name) {
      return res.status(400).json({ success: false, message: 'Username, password, and full name are required.' });
    }

    const pool = await getPool();

    // Check if username already exists
    const existingUser = await pool.request()
      .input('username', sql.NVarChar, username)
      .query('SELECT user_id FROM Users WHERE username = @username');

    if (existingUser.recordset.length > 0) {
      return res.status(409).json({ success: false, message: 'Username already exists.' });
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert new user
    const result = await pool.request()
      .input('username', sql.NVarChar, username)
      .input('password_hash', sql.NVarChar, hashedPassword)
      .input('full_name', sql.NVarChar, full_name)
      .input('role', sql.NVarChar, 'Client')
      .query('INSERT INTO Users (username, password_hash, full_name, role) OUTPUT INSERTED.user_id, INSERTED.username, INSERTED.full_name, INSERTED.role VALUES (@username, @password_hash, @full_name, @role)');

    const newUser = result.recordset[0];

    // Generate token
    const token = jwt.sign(
      { user_id: newUser.user_id, username: newUser.username, full_name: newUser.full_name, role: newUser.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
    );

    res.status(201).json({
      success: true,
      message: 'Registration successful.',
      token,
      user: { user_id: newUser.user_id, username: newUser.username, full_name: newUser.full_name, role: newUser.role }
    });
  } catch (err) {
    console.error('Registration error:', err.message);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { login, register };
