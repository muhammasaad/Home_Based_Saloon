const express = require('express')
const providerModel = require("../Model/ProviderSchemaModel")
const SERVICE = providerModel.provider;
const userModel = require("../Model/UserSchemaModel")
const USER = userModel.user;
const orderModel = require("../Model/OrderSchema")
const ORDER = orderModel.order
const otpGenerator = require('otp-generator')


exports.buyService = async (req, res) => {
    try {
        const { userId, serviceId, year, month, day, selectedSlot, } = req.body;

        if (!userId || !serviceId || !year || !month || !day || !selectedSlot) {
            return res.status(400).json({ message: "All fields are required." });
        }

        const selectedDate = new Date(year, month - 1, day + 1);
        selectedDate.setHours(0, 0, 0, 0);
        const user = await USER.findOne({ id: userId });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const sr = await SERVICE.findOne({ 'services._id': serviceId });
        const serviceToUpdate = sr.services.find(service => service._id.toString() === serviceId.toString());

        if (!serviceToUpdate) {
            return res.status(404).json({ message: "Service not found" });
        }

        // Generate an OTP
        const OTP = otpGenerator.generate(11, {
            digits: true,
            lowerCaseAlphabets: false,
            upperCaseAlphabets: true,
            specialChars: false,
        });
        console.log(OTP);

        const existingOrders = await ORDER.find({ selectedDate, selectedSlot });

        if (existingOrders.length > 0) {
            return res.status(409).json({ message: "This Selected Slot has already been reserved", Reserved: existingOrders });
        }

        const order = await ORDER.create({ userId: userId, serviceId: serviceId, BookingNumber: OTP, selectedDate: selectedDate, selectedSlot: selectedSlot })
        return res.status(200).json({ message: 'Order generated successfully', order: order });
    } catch (error) {
        console.error('An error occurred:', error.message);
        return res.status(500).json({ message: 'Internal server error' });
    }
}


exports.updateStatusService = async (req, res) => {
    try {
        const { userId, status } = req.body;

        // Check if userId and serviceId are provided
        if (!userId || !status) {
            return res.status(400).json({ message: "Both userId and serviceId are required." });
        }

        // Find the user by userId
        const oder = await ORDER.findOneAndUpdate({ userId: userId }, { status: status }, { new: true });
        if (!oder) {
            return res.status(404).json({ message: 'User not exists' });
        }

        return res.status(200).json({ message: 'Order generated successfully', order: oder });
    } catch (error) {
        console.error('An error occurred:', error.message);
        return res.status(500).json({ message: 'Internal server error' });
    }
}


exports.getBookedSlots = async (req, res) => {
    try {
        const { year, month, day, } = req.body;

        // Check if userId and serviceId are provided
        if (!year || !month || !day) {
            return res.status(400).json({ message: "All fields are required." });
        }

        const selectedDate = new Date(year, month - 1, day + 1);
        selectedDate.setHours(0, 0, 0, 0);

        // Find the user by userId
        const oder = await ORDER.find({ selectedDate });
        if (!oder) {
            return res.status(404).json({ message: 'Not exists' });
        }

        return res.status(200).json({ message: 'Order generated successfully', order: oder });
    } catch (error) {
        console.error('An error occurred:', error.message);
        return res.status(500).json({ message: 'Internal server error' });
    }
}

