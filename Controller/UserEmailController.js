const userModel = require("../Model/UserSchemaModel")
const USER = userModel.user;
const providerModel = require("../Model/ProviderSchemaModel")
const PROVIDER = providerModel.provider;
const express_async_handler = require('express-async-handler')
const nodemailer = require("nodemailer")
const otpGenerator = require('otp-generator')
const bcrypt = require("bcrypt")
const ResponseHanding = require('../ResponseHandling');
const dotenv = require("dotenv")
dotenv.config()

const otpMap = new Map();

const transport = nodemailer.createTransport({
    host: process.env.SMTP,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
        user: "rrohamsaad@gmail.com",
        pass: process.env.SMTP_PASSWORD,
    },
})

exports.sendEmail = express_async_handler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: "Email and password are required." });
    }

    try {
        const user = await USER.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "User not found." });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({ message: "Invalid password." });
        }

        const OTP = otpGenerator.generate(4, {
            digits: true,
            lowerCaseAlphabets: false,
            upperCaseAlphabets: false,
            specialChars: false,
        });

        if (OTP) {
            // Store the OTP and its expiration timer
            otpMap.set(user.email, OTP);
            console.log(otpMap.get(email));
            console.log(otpMap.has(email));
            // Set a timer to remove the OTP after 30 seconds
            setTimeout(async () => {
                otpMap.delete(user.email);
                await USER.updateOne({ email: email }, { $unset: { OTP: 1 } })
            }, 30000); // 30,000 milliseconds = 30 seconds

            user.OTP = OTP;
            await user.save();

            const mailOptions = {
                from: process.env.SMTP_MAIL,
                to: user.email,
                subject: 'OTP For verification',
                text: `Verification Code for Login: ${OTP}`,
            };

            transport.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.error(error);
                    res.status(500).json({ message: 'Failed to send OTP email' });
                } else {
                    console.log('Email sent successfully');
                    res.status(200).json({ message: 'Email sent successfully' });
                }
            });
        } else {
            res.status(400).json({ message: 'OTP expired or not generated' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});


exports.sendEmailUser = express_async_handler(async (req, res) => {
    const { firstname, lastname, email, password, country } = req.body;
    try {
        // Check if any of the required fields are missing
        if (!firstname || !lastname || !email || !password || !country) {
            return res.status(400).json({ message: "All fields are required." });
        }

        // Check if the email is already in use
        const existingUser = await USER.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "Email is already registered." });
        }

        const saltRound = 10;
        const hashedPassword = await bcrypt.hash(password, saltRound);



        const OTP = otpGenerator.generate(4, {
            digits: true,
            lowerCaseAlphabets: false,
            upperCaseAlphabets: false,
            specialChars: false,
        });

        if (OTP) {
            // Store the OTP and its expiration timer
            // otpMap.set(email, OTP);
            // console.log(otpMap.get(email));
            // console.log(otpMap.has(email));
            // Set a timer to remove the OTP after 30 seconds
            // setTimeout(async () => {
            //     otpMap.delete(user.email);
            //     await USER.updateOne({ email: email }, { $unset: { OTP: 1 } })
            // }, 30000); // 30,000 milliseconds = 30 seconds


            const mailOptions = {
                from: process.env.SMTP_MAIL,
                to: email,
                subject: 'OTP For verification',
                text: `Verification Code for Login: ${OTP}`,
            };

            const user = await USER.create({ firstname, lastname, email, password: hashedPassword, country: country });
            user.OTP = OTP
            user.save();

            transport.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.error(error);
                    res.status(500).json({ message: 'Failed to send OTP email' });
                } else {
                    console.log('Email sent successfully');
                    // res.status(200).json({ message: 'Email sent successfully' });
                    return new ResponseHanding(res, 200, "Email sent successfully and Account Created without Verify", true, user)
                }
            });
        } else {
            res.status(400).json({ message: 'OTP expired or not generated' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});



exports.sendEmailProvider = express_async_handler(async (req, res) => {
    const { shortcode } = req.body;

    if (!shortcode) {
        return res.status(400).json({ message: "shortcode is required." });
    }

    try {
        const prov = await PROVIDER.findOne({ shortcode: shortcode });

        if (!prov) {
            return res.status(404).json({ message: "Provider not found." });
        }

        const OTP = otpGenerator.generate(4, {
            digits: true,
            lowerCaseAlphabets: false,
            upperCaseAlphabets: false,
            specialChars: false,
        });

        if (OTP) {
            // Store the OTP and its expiration timer
            // otpMap.set(prov.email, OTP);

            // Set a timer to remove the OTP after 30 seconds
            // setTimeout(async () => {
            //     otpMap.delete(prov.email);
            //     await USER.updateOne({ email: email }, { $unset: { OTP: 1 } })
            // }, 30000); // 30,000 milliseconds = 30 seconds

            prov.OTP = OTP;
            await prov.save();

            const mailOptions = {
                from: process.env.SMTP_MAIL,
                to: prov.email,
                subject: 'OTP For verification',
                text: `Verification Code for Login: ${OTP}`,
            };

            transport.sendMail(mailOptions, function (error, info) {
                if (error) {
                    console.error(error);
                    res.status(500).json({ message: 'Failed to send OTP email' });
                } else {
                    console.log('Email sent successfully');
                    res.status(200).json({ message: 'Email sent successfully' });
                }
            });
        } else {
            res.status(400).json({ message: 'OTP expired or not generated' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
});
