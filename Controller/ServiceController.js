const express = require('express')
const providerModel = require("../Model/ProviderSchemaModel")
const SERVICE = providerModel.provider;
const userModel = require("../Model/UserSchemaModel")
const USER = userModel.user;

exports.addServices = async (req, res) => {
    try {
        const { id, title, description, price, tag, category, ratings } = req.body;
        if (!id || !title || !description || !price || !tag || !category) {
            return res.status(400).json({ message: "All fields are required." });
        }

        const sr = await SERVICE.findOne({ id: id })

        if (!sr) {
            // If the service with the provided ID doesn't exist, handle the error
            return res.status(404).json({ message: 'Provider not found' })
        }


        const titleExists = sr.services.some((service) => service.title === title || service.description === description);
        if (titleExists) {
            return res.status(400).json({ message: 'Service with this title or Description already exists.' });
        }
        // Construct the service object
        const service = { provId: id, title, description, price, category, ratings, tag };


        sr.services.push(service)
        await sr.save()


        // let n = sr.services.length;
        // for (let index = 0; index < n; index++) {
        //     sr.services[index].serviceId = sr.services[index]._id;
        //     console.log(sr.services[index]._id)
        // }
        // await sr.save()

        return res.status(200).json({ message: 'Services are Added to the Salon successfully', services: sr.services });
    } catch (error) {
        // Handle any errors that occur during the try block
        console.error('An error occurred:', error.message);
        // You can also handle different types of errors here if needed
    }
}


exports.editServices = async (req, res) => {
    try {
        const { id, serviceId, price } = req.body;
        if (!id || !serviceId || !price) {
            return res.status(400).json({ message: "All fields are required." });
        }

        const sr = await SERVICE.findOne({ id: id })

        if (!sr) {
            // If the service with the provided ID doesn't exist, handle the error
            return res.status(404).json({ message: 'Provider not found' })
        }

        let n = sr.services.length;
        for (let index = 0; index < n; index++) {
            if (sr.services[index]._id == serviceId) {
                console.log(sr.services[index]._id)
                sr.services[index].price = price
            }
        }
        await sr.save()

        return res.status(200).json({ message: 'Services are edited to the Salon successfully', services: sr.services });
    } catch (error) {
        // Handle any errors that occur during the try block
        console.error('An error occurred:', error.message);
        // You can also handle different types of errors here if needed
    }
}

