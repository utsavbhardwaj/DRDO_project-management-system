require('dotenv').config();
const { sendVerificationEmail } = require('./services/mailService');

async function testMail() {
    console.log("Testing SMTP Configuration...");

    // We will send a mock verification email to the email address in SMTP_USER 
    // or you can change this to your personal email to check the inbox.
    const mockUser = {
        name: "Test User",
        email: "utsavjha.me@gmail.com" // Hardcoded to your email address
    };

    console.log(`Attempting to send test email to: ${mockUser.email}`);

    try {
        const success = await sendVerificationEmail(mockUser, "mock-test-token-12345");
        if (success) {
            console.log("✅ SUCCESS! The email was sent correctly. Check the inbox (and spam folder)!");
        } else {
            console.error("❌ FAILED! The email function returned false.");
        }
    } catch (err) {
        console.error("❌ ERROR: ", err.message);
    }
}

testMail();
