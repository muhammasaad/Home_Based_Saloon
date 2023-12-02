const express = require("express")
const server = express()
const mongoose = require("mongoose")
const cors = require("cors")
const authRoute = require("./routes/auth")
const provRoute = require("./routes/provider")
const order = require("./routes/order_management")
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const dotenv = require("dotenv")
dotenv.config()


main().catch(err => console.log(err));
async function main() {
    await mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true });
    console.log("Database Connected")
}
const connection = mongoose.connection
connection.once('open', () => {
    console.log('Database Connection has been established successfully')
})

const store = new MongoDBStore({
    uri: process.env.SESSION_MONGO_URI,
    collection: 'sessions',
});

server.use(session({
    store: store,
    secret: 'person',
    resave: true,
    saveUninitialized: true,
    cookie: {
        secure: false,
        // maxAge: 20000
    }
}))
server.use(cors())

server.use(express.json())


server.use("/auth", authRoute.router)
server.use("/provider", provRoute.router)
server.use("/order", order.router)

server.get('/', (req, res) => {
    try {
        res.send("eelo")
    } catch (error) {
        res.send("eelo", error)
    }

})

const port = process.env.PORT || 1001
server.listen(port, () => {
    console.log(`Server is running on ${port}`)
})