// ════════════════════════════════════════════════════════════
//  Auth Routes
// ════════════════════════════════════════════════════════════
import { Router } from 'express';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import * as auth from '../controllers/auth.controller.js';
import { authenticate, requireAuth } from '../middleware/auth.js';
import { validate, schemas } from '../middleware/validate.js';
import { config } from '../config/index.js';
import { forgotPassword, resetPassword } from '../controllers/auth.controller.js';

const router = Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: config.rateLimit.authMax,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Please try again in 15 minutes.' },
});

const loginSchema = z.object({
  email: schemas.email,
  password: z.string().min(1).max(128),
  rememberMe: z.boolean().optional().default(true),
});

const otpSchema = z.object({
  challengeToken: z.string().min(10),
  code: z.string().trim().min(4).max(10),
  useTotp: z.boolean().optional(),
});

router.post('/login', loginLimiter, validate(loginSchema), auth.login);
router.post('/verify-otp', loginLimiter, validate(otpSchema), auth.verifyOtp);
router.post('/refresh', auth.refresh);
router.post('/logout', authenticate, auth.logout);
router.get('/me', authenticate, requireAuth, auth.me);
router.post('/2fa/setup', authenticate, requireAuth, auth.setupTotp);
router.post(
  '/2fa/enable',
  authenticate,
  requireAuth,
  validate(z.object({ code: z.string().trim().length(6) })),
  auth.enableTotp
);

// ── Google OAuth ─────────────────────────────────────────
router.get('/google/status', googleAuth.status);
router.get('/google', googleAuth.start);
router.get('/google/callback', googleAuth.callback);
// ── Password Reset ─────────────────────────────────────────
router.post('/forgot-password', auth.forgotPassword);
router.post('/reset-password', auth.resetPassword);
// Demo accounts (development only)
router.get('/demo-accounts', (req, res) => {
  res.json({
    accounts: [
      { label: 'Senior Team Leader', email: 'superadmin@skillnova.com', pwd: 'SuperAdmin#2026', color: '#7C3AED' },
      { label: 'Team Leader',        email: 'admin@skillnova.com',      pwd: 'Admin#2026',      color: '#ff6d34' },
      { label: 'Captain',            email: 'mentor@skillnova.com',     pwd: 'Mentor#2026',     color: '#7C3AED' },
      { label: 'Intern',             email: 'rahul@skillnova.com',      pwd: 'User#2026',       color: '#00bea3' },
    ],
  });
});

export default router;
