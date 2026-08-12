require('dotenv').config()

const express = require('express')
const port = 3000
const app = express()
const { User, Profile, Product } = require("./models")
const router = require('./routes')

app.use(express.urlencoded()) // body parser
app.use(express.json()) // body parser

app.get("/", (req, res) => {
    console.log(process.env.JWT_SECRET_KEY)
    res.send("helo")
})

app.use(router)

app.get("/users-profiles", async (req, res) => {
    try {
        const users = await User.findAll({
            include: [
                {
                    model: Profile,
                },
                {
                    model: Product,
                    attributes: ['name', 'category']
                }
            ]

        })
        res.send(users)
    } catch (error) {
        res.status(500).send(error)
    }
})

app.post("/users", async (req, res) => {

    const { name, email, phoneNumber } = req.body
    try {
        const newUser = await User.create({
            name: name,
            email: email,
            phoneNumber
        })
        res.send(newUser)
    } catch (error) {
        res.send(error)
    }
})

app.get("/delete/users/:id", async (req, res) => {
    try {

        const { id } = req.params
        const foundUser = await User.findByPk(id)
        if (!foundUser) {
            throw 'user not found'
        }
        await User.destroy({
            where: {
                id: id
            }
        })
        res.send(`Successfully deleted user with id ${id}`)
    } catch (error) {
        res.send(error)
    }
})  // harus nya app.delete

app.post("/update/users/:id", async (req, res) => {
    try {
        const { phoneNumber } = req.body
        const { id } = req.params
        const updatedUser = await User.update({
            phoneNumber: phoneNumber
        }, {
            where: {
                id: id
            },
            returning: true
        })
        console.log(updatedUser)
        res.send(updatedUser)
    } catch (error) {
        console.log(error)
        res.send(error)
    }
}) // harus nya app.put | app.patch

app.listen(port, () => {
    console.log(`Listening on port: ${port}`)
})