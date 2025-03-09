import nodemailer, {Transporter} from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();
// Define an interface for email options to ensure type safety
export interface EmailOptions {
    to: string;
    subject: string;
    text?: string;
    html?: string;
}

// Create a reusable EmailService class
class EmailService {
    private transporter: Transporter;

    constructor() {
        // Initialize the transporter with SMTP configurations.
        // You can use environment variables to store sensitive details.
        this.transporter = nodemailer.createTransport({
            requireTLS: true,
            host: process.env.SMTP_HOST,  // e.g., "smtp.gmail.com"
            port: Number(process.env.SMTP_PORT),// || 587,
            secure: (process.env.SMTP_PORT ?? '') == '465', // true for port 465, false otherwise
            auth: {
                user: process.env.SMTP_USER, // Email user from environment variable
                pass: process.env.SMTP_PASS, // Email password from environment variable
            },
        });
    }

    // Reusable function to send an email
    public async sendEmail(options: EmailOptions): Promise<void> {
        const mailOptions = {
            from: process.env.SMTP_USER, // Sender address
            to: options.to,
            subject: options.subject,
            text: options.text,
            html: options.html,
        };

        console.log(mailOptions);
        // Send the email using the transporter.
        try {
            await this.transporter.sendMail(mailOptions);
            console.info(`Email sent successfully to ${options.to}`);
        } catch (error) {
            console.error('Error sending email:', error);
            throw error;
        }
    }
}

// Export an instance of this service to reuse across your application.
export const emailService = new EmailService();
