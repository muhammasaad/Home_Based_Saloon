const express = require('express')
const providerModel = require("../Model/ProviderSchemaModel")
const ResponseHanding = require('../ResponseHandling');
const PROVIDER = providerModel.provider;
const jwt = require('jsonwebtoken')
const bcrypt = require("bcrypt")

exports.SignUP = async (req, res) => {
    try {
        const { shortcode, email, firstname, lastname, phoneNumber, salonName } = req.body;

        // Check if any of the required fields are missing
        if (!shortcode || !email || !firstname || !lastname || !phoneNumber || !salonName) {
            return res.status(400).json({ message: "All fields are required." });
        }

        // Check if the email is already in use
        const existingProv = await PROVIDER.findOne({ shortcode });
        if (existingProv) {
            return res.status(409).json({ message: "This short-code is already registered." });
        }

        // Create a new user
        const prov = await PROVIDER.create({ shortcode: shortcode, firstname: firstname, lastname: lastname, email: email, phoneNumber: phoneNumber, salonName: salonName });
        prov.id = prov._id
        prov.save()
        // Return a success response
        res.status(201).json({ message: "User registered successfully as Provider", prov });
    } catch (error) {
        // Handle any unexpected errors
        console.error(error);
        res.status(500).json({ message: "An error occurred while processing your request." });
    }
}

exports.LogIN = async (req, res) => {
    const { shortcode, OTP } = req.body;

    try {
        // Check if both shortcode and OTP are provided
        if (!shortcode || !OTP) {
            return res.status(400).json({ message: "Both shortcode and OTP are required." });
        }

        // Find the user by shortcode and OTP
        const prov = await PROVIDER.findOne({ shortcode: shortcode, OTP: OTP });

        // If user not found, return authentication failure response
        if (!prov) {
            return new ResponseHanding(res, 401, "Authentication failed. Invalid shortcode or OTP.", false);
        }

        // Sign a JWT token
        const token = await jwt.sign({ id: prov._id }, process.env.SECRET_KEY);

        // Set session variables
        req.session.isAuthenticated = true;
        req.session.prov = { token };

        // Return success response with the token
        return new ResponseHanding(res, 200, "Logged in successfully", true, token);

    } catch (error) {
        // Handle any unexpected errors
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
}


exports.GettingPROVSession = async (req, res) => {
    if (req.session.isAuthenticated) {
        // If the user is authenticated, send the session user's email
        res.send(req.session.prov.id);
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

exports.deletePROV = async (req, res) => {
    try {
        const { id } = req.body
        if (!id) {
            return res.status(400).json({ message: "All fields are required." });
        }
        // Delete the user with the provided email
        const deletedPROV = await USER.findOneAndDelete({ id: id });
        if (deletedPROV) {
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

exports.GettingPROV = async (req, res) => {
    try {
        const { id } = req.body
        if (!id) {
            return res.status(400).json({ message: "All fields are required." });
        }
        // Find the user by email
        const prov = await PROVIDER.findOne({ id: id });

        if (prov) {
            // If a user with the provided email is found, send the user data as a response
            res.status(200).json({ message: "User found", prov });
        } else {
            // If no user with the provided email is found, respond with a 404 Not Found status
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        // Handle any unexpected errors
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};


exports.replaceAndUpdatePROV = async (req, res) => {
    try {
        const { id, firstname, lastname, email, phoneNumber } = req.body
        if (!id) {
            return res.status(400).json({ message: "All fields are required." });
        }
        // Find the user by their ID
        const existingProv = await PROVIDER.findOne({ id: id });

        if (!existingProv) {
            // If the user is not found, respond with a 404 Not Found status
            res.status(404).json({ message: "User not found" });
        } else {
            // Update the user with the new data and return the updated user
            const updatedProv = await PROVIDER.findOneAndUpdate(
                { id: id },
                { firstname: firstname, lastname: lastname, email: email, phoneNumber: phoneNumber },
                { new: true }
            );

            if (updatedProv) {
                // If the user is updated successfully, respond with a 200 OK status and the updated user data
                res.status(200).json(updatedProv);
            } else {
                // If there was an issue updating the user, respond with a 500 Internal Server Error
                res.status(500).json({ message: "User update failed" });
            }
        }
    } catch (error) {
        // Handle any unexpected errors
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.postAddressPROV = async (req, res) => {
    try {
        const { id, address } = req.body
        if (!id || !address) {
            return res.status(400).json({ message: "All fields are required." });
        }

        // Find the user by their ID
        const existingProv = await PROVIDER.findOne({ id: id });
        if (!existingProv) {
            // If the user is not found, respond with a 404 Not Found status
            res.status(404).json({ message: "User not found" });
        } else {
            // Add the new home address to the user's addresses array
            if (address) {
                existingProv.address.push(address);
            }

            // Save the updated user
            const updatedProv = await existingProv.save();

            // If the user is updated successfully, respond with a 200 OK status and the updated user data
            res.status(200).json({ message: "Salon address added successfully", user: updatedProv });
        }
    } catch (error) {
        // Handle any unexpected errors
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.deleteAddressPROV = async (req, res) => {
    try {
        const { id, addressIndex } = req.body;
        if (!id || (addressIndex === undefined )) {
            return res.status(400).json({ message: "All fields are required." });
        }

        // Find the user by their ID
        const existingProv = await PROVIDER.findOne({ id });

        if (!existingProv) {
            // If the user is not found, respond with a 404 Not Found status
            return res.status(404).json({ message: "User not found" });
        } else {

            if (addressIndex !== undefined) {
                // Delete the home address from the user's addresses array
                if (existingProv.address[addressIndex]) {
                    existingProv.address.splice(addressIndex, 1);
                } else {
                    return res.status(400).json({ message: "Invalid Salon Address index" });
                }
            }

            // Save the updated user
            const updatedProv = await existingProv.save();

            // If the user is updated successfully, respond with a 200 OK status and the updated user data
            res.status(200).json({ message: "Address deleted successfully", user: updatedProv });
        }
    } catch (error) {
        // Handle any unexpected errors
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
exports.postFeedbackPROV = async (req, res) => {
    try {
        const { id } = req.body;
        const option = req.body.option
        const message = req.body.message

        const fd = {
            option : option,
            message : message
        }

        if (!id || !option && !message) {
            return res.status(400).json({ message: "All fields are required." });
        }
        const prov = await PROVIDER.findOne({ id: id });
        if (!prov) {
            return res.status(404).json({ message: 'User not found' });
        }
        prov.feedback.push(fd)
        prov.save();

        return res.status(200).json({ message: 'Feedback updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};