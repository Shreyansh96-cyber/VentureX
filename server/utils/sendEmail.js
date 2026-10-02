import nodemailer from "nodemailer";

const sendEmail = async (to, subject, html) => {

    const transporter = nodemailer.createTransport({

        service: "gmail",

        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },

    });

    await transporter.sendMail({

        from: {
            name: "VentureX",
            address: process.env.EMAIL_USER,
        },

        to,

        subject,

        html,

        text: `
VentureX Password Reset

We received a request to reset your VentureX password.

Please use the password reset link provided in the email.

This link will expire shortly.

If you did not request a password reset, you can safely ignore this email.

— VentureX Team
        `,

        headers: {
            "X-Priority": "3",
            "X-Mailer": "VentureX",
        },

    });

};

export default sendEmail;