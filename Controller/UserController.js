const express = require('express')
const userModel = require("../Model/UserSchemaModel")
const serviceModel = require("../Model/ProviderSchemaModel")
const USER = userModel.user;
const SERVICE = serviceModel.provider;
const bcrypt = require("bcrypt");
const ResponseHanding = require('../ResponseHandling');
const otpGenerator = require('otp-generator')
const otpMap = new Map();
const jwt = require('jsonwebtoken')




exports.SignUP = async (req, res) => {
    try {
        const { firstname, lastname, email, password, country, phoneNumber } = req.body;

        // Check if any of the required fields are missing
        if (!firstname || !lastname || !email || !password || !country | phoneNumber) {
            return res.status(400).json({ message: "All fields are required." });
        }

        // Check if the email is already in use
        const existingUser = await USER.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: "Email is already registered." });
        }

        const saltRound = 10;
        const hashedPassword = await bcrypt.hash(password, saltRound);

        // Create a new user
        const user = await USER.create({ firstname, lastname, email, password: hashedPassword, country: country, phoneNumber: phoneNumber });
        user.id = user._id

        user.save()
        // Return a success response
        // res.status(201).json({ message: "User registered successfully", user });
        return new ResponseHanding(res, 200, "Signed-up successfully", true, user)
    } catch (error) {
        // Handle any unexpected errors
        console.error(error);
        res.status(500).json({ message: "An error occurred while processing your request." });
    }
}

exports.LogIN = async (req, res) => {
    const { email, password } = req.body;

    try {
        if (!email || !password) {
            return new ResponseHanding(res, 400, "All Fields are required")
        }

        // Find the user by email
        const user = await USER.findOne({ email: email });

        if (!user) {
            return new ResponseHanding(res, 404, "User not Found")
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return new ResponseHanding(res, 401, "Invalid Password")
        }

        const tokenVes = otpGenerator.generate(9, {
            digits: true,
            lowerCaseAlphabets: false,
            upperCaseAlphabets: false,
            specialChars: false,
        });
        const tokenVersion = tokenVes


        // OTP is valid; proceed with login
        // req.session.isAuthenticated = true;
        // req.session.user = { token };
        const token = await jwt.sign({ id: user._id, tokenVersion: tokenVersion }, process.env.SECRET_KEY);
        user.tokenVersion = tokenVersion
        user.save()
        return new ResponseHanding(res, 200, "Logged in successfully", true, user, token)
    } catch (error) {
        // Handle any unexpected errors
        console.error(error);
        return new ResponseHanding(res, 500, "Internal Server Error")
    }
}

exports.verifyAccountSignup = async (req, res) => {
    const { email, OTP } = req.body;

    try {
        if (!email || !OTP) {
            return new ResponseHanding(res, 400, "All Fields are required")
        }

        // Find the user by email
        const user = await USER.findOne({ email: email });

        if (!user) {
            return new ResponseHanding(res, 404, "User not found")
        }

        if (user.OTP !== OTP) {
            return new ResponseHanding(res, 401, "OTP is invalid")
        }

        const tokenVes = otpGenerator.generate(9, {
            digits: true,
            lowerCaseAlphabets: false,
            upperCaseAlphabets: false,
            specialChars: false,
        });
        const tokenVersion = tokenVes


        // OTP is valid; proceed with login
        // req.session.isAuthenticated = true;
        // req.session.user = { token };
        const token = await jwt.sign({ id: user._id, tokenVersion: tokenVersion }, process.env.SECRET_KEY);
        user.tokenVersion = tokenVersion
        user.isVerified = true
        user.save()

        return new ResponseHanding(res, 200, "Created Account verified", true, user, token)
    } catch (error) {
        // Handle any unexpected errors
        console.error(error);
        return new ResponseHanding(res, 500, "Internal Server Error")
    }
}

