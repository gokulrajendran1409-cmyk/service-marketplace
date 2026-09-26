const pool = require('../config/database');

// Simulated Verification Service (Mocking Twilio Verify API structure)
// Architecture corrected: Twilio Verify handles OTP generation, storage, and hashing internally.
// We only store the last sent time and channel in our DB.
class VerificationService {
    
    static async checkCooldown(userId, type) {
        const field = type === 'phone' ? 'phone_otp_last_sent_at' : 'email_otp_last_sent_at';
        const { rows } = await pool.query(`SELECT ${field} as last_sent FROM users WHERE id = $1`, [userId]);
        const lastSent = rows[0]?.last_sent;
        
        if (lastSent) {
            const timeSinceLastSent = Date.now() - new Date(lastSent).getTime();
            if (timeSinceLastSent < 60000) { // 60 seconds cooldown
                throw new Error('RESEND_TOO_SOON');
            }
        }
    }
    
    static async sendPhoneOtp(userId, phone) {
        const normalizedPhone = phone.replace(/\s+/g, '');
        
        try {
            await this.checkCooldown(userId, 'phone');
        } catch (e) {
            if (e.message === 'RESEND_TOO_SOON') {
                return { success: false, code: 'RESEND_TOO_SOON', message: 'Please wait before requesting another code.' };
            }
            throw e;
        }

        let channel = 'whatsapp';
        
        // This is where real Twilio Verify API would be called.
        // e.g. client.verify.v2.services(SID).verifications.create({ to: normalizedPhone, channel: 'whatsapp' })
        
        // MOCK BEHAVIOR: Simulate WhatsApp failure for numbers ending in '0'
        const whatsappFailed = normalizedPhone.endsWith('0');
        
        if (whatsappFailed) {
            // MOCK BEHAVIOR: Fallback to SMS
            // e.g. client.verify.v2.services(SID).verifications.create({ to: normalizedPhone, channel: 'sms' })
            channel = 'sms';
        }

        // We do NOT generate or hash OTPs locally for Twilio Verify.
        // We just track metadata.
        await pool.query(`
            UPDATE users 
            SET phone_otp_last_sent_at = NOW(),
                phone_otp_channel = $1
            WHERE id = $2
        `, [channel, userId]);
        
        console.log(`[MOCK TWILIO VERIFY] Sent OTP to ${normalizedPhone} via ${channel.toUpperCase()}`);
        
        return { success: true, channel, expiresIn: 600, resendAfter: 60 };
    }
    
    static async verifyPhoneOtp(userId, inputOtp) {
        // Find phone number to verify against Twilio
        const { rows } = await pool.query('SELECT phone FROM users WHERE id = $1', [userId]);
        const user = rows[0];
        
        if (!user || !user.phone) {
            return { success: false, code: 'INVALID_REQUEST', message: 'No phone number found' };
        }

        const normalizedPhone = user.phone.replace(/\s+/g, '');
        
        // MOCK BEHAVIOR: Simulate Twilio Verify check
        // e.g. const verification_check = await client.verify.v2.services(SID).verificationChecks.create({ to: normalizedPhone, code: inputOtp });
        // if (verification_check.status !== 'approved') return false;
        
        const isMockValid = inputOtp === '123456'; // Mock accepted OTP
        
        if (!isMockValid) {
            return { success: false, code: 'INVALID_OTP', message: 'Invalid verification code' };
        }
        
        await pool.query(`
            UPDATE users 
            SET phone_verified = true, 
                phone_verified_at = NOW()
            WHERE id = $1
        `, [userId]);
        
        return { success: true, phoneVerified: true };
    }

    static async sendEmailOtp(userId, email) {
        try {
            await this.checkCooldown(userId, 'email');
        } catch (e) {
            if (e.message === 'RESEND_TOO_SOON') {
                return { success: false, code: 'RESEND_TOO_SOON', message: 'Please wait before requesting another code.' };
            }
            throw e;
        }

        // MOCK BEHAVIOR: Twilio Verify email channel
        // e.g. client.verify.v2.services(SID).verifications.create({ to: email, channel: 'email' })
        
        await pool.query(`
            UPDATE users 
            SET email_otp_last_sent_at = NOW()
            WHERE id = $1
        `, [userId]);
        
        console.log(`[MOCK TWILIO VERIFY] Sent OTP to ${email} via EMAIL`);
        return { success: true, expiresIn: 600, resendAfter: 60 };
    }
    
    static async verifyEmailOtp(userId, inputOtp) {
        const { rows } = await pool.query('SELECT email FROM users WHERE id = $1', [userId]);
        const user = rows[0];
        
        if (!user || !user.email) {
            return { success: false, code: 'INVALID_REQUEST', message: 'No email found' };
        }

        // MOCK BEHAVIOR: Twilio Verify check
        const isMockValid = inputOtp === '123456'; 
        
        if (!isMockValid) {
            return { success: false, code: 'INVALID_OTP', message: 'Invalid verification code' };
        }
        
        await pool.query(`
            UPDATE users 
            SET email_verified = true, 
                email_verified_at = NOW()
            WHERE id = $1
        `, [userId]);
        
        return { success: true, emailVerified: true };
    }
}

module.exports = VerificationService;
