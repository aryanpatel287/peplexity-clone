import crypto from 'crypto';
import redis from '../config/cache.js';
import { sendEmail } from '../services/mail/mail.service.js';

const OTP_CHARS =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

const OTP_DEFAULT_POLICY = Object.freeze({
    ttlSeconds: 600,
    maxAttempts: 3,
    maxResends: 3,
    cooldownSeconds: 120,
});

const OTP_PURPOSES = Object.freeze({
    VERIFY_EMAIL: 'verify-email',
    FORGOT_PASSWORD: 'forgot-password',
    SIGN_UP: 'sign-up',
});

function resolvePolicy(policy) {
    return { ...OTP_DEFAULT_POLICY, ...(policy || {}) };
}

function buildRedisKey({ purpose, email }) {
    return `${purpose}:${email}`;
}

function getRemainingValiditySeconds({ createdAt, ttlSeconds }) {
    if (!createdAt || !ttlSeconds) {
        return 0;
    }

    const remainingMs = ttlSeconds * 1000 - (Date.now() - createdAt);
    return Math.floor(remainingMs / 1000);
}

function hashOtpValue(otp) {
    return crypto.createHash('sha256').update(otp).digest('hex');
}

export function generateOtp() {
    let otp = '';

    for (let index = 0; index < 6; index += 1) {
        otp += OTP_CHARS[Math.floor(Math.random() * OTP_CHARS.length)];
    }

    return otp;
}

export function normalizeEmail(email) {
    return typeof email === 'string' ? email.trim().toLowerCase() : '';
}

export function normalizeOtp(otp) {
    return typeof otp === 'string' ? otp.trim() : '';
}

export function hashOtp(otp) {
    return hashOtpValue(normalizeOtp(otp));
}

export async function issueOtp({
    email,
    purpose,
    subject,
    buildHtml,
    text,
    sendEmailFn = sendEmail,
    policy,
}) {
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail || !purpose) {
        return { ok: false, reason: 'invalid-input' };
    }

    const resolvedPolicy = resolvePolicy(policy);
    const otp = generateOtp();
    const otpHash = hashOtpValue(otp);

    if (subject && buildHtml && sendEmailFn) {
        const html = buildHtml(otp);
        await sendEmailFn({
            to: normalizedEmail,
            subject,
            html,
            text,
        });
    }

    const now = Date.now();
    const session = {
        otp,
        otpHash,
        attempts: 0,
        resendCount: 0,
        cooldownExpiresAt: now + resolvedPolicy.cooldownSeconds * 1000,
        createdAt: now,
    };

    await redis.set(
        buildRedisKey({ purpose, email: normalizedEmail }),
        JSON.stringify(session),
        'EX',
        resolvedPolicy.ttlSeconds,
    );

    return {
        ok: true,
        otp,
        expiresIn: resolvedPolicy.ttlSeconds,
    };
}

export async function verifyOtp({ email, purpose, otp, policy }) {
    const normalizedEmail = normalizeEmail(email);
    const normalizedOtp = normalizeOtp(otp);

    if (!normalizedEmail || !normalizedOtp || !purpose) {
        return { ok: false, reason: 'invalid-input' };
    }

    const key = buildRedisKey({ purpose, email: normalizedEmail });
    const storedData = await redis.get(key);
    console.log('Verifying OTP for key:', key, 'Stored data:', storedData);
    if (!storedData) {
        console.log('here');
        return { ok: false, reason: 'missing' };
    }

    const resolvedPolicy = resolvePolicy(policy);
    const session = JSON.parse(storedData);
    const attempts = Number(session.attempts) || 0;
    const cooldownExpiresAt = Number(session.cooldownExpiresAt) || 0;
    const createdAt = Number(session.createdAt) || 0;

    if (attempts >= resolvedPolicy.maxAttempts) {
        await redis.del(key);
        return { ok: false, reason: 'locked' };
    }

    const incomingHash = hashOtpValue(normalizedOtp);
    if (incomingHash !== session.otpHash) {
        session.attempts = attempts + 1;

        const remainingValidity = getRemainingValiditySeconds({
            createdAt,
            ttlSeconds: resolvedPolicy.ttlSeconds,
        });

        if (remainingValidity <= 0) {
            await redis.del(key);
            return { ok: false, reason: 'expired' };
        }

        await redis.set(key, JSON.stringify(session), 'EX', remainingValidity);

        const cooldownRemaining = cooldownExpiresAt - Date.now();

        return {
            ok: false,
            reason: 'invalid',
            attemptsLeft: Math.max(
                resolvedPolicy.maxAttempts - session.attempts,
                0,
            ),
            cooldownRemaining:
                cooldownRemaining > 0 ? Math.ceil(cooldownRemaining / 1000) : 0,
        };
    }

    await redis.del(key);

    return { ok: true };
}

export async function resendOtp({
    email,
    purpose,
    subject,
    buildHtml,
    text,
    sendEmailFn = sendEmail,
    policy,
}) {
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail || !purpose) {
        return { ok: false, reason: 'invalid-input' };
    }

    const key = buildRedisKey({ purpose, email: normalizedEmail });
    const storedData = await redis.get(key);

    if (!storedData) {
        return { ok: false, reason: 'missing' };
    }

    const resolvedPolicy = resolvePolicy(policy);
    const session = JSON.parse(storedData);
    const resendCount = Number(session.resendCount) || 0;
    const cooldownExpiresAt = Number(session.cooldownExpiresAt) || 0;
    const createdAt = Number(session.createdAt) || 0;

    if (Date.now() < cooldownExpiresAt) {
        const remainingSeconds = Math.ceil(
            (cooldownExpiresAt - Date.now()) / 1000,
        );

        return {
            ok: false,
            reason: 'cooldown',
            cooldownRemaining: remainingSeconds,
        };
    }

    if (resendCount >= resolvedPolicy.maxResends) {
        return { ok: false, reason: 'resend-limit' };
    }

    let otp = typeof session.otp === 'string' ? session.otp : '';

    if (!otp) {
        otp = generateOtp();
        session.otp = otp;
        session.otpHash = hashOtpValue(otp);
    }

    if (subject && buildHtml && sendEmailFn) {
        const html = buildHtml(otp);
        await sendEmailFn({
            to: normalizedEmail,
            subject,
            html,
            text,
        });
    }

    session.resendCount = resendCount + 1;
    session.cooldownExpiresAt =
        Date.now() + resolvedPolicy.cooldownSeconds * 1000;

    const remainingValidity = getRemainingValiditySeconds({
        createdAt,
        ttlSeconds: resolvedPolicy.ttlSeconds,
    });

    if (remainingValidity <= 0) {
        await redis.del(key);
        return { ok: false, reason: 'expired' };
    }

    await redis.set(key, JSON.stringify(session), 'EX', remainingValidity);

    return {
        ok: true,
        otp,
        expiresIn: remainingValidity,
    };
}

export async function deleteOtp({ email, purpose }) {
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail || !purpose) {
        return { ok: false, reason: 'invalid-input' };
    }

    const key = buildRedisKey({ purpose, email: normalizedEmail });
    await redis.del(key);

    return { ok: true };
}

export { OTP_DEFAULT_POLICY, OTP_PURPOSES };
