
import nodemailer from 'nodemailer';

interface MailOptions {
    to: string;
    subject: string;
    from: {
        name: string,
        address: string
    };
    text: string;
}

class MailSender {

    private sender = async (transporter: any, mailOptions: MailOptions) => {
        try {
            await transporter.sendMail(mailOptions);
            return true;
        } catch (error: any) {
            console.log("Mail Gönderilemedi: " + error)
            return false;
        }
    }


    send = async (email: string, subject: string, text: string) => {

        try {
            const transporter = nodemailer.createTransport({
                service: "gmail",
                host: "smtp.gmail.com",
                port: 587,
                secure: false,
                auth: {
                    user: process.env.EMAIL_ADRESS,
                    pass: process.env.PASSWORD
                }
            });
            const mailOptions: MailOptions = {
                from: {
                    name: "Certificate Me",
                    address: process.env.EMAIL_ADRESS || ""
                },
                to: email,
                subject: subject,
                text: text
            };

            const result = await this.sender(transporter, mailOptions)
            return result

        } catch (error) {
            console.log("Create Transport is failed: " + error)
            return false
        }
    }

    static generateVerificationCode: () => string = () => {
        const verificationCode = Math.floor(10000 + Math.random() * 90000);
        return verificationCode.toString();
    }
}

export default MailSender