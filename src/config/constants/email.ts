import { ENV } from '../../config/env/env';

export const GOOGLE_REGISTRATION_MAIL_CONTENT = (
  fullName: string,
  tempPassword: string,
) => `
<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333; background: #fff;">
  <!-- Logo Section -->
  <div style="text-align: center; margin-bottom: 30px;">
    <h1 style="font-size: 42px; font-weight: bold; margin: 0;">
      🛠️ <span style="color: #2563eb;">bookMyService</span>
    </h1>
  </div>

  <!-- Welcome Section -->
  <div style="text-align: center; margin-bottom: 30px;">
    <h2 style="color: #2563eb; font-size: 26px; margin: 0;">
      Welcome to bookMyService, ${fullName}! 🎉
    </h2>
    <p style="color: #666; font-size: 16px; margin: 10px 0 0 0;">
      Your Google registration is complete. Here's everything you need to get started!
    </p>
  </div>

  <!-- Account Info -->
  <div style="border-radius: 15px; padding: 25px; margin-bottom: 25px; background: linear-gradient(to bottom, #fff, #f8fafc);">
    <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px; text-align: center;">
      We've generated a temporary password for you. Please use this password to log in and change it ASAP! 🔐
    </p>

    <!-- Temporary Password -->
    <div style="text-align: center; padding: 15px; border-radius: 8px; background-color: #2563eb; color: white; font-size: 18px; font-weight: bold; display: inline-block; margin: 10px 0;">
      ${tempPassword}
    </div>

    <p style="color: #666; font-size: 14px; text-align: center; margin-top: 10px;">
      ✨ Make sure to update your password as soon as possible to keep your account secure!
    </p>
  </div>

  <!-- Change Password Button -->
  <div style="text-align: center; margin-bottom: 30px;">
    <a href="${process.env.FRONTEND_URL || 'https://bookmyservice.in'}"
       style="background-color: #2563eb; color: white; padding: 14px 32px;
              text-decoration: none; border-radius: 8px; font-weight: 500;
              display: inline-block; margin: 10px 0; font-size: 16px;
              box-shadow: 0 2px 4px rgba(37, 99, 235, 0.2);
              transition: all 0.3s ease; cursor: pointer;"
       onmouseover="this.style.backgroundColor='#1e40af'"
       onmouseout="this.style.backgroundColor='#2563eb'"
       rel="noopener noreferrer">
      Log in & Change Password 🔑
    </a>
  </div>

  <!-- Security Tips -->
  <div style="border-radius: 8px; padding: 20px; margin: 25px 0; background-color: #eff6ff; box-shadow: 0 2px 8px rgba(37, 99, 235, 0.15);">
    <div style="text-align: left; margin-bottom: 15px; display: flex; align-items: center;">
      <span style="font-size: 22px; margin-right: 10px;">⚠️</span>
      <h3 style="color: #1e3a8a; margin: 0; font-size: 18px;">Security Reminders</h3>
    </div>
    <ul style="list-style: none; padding: 0; margin: 0;">
      <li style="font-size: 14px; color: #1e3a8a; margin: 8px 0; display: flex; align-items: center;">
        <span style="color: #2563eb; margin-right: 8px;">•</span> Change your password immediately after logging in
      </li>
      <li style="font-size: 14px; color: #1e3a8a; margin: 8px 0; display: flex; align-items: center;">
        <span style="color: #2563eb; margin-right: 8px;">•</span> Never share your password with anyone
      </li>
      <li style="font-size: 14px; color: #1e3a8a; margin: 8px 0; display: flex; align-items: center;">
        <span style="color: #2563eb; margin-right: 8px;">•</span> Always ensure you're on the official bookMyService website before entering credentials
      </li>
    </ul>
  </div>

  <!-- Footer -->
  <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
    <p style="font-size: 14px; color: #888;">
      Need help? We're here for you! 💡<br>
      Contact us at <a href="mailto:support@bookmyservice.in" style="color: #2563eb; text-decoration: none;">support@bookmyservice.in</a>
    </p>
  </div>

  <div style="text-align: center; margin-top: 10px; font-size: 12px; color: #888;">
    © ${new Date().getFullYear()} bookMyService. All rights reserved.<br>
    <span style="color: #2563eb;">✦</span> Your Service, Our Priority <span style="color: #2563eb;">✦</span>
  </div>
</div>
`;

