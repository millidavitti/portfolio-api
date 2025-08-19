import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
	host: process.env.EMAIL_SERVER_HOST,
	port: +process.env.EMAIL_SERVER_PORT!,
	secure: false, // true for port 465, false for other ports
	auth: {
		user: process.env.EMAIL_SERVER_USER,
		pass: process.env.EMAIL_SERVER_PASSWORD,
	},
	sender: process.env.EMAIL_FROM,
});
