import nodemailer from 'nodemailer';
import { serverConfig } from './index.ts';


const transporter = nodemailer.createTransport({
    service:'gmail',
    auth:{
        user:serverConfig.SMTP_USER,
        pass:serverConfig.SMTP_PASS,
    }
});

export default transporter;