export const VERIFICATION_MAIL_CONTENT = (otp: string) => `
<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
   <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="font-size: 48px; font-weight: bold; margin: 0;">
         🛠️ <span style="color: #FEBA43;">bookMyService</span>
      </h1>
   </div>

   <h2 style="color: #FEBA43; text-align: center; margin-bottom: 30px;">
      Welcome to bookMyService! 🚀
   </h2>
   
   <p style="font-size: 16px; line-height: 1.5; margin-bottom: 20px;">
      Your service experience just got better! Book trusted professionals and get things done quickly. ✨
   </p>
   
   <div style="background-color: #f9f9f9; border-radius: 8px; padding: 20px; margin: 25px 0; text-align: center;">
      <p style="margin-bottom: 10px; font-size: 16px;">Your verification code is:</p>
      <h1 style="background-color: #f2f2f2; color: #FEBA43; font-size: 36px; margin: 10px 0; padding: 20px; border-radius: 8px; letter-spacing: 5px;">
         ${otp.trim()}
      </h1>
      <p style="color: #666; font-size: 14px;">
         ⏰ Code expires in 2 minutes
      </p>
   </div>
   
   <p style="font-size: 14px; color: #666; margin-top: 20px;">
      🔒 For your security, never share this code with anyone.
   </p>
   
   <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; text-align: center;">
      <p style="font-size: 14px; color: #888;">
         Need help? Contact us at 
         <a href="mailto:support@bookmyservice.com" style="color: #FEBA43; text-decoration: none;">support@bookmyservice.com</a>
      </p>
   </div>

   <div style="text-align: center; margin-top: 20px; font-size: 12px; color: #888;">
      © ${new Date().getFullYear()} bookMyService. All rights reserved.
   </div>
</div>
`;

export const PASSWORD_RESET_MAIL_CONTENT = (resetLink: string) => `
<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
   <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="font-size: 48px; font-weight: bold; margin: 0;">
         🛠️ <span style="color: #FEBA43;">bookMyService</span>
      </h1>
   </div>

   <h2 style="color: #FEBA43; font-size: 28px; text-align: center;">Password Reset Request 🔐</h2>
   <p style="text-align: center; color: #666;">Don't worry, we'll help you get back on track! ✨</p>
   
   <div style="border-radius: 15px; padding: 25px; background: #fcfcfc; margin-top: 20px;">
      <p style="text-align: center;">We received a request to reset your password.</p>
      <div style="text-align: center; margin: 20px 0;">
        <a href="${resetLink}" style="background-color: #FEBA43; color: white; padding: 16px 40px; border-radius: 8px; text-decoration: none; display: inline-block;">
          Reset Password
        </a>
      </div>
      <p style="text-align: center; font-size: 14px; color: #666;">⏰ This link expires in 10 minutes</p>
   </div>
</div>
`;
export const SERVICE_REJECTED_MAIL_CONTENT = (
  userName: string,
  serviceName: string,
  reason?: string,
  refundAmount?: number,
) => {
  const reasonHtml = reason ? `<p><strong>Reason:</strong> ${reason}</p>` : '';
  const refundHtml = typeof refundAmount === 'number'
    ? `<p><strong>Refund processed:</strong> ₹${refundAmount.toFixed(2)}</p>`
    : '';

  return `
    <div style="font-family: Arial, sans-serif; line-height:1.5; color:#333;">
      <h2 style="color:#d9534f;">Service Request Rejected</h2>
      <p>Hello ${escapeHtml(userName)},</p>

      <p>
        We’re sorry to inform you that your service request
        <strong>${escapeHtml(serviceName)}</strong> has been rejected.
      </p>

      ${reasonHtml}

      ${refundHtml}

      <p>
        If you believe this is a mistake or want help rebooking, please contact our support team.
      </p>

      <hr/>
      <p style="font-size:0.9em; color:#666;">
        Regards,<br/>
        <strong>bookMyService</strong>
      </p>
    </div>
  `;
};

function escapeHtml(str: string) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
export const SENT_REJECTION_EMAIL = (entityLabel: string, reason: string, retryUrl?: string) => `
<div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
   <h1 style="text-align: center; color: #FEBA43;">${entityLabel} Application Status</h1>
   <p style="text-align: center; color: #dc3545;">Unfortunately, your application was rejected.</p>
   <p style="text-align: center; color: #555;">Reason: ${reason}</p>
   ${
  retryUrl
    ? `<div style="text-align: center; margin-top: 20px;">
            <a href="${retryUrl}" style="background-color: #007bff; color: white; padding: 12px 25px; text-decoration: none; border-radius: 8px;">
              Retry Application
            </a>
          </div>`
    : ''
}
</div>
`;
