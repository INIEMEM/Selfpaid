const _otpBlock = (otp) => `
  <div style="text-align:center;margin:28px 0;">
    <div style="display:inline-block;background:#0f1a0f;border:2px solid #7ed348;border-radius:14px;padding:24px 40px;">
      <span style="font-family:'Courier New',monospace;font-size:48px;font-weight:700;letter-spacing:14px;color:#7ed348;">${otp}</span>
    </div>
  </div>
`;

const otpEmailTemplate = (firstName, otp) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>Verify your SelfPaid account</title>
    </head>
    <body style="margin:0;padding:0;background:#0a0a0a;font-family:Arial,sans-serif;">
      <div style="max-width:580px;margin:40px auto;background:#111111;border-radius:16px;overflow:hidden;border:1px solid rgba(126,211,72,0.15);">
        <!-- Header -->
        <div style="background:linear-gradient(135deg,#1a2e1a,#0f1a0f);padding:36px 32px;text-align:center;border-bottom:1px solid rgba(126,211,72,0.15);">
          <div style="font-size:28px;font-weight:900;letter-spacing:4px;color:#7ed348;margin-bottom:4px;">SELFPAID</div>
          <div style="font-size:13px;color:rgba(126,211,72,0.6);letter-spacing:2px;text-transform:uppercase;">Get Paid for What You Do</div>
        </div>
        <!-- Body -->
        <div style="padding:36px 32px;color:#ffffff;">
          <p style="font-size:16px;margin:0 0 8px;">Hi <strong style="color:#7ed348;">${firstName}</strong>,</p>
          <h2 style="font-size:22px;margin:0 0 16px;color:#ffffff;">Verify your SelfPaid account</h2>
          <p style="font-size:15px;color:rgba(255,255,255,0.65);line-height:1.7;margin:0 0 8px;">Enter this code in the app to verify your email address and start earning:</p>
          ${_otpBlock(otp)}
          <p style="font-size:13px;color:rgba(255,255,255,0.45);text-align:center;margin:0 0 24px;">This code expires in <strong style="color:#ff9f43;">15 minutes</strong>. Do not share it with anyone.</p>
          <hr style="border:none;border-top:1px solid rgba(255,255,255,0.07);margin:24px 0;" />
          <p style="font-size:13px;color:rgba(255,255,255,0.3);margin:0;">If you didn't create a SelfPaid account, you can safely ignore this email.</p>
        </div>
        <!-- Footer -->
        <div style="padding:20px 32px;background:#0a0a0a;text-align:center;border-top:1px solid rgba(255,255,255,0.05);">
          <p style="font-size:12px;color:rgba(255,255,255,0.2);margin:0;">&copy; ${new Date().getFullYear()} SelfPaid. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const resendOTPTemplate = (firstName, otp) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>Your new verification code</title>
    </head>
    <body style="margin:0;padding:0;background:#0a0a0a;font-family:Arial,sans-serif;">
      <div style="max-width:580px;margin:40px auto;background:#111111;border-radius:16px;overflow:hidden;border:1px solid rgba(126,211,72,0.15);">
        <!-- Header -->
        <div style="background:linear-gradient(135deg,#1a2e1a,#0f1a0f);padding:36px 32px;text-align:center;border-bottom:1px solid rgba(126,211,72,0.15);">
          <div style="font-size:28px;font-weight:900;letter-spacing:4px;color:#7ed348;margin-bottom:4px;">SELFPAID</div>
          <div style="font-size:13px;color:rgba(126,211,72,0.6);letter-spacing:2px;text-transform:uppercase;">Get Paid for What You Do</div>
        </div>
        <!-- Body -->
        <div style="padding:36px 32px;color:#ffffff;">
          <p style="font-size:16px;margin:0 0 8px;">Hi <strong style="color:#7ed348;">${firstName}</strong>,</p>
          <h2 style="font-size:22px;margin:0 0 16px;color:#ffffff;">Your new verification code</h2>
          <p style="font-size:15px;color:rgba(255,255,255,0.65);line-height:1.7;margin:0 0 8px;">Here is your new one-time code. Enter it in the app to verify your email:</p>
          ${_otpBlock(otp)}
          <p style="font-size:13px;color:rgba(255,255,255,0.45);text-align:center;margin:0 0 24px;">This code expires in <strong style="color:#ff9f43;">15 minutes</strong>. Do not share it with anyone.</p>
          <hr style="border:none;border-top:1px solid rgba(255,255,255,0.07);margin:24px 0;" />
          <p style="font-size:13px;color:rgba(255,255,255,0.3);margin:0;">If you didn't create a SelfPaid account, you can safely ignore this email.</p>
        </div>
        <!-- Footer -->
        <div style="padding:20px 32px;background:#0a0a0a;text-align:center;border-top:1px solid rgba(255,255,255,0.05);">
          <p style="font-size:12px;color:rgba(255,255,255,0.2);margin:0;">&copy; ${new Date().getFullYear()} SelfPaid. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

const passwordResetEmailTemplate = (firstName, resetUrl) => {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
      <title>Reset your password</title>
      <style>
        body { margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 40px auto; background: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
        .header { background-color: #dc2626; padding: 32px; text-align: center; }
        .header h1 { color: #ffffff; margin: 0; font-size: 24px; }
        .body { padding: 32px; color: #333333; }
        .body p { font-size: 16px; line-height: 1.6; }
        .btn { display: inline-block; margin: 24px 0; padding: 14px 28px; background-color: #dc2626; color: #ffffff; text-decoration: none; border-radius: 6px; font-size: 16px; font-weight: bold; }
        .warning { background-color: #fff7ed; border-left: 4px solid #f97316; padding: 12px 16px; border-radius: 4px; font-size: 14px; color: #7c2d12; }
        .footer { padding: 24px 32px; background-color: #f9f9f9; text-align: center; font-size: 13px; color: #999999; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Reset your password</h1>
        </div>
        <div class="body">
          <p>Hi <strong>${firstName}</strong>,</p>
          <p>We received a request to reset the password for your Global Task Platform account.</p>
          <p>Click the button below to reset your password:</p>
          <a href="${resetUrl}" class="btn">Reset Password</a>
          <p>This link is valid for <strong>1 hour</strong>. After that, you'll need to request a new reset link.</p>
          <div class="warning">
            <strong>Didn't request this?</strong> If you didn't request a password reset, you can safely ignore this email. Your password will remain unchanged.
          </div>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} Global Task Platform. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = { otpEmailTemplate, resendOTPTemplate, passwordResetEmailTemplate };
