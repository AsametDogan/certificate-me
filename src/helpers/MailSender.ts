
import nodemailer from 'nodemailer';

interface MailOptions {
    to: string;
    subject: string;
    from: {
        name: string,
        address: string
    };
    text: string;
    html: string
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
                subject: 'Certificate Me Mail Doğrulama Kodu',
                text: `Mail Adresi için Doğrulama kodunuz: ${text}\n\nUygulamada açılan ekran kodu girerek devam edebilirsiniz`, // Doğrulama kodu
                html: `
                <html>
                  <head>
                    <style>
                      body {
                        font-family: Arial, sans-serif;
                        background-color: #f2f2f2;
                        padding: 20px;
                      }
                      .container {
                        background-color: #ffffff;
                        border-radius: 5px;
                        padding: 20px;
                        box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
                      }
                      h1 {
                        color: #333333;
                      }
                      p {
                        color: #666666;
                      }
                      .verification-code {
                        font-size: 24px;
                        font-weight: bold;
                        margin-top: 20px;
                        margin-bottom: 40px;
                      }
                      .image-container {
                        text-align: center;
                        margin-bottom: 20px;
                      }
                      img {
                        max-width: 90%;
                        height: auto;
                      }
                    </style>
                  </head>
                  <body>
                    <div class="container">
                      <h1>Mail Adresi için Doğrulama Kodu</h1>
                      <p>Doğrulama kodunuz:</p>
                      <p class="verification-code">${text}</p>
                      <p>Uygulamada açılan ekrana doğrulama kodunu girerek devam edebilirsiniz.</p>
                    
                     
                    </div>
                  </body>
                </html>
              `,
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