exports.deleteServices = async (req, res) => {
    try {
        const { id, ServiceIndex } = req.body;
        if (!id || (ServiceIndex === undefined)) {
            return res.status(400).json({ message: "All fields are required." });
        }

        // Find the user by their ID
        const existingPROV = await SERVICE.findOne({ id: id });

        if (!existingPROV) {
            // If the user is not found, respond with a 404 Not Found status
            return res.status(404).json({ message: "User not found" });
        }

        if (ServiceIndex !== undefined) {

            if (existingPROV.services[ServiceIndex]) {
                existingPROV.services.splice(ServiceIndex, 1);
            } else {
                return res.status(400).json({ message: "Invalid ServiceIndex" });
            }
        }


        // Save the updated user
        const updatedPROV = await existingPROV.save();

        // If the user is updated successfully, respond with a 200 OK status and the updated user data
        res.status(200).json({ message: "Service has been deleted successfully", del_services: updatedPROV });

    } catch (error) {
        // Handle any unexpected errors
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};



exports.getServices = async (req, res) => {
    try {
        const { id } = req.body;
        if (!id) {
            return res.status(400).json({ message: "All fields are required." });
        }

        // Find the user by their ID
        const existingPROV = await SERVICE.findOne({ id: id });

        if (!existingPROV) {
            // If the user is not found, respond with a 404 Not Found status
            return res.status(404).json({ message: "User not found" });
        }

        const user = await SERVICE.findOne({ id: id }).select("services")
        // If the user is updated successfully, respond with a 200 OK status and the updated user data
        res.status(200).json({ message: "Fetching data ... ", services: user.services });

    } catch (error) {
        // Handle any unexpected errors
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.getOnlyService = async (req, res) => {
    try {
        const { id, serviceId } = req.body;
        if (!id || !serviceId) {
            return res.status(400).json({ message: "Both 'id' and 'serID' fields are required." });
        }

        // Find the user by their ID
        const existingPROV = await SERVICE.findOne({ id: id });

        if (!existingPROV) {
            // If the user is not found, respond with a 404 Not Found status
            return res.status(404).json({ message: "User not found" });
        }

        const getOnlyService = existingPROV.services.filter((service) => service._id.toString() === serviceId.toString());

        if (getOnlyService.length > 0) {
            res.json(getOnlyService);
        } else {
            res.json({ message: `No services found ` });
        }
    } catch (error) {
        // Handle any unexpected errors
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.getCategoryService = async (req, res) => {
    try {
        const { id, category } = req.body;
        if (!id || !category) {
            return res.status(400).json({ message: "Both 'id' and 'serID' fields are required." });
        }

        // Find the user by their ID
        const existingPROV = await SERVICE.findOne({ id: id });

        if (!existingPROV) {
            // If the user is not found, respond with a 404 Not Found status
            return res.status(404).json({ message: "User not found" });
        }

        const servicesInCategory = existingPROV.services.filter((service) => service.category === category);

        if (servicesInCategory.length > 0) {
            // If services are found in the category, respond with the services data
            res.json(servicesInCategory);
        } else {
            // If no services are found in the category, respond with a message
            res.json({ message: `No services found in the '${category}' category` });
        }
    } catch (error) {
        // Handle any unexpected errors
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.createServiceReview = async (req, res, next) => {
    try {
        const { id, serviceId, rating, comment } = req.body;
        const existingUser = await USER.findOne({ id: id })
        if (!existingUser) {
            // If the user is not found, respond with a 404 Not Found status
            return res.status(404).json({ message: "User not found" });
        }
        console.log(existingUser._id)
        const review = {
            user: existingUser._id,
            name: existingUser.lastname,
            rating: Number(rating),
            comment: comment
        }


        let avg = 0;
        const sr = await SERVICE.findOne({ 'services._id': serviceId });
        const getOnlyService = sr.services.filter((service) => service._id.toString() === serviceId.toString());
        if (!getOnlyService) {
            return res.status(404).json({ message: "Services not found" });
        }

        let n = sr.services.length
        for (let index = 0; index < n; index++) {
            if (sr.services[index]._id.equals(serviceId)) {
                sr.services[index].reviews.push(review);
                let n1 = sr.services[index].reviews.length
                for (let index1 = 0; index1 < n1; index1++) {
                    avg += sr.services[index].reviews[index1].rating
                    console.log(avg)
                }
                sr.services[index].ratings = avg / n1
                await sr.save()
                break;
            }
        }
        return res.status(200).json({ message: 'Review has been Added to the Services successfully', services: sr.services });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};


exports.deleteServiceReview = async (req, res, next) => {
    try {
        const { id, serviceId, reviewIndex } = req.body;
        const existingUser = await USER.findOne({ id: id })
        if (!existingUser) {
            // If the user is not found, respond with a 404 Not Found status
            return res.status(404).json({ message: "User not found" });
        }
        console.log(existingUser._id)

        const sr = await SERVICE.findOne({ 'services._id': serviceId });
        let n = sr.services.length
        for (let index = 0; index < n; index++) {
            if (sr.services[index]._id.equals(serviceId)) {
                if (reviewIndex !== undefined) {
                    if (sr.services[index].reviews[reviewIndex]) {
                        sr.services[index].reviews.splice(reviewIndex, 1);
                    } else {
                        return res.status(400).json({ message: "Invalid reviewIndex" });
                    }
                }
                await sr.save()
                break;
            }
        }

        res.status(200).json({ message: "Service has been deleted successfully", del_services: sr.services });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.getonlyServiceRatings = async (req, res, next) => {
    try {
        const { provId, serviceId } = req.body;
        const sr = await SERVICE.findOne({ id: provId })
        if (!sr) {
            // If the user is not found, respond with a 404 Not Found status
            return res.status(404).json({ message: "User not found" });
        }
        console.log(sr._id)

        const getOnlyService = sr.services.filter((service) => service._id.toString() === serviceId.toString());
        if (!getOnlyService) {
            return res.status(404).json({ message: "Services not found" });
        }

        let n = sr.services.length
        for (let index = 0; index < n; index++) {
            if (sr.services[index]._id.equals(serviceId)) {
                console.log(sr.services[index].ratings)
                res.status(200).json({ service_rating: sr.services[index].ratings });
                break;
            }
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};


exports.getServicesDescendingRatings = async (req, res) => {
    try {
        const { id } = req.body;
        if (!id) {
            return res.status(400).json({ message: "Both 'id field are required." });
        }

        // Find the user by their ID
        const existingPROV = await SERVICE.findOne({ id: id });

        if (!existingPROV) {
            // If the user is not found, respond with a 404 Not Found status
            return res.status(404).json({ message: "Provider not found" });
        }

        const servicesInRatings = existingPROV.services.filter((service) => service.ratings);
        const n = servicesInRatings.length
        if (n > 0) {
            // If services are found in the category, respond with the services data
            for (let index = 0; index < n - 1; index++) {
                for (let index1 = 0; index1 < n - index - 1; index1++) {
                    if (servicesInRatings[index1] > servicesInRatings[index1 + 1]) {
                        const temp = servicesInRatings[index1];
                        servicesInRatings[index1] = servicesInRatings[index1 + 1];
                        servicesInRatings[index1 + 1] = temp;
                    }
                }
            }

            res.json(servicesInRatings);
        } else {
            // If no services are found in the category, respond with a message
            res.json({ message: `Ratings not found` });
        }
    } catch (error) {
        // Handle any unexpected errors
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

exports.getServicesDescendingRatings = async (req, res) => {
    try {
        const { id } = req.body;
        if (!id) {
            return res.status(400).json({ message: "Both 'id field are required." });
        }

        // Find the user by their ID
        const existingPROV = await SERVICE.findOne({ id: id });

        if (!existingPROV) {
            // If the user is not found, respond with a 404 Not Found status
            return res.status(404).json({ message: "Provider not found" });
        }

        const servicesInRatings = existingPROV.services.filter((service) => service.ratings);
        const n = servicesInRatings.length
        if (n > 0) {
            // If services are found in the category, respond with the services data
            for (let index = 0; index < n - 1; index++) {
                for (let index1 = 0; index1 < n - index - 1; index1++) {
                    if (servicesInRatings[index1] > servicesInRatings[index1 + 1]) {
                        const temp = servicesInRatings[index1];
                        servicesInRatings[index1] = servicesInRatings[index1 + 1];
                        servicesInRatings[index1 + 1] = temp;
                    }
                }
            }

            res.json(servicesInRatings);
        } else {
            res.json({ message: `Ratings not found` });
        }
    } catch (error) {
        // Handle any unexpected errors
        console.error(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

//  catchAsyncError(async(req, res, next)=>{
//     const {rating, comment, productId} = req.body;
//     const review={
//         user: req.user._id,
//         name: req.user.name,
//         rating: Number(rating),
//         comment
//     }
//     const product = await productModel.findById(productId);
//     const isReviewed = product.reviews.find(rev => rev.user.toString() === req.user._id.toString());
//     if(isReviewed){
//         product.reviews.forEach((rev)=>{
//             if(rev.user.toString() === req.user._id.toString()){
//             rev.rating= rating,
//             rev.comment= comment
//             }
//         });
//     }
//     else{
//         product.reviews.push(review);
//         product.numOfReviews = product.reviews.length;
//     }
//     let avg = 0;
//      product.reviews.forEach((rev) => {
//         avg += rev.rating;
//     })
//     product.ratings = avg / product.reviews.length;
//     await product.save({
//         validateBeforeSave: false
//     })
//     res.status(200).json({
//         success: true
//     })
// });