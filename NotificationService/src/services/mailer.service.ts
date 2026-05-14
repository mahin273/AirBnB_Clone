import { serverConfig } from "../config/index.ts";
import transporter from "../config/mailer.config.ts";
import logger from "../config/logger.config.ts";
import { InternalServerError } from "../utils/errors/app.error.ts";

export async function sendEmail(to:string,subject:string,body:string){
     try {
        await transporter.sendMail({
            from:serverConfig.SMTP_USER,
            to,
            subject,
            html:body
        });
        logger.info(`Email sent to ${to} with subject ${subject}`);
     } catch (error) {
        logger.error('Failed to send email',error);
        throw new InternalServerError('Failed to send email');
     }
}