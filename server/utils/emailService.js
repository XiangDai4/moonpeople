// server/utils/emailService.js
const nodemailer = require('nodemailer');

// Create transporter based on environment
const createTransport = async () => {
  // Try Gmail first
  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    console.log('🔄 Attempting Gmail configuration...');
    const gmailTransporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Test Gmail connection
    try {
      await gmailTransporter.verify();
      console.log('✅ Gmail connection successful');
      return gmailTransporter;
    } catch (error) {
      console.log('❌ Gmail connection failed:', error.message);
      console.log('🔄 Falling back to Ethereal Email for testing...');
    }
  }

  // Fallback to Ethereal Email for testing
  console.log('🔄 Creating Ethereal test account...');
  const testAccount = await nodemailer.createTestAccount();
  
  const etherealTransporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    secure: false,
    auth: {
      user: testAccount.user,
      pass: testAccount.pass,
    },
  });

  console.log('✅ Ethereal Email configured for testing');
  console.log('📧 Test account:', testAccount.user);
  
  return etherealTransporter;
};

// Test email connection
const testEmailConnection = async () => {
  try {
    const transporter = await createTransport();
    console.log('✅ Email service is ready to send emails');
    return true;
  } catch (error) {
    console.error('❌ Email service error:', error);
    return false;
  }
};

// Send verification email with 6-digit code
const sendVerificationEmail = async (email, fullName, verificationCode) => {
  try {
    const transporter = await createTransport();
    
    const mailOptions = {
      from: `"${process.env.APP_NAME || 'Moon People'}" <${process.env.EMAIL_USER || 'noreply@moonpeople.com'}>`,
      to: email,
      subject: 'Verify Your Email Address',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <h2 style="color: #333; text-align: center;">Welcome to ${process.env.APP_NAME || 'Moon People'}!</h2>
          
          <p>Hi ${fullName},</p>
          
          <p>Thank you for registering with us. To complete your registration and secure your account, please enter the verification code below:</p>
          
          <div style="text-align: center; margin: 40px 0;">
            <div style="background-color: #f8f9fa; border: 2px solid #007bff; border-radius: 10px; padding: 30px; display: inline-block;">
              <h1 style="color: #007bff; font-size: 36px; margin: 0; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                ${verificationCode}
              </h1>
            </div>
          </div>
          
          <p style="text-align: center; font-size: 18px; color: #666;">
            Enter this code in the verification form to complete your registration.
          </p>
          
          <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 15px; margin: 20px 0;">
            <p style="margin: 0; color: #856404;">
              <strong>⏰ This code will expire in 24 hours.</strong>
            </p>
          </div>
          
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
          
          <p style="color: #666; font-size: 14px;">
            If you didn't create an account with us, please ignore this email.
          </p>
          
          <p style="color: #666; font-size: 14px;">
            Best regards,<br>
            The ${process.env.APP_NAME || 'Moon People'} Team
          </p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Verification email sent successfully!');
    console.log('📧 Message ID:', info.messageId);
    console.log('🔢 Verification Code:', verificationCode);
    
    // If using Ethereal, show preview URL
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log('🔗 Preview URL:', previewUrl);
      console.log('👆 Click the link above to see the email in your browser');
    }
    
    return { success: true, messageId: info.messageId, previewUrl };
    
  } catch (error) {
    console.error('❌ Error sending verification email:', error);
    
    // More detailed error logging
    if (error.code === 'EAUTH') {
      console.error('🔐 Authentication failed. Email credentials are incorrect.');
      console.error('💡 Suggestion: Generate a new Gmail App Password or check your .env file');
    }
    
    return { success: false, error: error.message };
  }
};

// Send password reset email (for future use)
const sendPasswordResetEmail = async (email, token, fullName) => {
  try {
    const transporter = await createTransport();
    
    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${token}`;
    
    const mailOptions = {
      from: `"${process.env.APP_NAME || 'Moon People'}" <${process.env.EMAIL_USER || 'noreply@moonpeople.com'}>`,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <div style="max-width: 600px; margin: 0 auto; padding: 20px; font-family: Arial, sans-serif;">
          <h2 style="color: #333; text-align: center;">Password Reset Request</h2>
          
          <p>Hi ${fullName},</p>
          
          <p>You requested to reset your password. Click the button below to set a new password:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" 
               style="background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
              Reset Password
            </a>
          </div>
          
          <p>This link will expire in 1 hour.</p>
          
          <p style="color: #666; font-size: 14px;">
            If you didn't request this, please ignore this email.
          </p>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('✅ Password reset email sent successfully:', info.messageId);
    
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log('🔗 Preview URL:', previewUrl);
    }
    
    return { success: true, messageId: info.messageId, previewUrl };
    
  } catch (error) {
    console.error('❌ Error sending password reset email:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendVerificationEmail,
  sendPasswordResetEmail,
  testEmailConnection
};