exports.forgetPassOTP = async (req, res) => {
    const { email, OTP } = req.body;

    try {
        if (!email || !OTP) {
            return new ResponseHanding(res, 400, "All Fields are required")
        }

        // Find the user by email
        const user = await USER.findOne({ email: email });

        if (!user) {
            return new ResponseHanding(res, 404, "User not found")
        }

        if (user.OTP !== OTP) {
            return new ResponseHanding(res, 401, "OTP is invalid")
        }

        return new ResponseHanding(res, 200, "Account Verified", true)
    } catch (error) {
        // Handle any unexpected errors
        console.error(error);
        return new ResponseHanding(res, 500, "Internal Server Error")
    }
}


exports.GettingUSERSession = async (req, res) => {
    if (req.session.isAuthenticated) {
        // If the user is authenticated, send the session user's email
        res.send(req.session.user.id);
    } else {
        // If the user is not authenticated, send a 401 Unauthorized status and a message
        res.status(401).send('Not authenticated');
    }
}

exports.logOUT = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            // If there's an error while destroying the session, log the error
            console.error('Error destroying session:', err);
        } else {
            // If the session is destroyed successfully, send a "Logged out successfully" message
            res.send('Logged out successfully');
        }
    });
};

exports.deleteUSER = async (req, res) => {
    try {
        const { id } = req.body
        if (!id) {
            return res.status(400).json({ message: "All fields are required." });
        }
        // Delete the user with the provided email
        const deletedUser = await USER.findOneAndDelete({ id: id });
        if (deletedUser) {
            // If the user is successfully deleted, destroy the session
            req.session.destroy((err) => {
                if (err) {
                    // If there's an error while destroying the session, log the error
                    console.error('Error destroying session:', err);
                    res.status(500).send('Error destroying session');
                } else {
                    // If the session is destroyed successfully, send a "Logged out successfully" message
                    res.send('Deleting Account');
                }
            });
        } else {
            // If the user doesn't exist, respond with a 404 Not Found status
            res.status(404).send('User not found');
        }
    } catch (error) {
        // Handle any unexpected errors
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
};

exports.gettingUSER = async (req, res) => {
    try {
        const token = req.get('Authorization').split('Bearer ')[1];

        const verify = jwt.verify(token, process.env.SECRET_KEY);
        if (!verify.id) {
            // If the 'id' is not present in the token payload, respond with a 401 Unauthorized status
            return new ResponseHanding(res, 401, "Unauthorized");
        }
        const user = await USER.findOne({ _id: verify.id });

        if (user) {
            // If a user with the provided email is found, send the user data as a response
            new ResponseHanding(res, 200, "User Found", true, user);
        } else {
            // If no user with the provided email is found, respond with a 404 Not Found status
            new ResponseHanding(res, 404, "User not Found", false);
        }
    } catch (error) {
        // Handle any unexpected errors
        console.error(error);
        new ResponseHanding(res, 500, "Internal Server Error");
    }
};


exports.ResetPassUSER = async (req, res) => {
    try {
        const { email, password } = req.body
        if (!email || !password) {
            return new ResponseHanding(res, 400, "All Fields are required");
        }
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Find the user by email and update the password with the hashed value
        const user = await USER.findOneAndUpdate({ email: email }, { password: hashedPassword }, { new: true });

        if (user) {
            // If a user with the provided email is found and the password is updated, respond with a success message
            new ResponseHanding(res, 200, "Password Reset Successfully");
        } else {
            // If no user with the provided email is found, respond with a 404 Not Found status
            new ResponseHanding(res, 404, "User not Found");
        }
    } catch (error) {
        // Handle any unexpected errors
        console.error(error);
        return new ResponseHanding(res, 500, "Internal Server Error");
    }
};




exports.changePassword = async (req, res) => {
    try {
        const token = req.get('Authorization').split('Bearer ')[1];

        const verify = jwt.verify(token, process.env.SECRET_KEY);
        if (!verify.id) {
            // If the 'id' is not present in the token payload, respond with a 401 Unauthorized status
            return new ResponseHanding(res, 401, "Unauthorized");
        }

        const user = await USER.findOne({ _id: verify.id });
        if (!user) {
            // If the user is not found, respond with a 404 Not Found status
            return new ResponseHanding(res, 404, "User not found");
        }

        const { oldPassword, newPassword } = req.body
        if (!newPassword || !oldPassword) {
            return new ResponseHanding(res, 400, "All Fields are required");
        }

        // Compare the provided password with the stored password
        const passwordMatch = await bcrypt.compare(oldPassword, user.password);

        if (passwordMatch) {
            // If the provided password matches the stored password, update the password
            const saltRounds = 10;
            const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

            // Update the password in the database
            const updatedUser = await USER.findOneAndUpdate(
                { _id: verify.id },
                { password: hashedPassword },
                { new: true }
            );

            // Respond with a success message
            new ResponseHanding(res, 200, "Password Updated successfully", true, updatedUser);
        } else {
            // If the provided password does not match the stored password, respond with a 401 Unauthorized status
            new ResponseHanding(res, 401, "Invalid old password");
        }
    } catch (error) {
        // Handle any unexpected errors
        console.error(error);
        new ResponseHanding(res, 500, "Internal Server Error");
    }
};

exports.replaceAndUpdateUSER = async (req, res) => {
    try {
        const token = req.get('Authorization').split('Bearer ')[1];

        const verify = jwt.verify(token, process.env.SECRET_KEY);
        if (!verify.id) {
            // If the 'id' is not present in the token payload, respond with a 401 Unauthorized status
            return new ResponseHanding(res, 401, "Unauthorized");
        }

        const user = await USER.findOne({ _id: verify.id });
        if (!user) {
            // If the user is not found, respond with a 404 Not Found status
            return new ResponseHanding(res, 404, "User not found");
        }
        const { firstname, lastname, email, phoneNumber } = req.body

        const updatedUser = await USER.findOneAndUpdate(
            { _id: verify.id },
            { firstname: firstname, lastname: lastname, email: email, phoneNumber: phoneNumber },
            { new: true }
        );

        if (updatedUser) {
            // If the user is updated successfully, respond with a 200 OK status and the updated user data
            new ResponseHanding(res, 200, "Update User SuccessfullY", true, updatedUser);
        } else {
            // If there was an issue updating the user, respond with a 500 Internal Server Error
            new ResponseHanding(res, 500, "User Updated Failed");
        }
    } catch (error) {
        // Handle any unexpected errors
        console.error(error);
        return new ResponseHanding(res, 500, "Internal Server Error");
    }
};

exports.postAddressUSER = async (req, res) => {
    try {
        const { id, Home_Address, Work_Address } = req.body
        if (!id || !Home_Address && !Work_Address) {
            return res.status(400).json({ message: "All fields are required." });
        }

        // Find the user by their ID
        const existingUser = await USER.findOne({ id: id });
        if (!existingUser) {
            // If the user is not found, respond with a 404 Not Found status
            res.status(404).json({ message: "User not found" });
        } else {
            // Add the new home address to the user's addresses array
            if (Home_Address) {
                existingUser.Home_Address.push(Home_Address);
            } else {
                existingUser.Work_Address.push(Work_Address);
            }

            // Save the updated user
            const updatedUser = await existingUser.save();

            // If the user is updated successfully, respond with a 200 OK status and the updated user data
            res.status(200).json({ message: "Home address added successfully", user: updatedUser });
        }
    } catch (error) {
        // Handle any unexpected errors
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.deleteAddressUSER = async (req, res) => {
    try {
        const { id, Home_AddressIndex, Work_AddressIndex } = req.body;
        if (!id || (Home_AddressIndex === undefined && Work_AddressIndex === undefined)) {
            return res.status(400).json({ message: "All fields are required." });
        }

        // Find the user by their ID
        const existingUser = await USER.findOne({ id });

        if (!existingUser) {
            // If the user is not found, respond with a 404 Not Found status
            return res.status(404).json({ message: "User not found" });
        } else {

            if (Home_AddressIndex !== undefined) {
                // Delete the home address from the user's addresses array
                if (existingUser.Home_Address[Home_AddressIndex]) {
                    existingUser.Home_Address.splice(Home_AddressIndex, 1);
                } else {
                    return res.status(400).json({ message: "Invalid Home_AddressIndex" });
                }
            } else if (Work_AddressIndex !== undefined) {
                // Delete the work address from the user's addresses array
                if (existingUser.Work_Address[Work_AddressIndex]) {
                    existingUser.Work_Address.splice(Work_AddressIndex, 1);
                } else {
                    return res.status(400).json({ message: "Invalid Work_AddressIndex" });
                }
            }

            // Save the updated user
            const updatedUser = await existingUser.save();

            // If the user is updated successfully, respond with a 200 OK status and the updated user data
            res.status(200).json({ message: "Address deleted successfully", user: updatedUser });
        }
    } catch (error) {
        // Handle any unexpected errors
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.postFeedbackUSER = async (req, res) => {
    try {
        const { id } = req.body;
        const option = req.body.option
        const message = req.body.message

        const fd = {
            option: option,
            message: message
        }

        if (!id || !option && !message) {
            return res.status(400).json({ message: "All fields are required." });
        }
        const user = await USER.findOne({ id: id });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        user.feedback.push(fd)
        user.save();

        return res.status(200).json({ message: 'Feedback updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.addFavServices = async (req, res) => {
    try {
        const { id, serviceId } = req.body;

        // Ensure userId and UID are provided
        if (!id || !serviceId) {
            return res.status(400).json({ message: "Both 'userId' and 'serviceId' fields are required." });
        }

        // Find the user by their ID
        const user = await USER.findOne({ id: id });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Find the service by UID (assuming you're using a mongoose model)
        const sr = await SERVICE.findOne({ 'services._id': serviceId });

        if (!sr) {
            return res.status(404).json({ message: "Service not found" });
        }

        // Check if the service with the provided UID is already in the user's favorites
        const isAlreadyFavorited = user.favoriteServices.includes(serviceId);

        if (isAlreadyFavorited) {
            return res.status(400).json({ message: "Service is already in favorites" });
        }

        // Check if the service with the provided UID exists in the services array
        const service = sr.services.find((service) => service._id.toString() === serviceId.toString());

        if (service) {
            // If the service exists, push it into the user's favoriteServices
            user.favoriteServices.push(serviceId);
            await user.save();
            res.status(200).json({ message: "Service added to favorites", user: user.favoriteServices });
        } else {
            res.status(404).json({ message: "Service not found in the services array" });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};


exports.deleteFavServices = async (req, res) => {
    try {
        const { id, favServiceIndex } = req.body;
        if (!id || (favServiceIndex === undefined)) {
            return res.status(400).json({ message: "All fields are required." });
        }

        // Find the user by their ID
        const existingUSER = await USER.findOne({ id: id });

        if (!existingUSER) {
            // If the user is not found, respond with a 404 Not Found status
            return res.status(404).json({ message: "User not found" });
        }

        if (favServiceIndex !== undefined) {

            if (existingUSER.favoriteServices[favServiceIndex]) {
                existingUSER.favoriteServices.splice(favServiceIndex, 1);
            } else {
                return res.status(400).json({ message: "Invalid ServiceIndex" });
            }
        }


        // Save the updated user
        const updatedUSER = await existingUSER.save();

        // If the user is updated successfully, respond with a 200 OK status and the updated user data
        res.status(200).json({ message: "Address deleted successfully", user: updatedUSER });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};


exports.getFavServices = async (req, res) => {
    try {
        const { id } = req.body;

        // Ensure userId and serviceId are provided
        if (!id) {
            return res.status(400).json({ message: "All fields are required." });
        }

        const user = await USER.findOne({ id: id })
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const favoriteServices = user.favoriteServices;

        res.status(200).json(favoriteServices);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};