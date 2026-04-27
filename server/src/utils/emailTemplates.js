/**
 * Reusable email styles and templates to match the application's premium dark theme.
 */

const baseStyles = `
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    background-color: #171615;
    color: #ffffff;
    margin: 0;
    padding: 40px 20px;
    line-height: 1.6;
`;

const cardStyles = `
    max-width: 500px;
    margin: 0 auto;
    background-color: #1e1e1e;
    border: 1px solid #333333;
    border-radius: 16px;
    padding: 40px;
    text-align: center;
`;

const titleStyles = `
    font-size: 24px;
    font-weight: 700;
    margin-bottom: 16px;
    color: #ffffff;
`;

const textStyles = `
    font-size: 16px;
    color: #a0a0a0;
    margin-bottom: 32px;
`;

const buttonStyles = `
    display: inline-block;
    background-color: #32575c;
    color: #ffffff;
    text-decoration: none;
    padding: 14px 32px;
    border-radius: 8px;
    font-weight: 600;
    font-size: 16px;
    transition: background-color 0.2s ease;
`;

const footerStyles = `
    margin-top: 32px;
    font-size: 13px;
    color: #666666;
    border-top: 1px solid #333333;
    padding-top: 24px;
`;

/**
 * Verification Email Template
 */
export const getVerificationEmailTemplate = (username, link) => `
    <div style="${baseStyles}">
        <div style="${cardStyles}">
            <h1 style="${titleStyles}">Verify your account</h1>
            <p style="${textStyles}">Hi ${username}, welcome to Perplexity. Please verify your email address to get started with your premium AI experience.</p>
            <a href="${link}" style="${buttonStyles}">Verify Email Address</a>
            <p style="${footerStyles}">If you didn't create an account, you can safely ignore this email.</p>
        </div>
    </div>
`;

/**
 * Password Reset Email Template
 */
export const getForgotPasswordEmailTemplate = (username, link) => `
    <div style="${baseStyles}">
        <div style="${cardStyles}">
            <h1 style="${titleStyles}">Reset your password</h1>
            <p style="${textStyles}">Hi ${username}, we received a request to reset your password. Click the button below to secure your account.</p>
            <a href="${link}" style="${buttonStyles}">Reset Password</a>
            <div style="margin-top: 24px; padding: 12px; background: #252421; border-radius: 8px; font-size: 12px; word-break: break-all;">
                <p style="color: #666; margin-bottom: 4px;">Link not working? Copy this:</p>
                <a href="${link}" style="color: #32575c;">${link}</a>
            </div>
            <p style="${footerStyles}">If you didn't request a password reset, please ignore this email.</p>
        </div>
    </div>
`;

/**
 * HTML Response for Verification Page in Browser
 */
export const getVerificationSuccessPage = (username, loginLink) => `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Email Verified | Perplexity</title>
        <style>
            body { 
                background-color: #171615; 
                display: flex; 
                justify-content: center; 
                align-items: center; 
                height: 100vh; 
                margin: 0;
                font-family: 'Inter', system-ui, sans-serif;
            }
            .card {
                background-color: #1e1e1e;
                border: 1px solid #333333;
                border-radius: 20px;
                padding: 48px;
                text-align: center;
                max-width: 400px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.4);
            }
            h1 { color: #ffffff; margin-bottom: 16px; font-size: 28px; }
            p { color: #a0a0a0; margin-bottom: 32px; line-height: 1.6; }
            .btn {
                background-color: #32575c;
                color: #ffffff;
                text-decoration: none;
                padding: 16px 40px;
                border-radius: 10px;
                font-weight: 600;
                display: inline-block;
                transition: transform 0.2s;
            }
            .btn:hover { transform: scale(1.02); }
            .icon { font-size: 48px; margin-bottom: 24px; color: #32575c; }
        </style>
    </head>
    <body>
        <div class="card">
            <div class="icon">✓</div>
            <h1>Verification Success</h1>
            <p>Hi ${username}, your email has been successfully verified. You can now access all features of Perplexity.</p>
            <a href="${loginLink}" class="btn">Log in</a>
        </div>
    </body>
    </html>
`;

export const getAlreadyVerifiedPage = (username, loginLink) => `
    <!DOCTYPE html>
    <html>
    <head>
        <title>Verified | Perplexity</title>
        <style>
            body { 
                background-color: #171615; 
                display: flex; 
                justify-content: center; 
                align-items: center; 
                height: 100vh; 
                margin: 0;
                font-family: 'Inter', system-ui, sans-serif;
            }
            .card {
                background-color: #1e1e1e;
                border: 1px solid #333333;
                border-radius: 20px;
                padding: 48px;
                text-align: center;
                max-width: 400px;
            }
            h1 { color: #ffffff; margin-bottom: 16px; font-size: 28px; }
            p { color: #a0a0a0; margin-bottom: 32px; line-height: 1.6; }
            .btn {
                background-color: #32575c;
                color: #ffffff;
                text-decoration: none;
                padding: 16px 40px;
                border-radius: 10px;
                font-weight: 600;
                display: inline-block;
            }
        </style>
    </head>
    <body>
        <div class="card">
            <h1>Already Verified</h1>
            <p>Hi ${username}, your email is already verified. You're all set to go!</p>
            <a href="${loginLink}" class="btn">Return to Login</a>
        </div>
    </body>
    </html>
`;
