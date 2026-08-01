const express = require('express')
const port = 3000
const app = express()
const { User } = require("./models")
const { Op } = require('sequelize')

app.use(express.urlencoded()) // body parser
app.use(express.json()) // body parser

app.get("/", (req, res) => {
    res.send("helo")
})

app.get("/users", async (req, res) => {
    try {

        if (req.query.email) {
            const users = await User.findAll({
                where: {
                    email: {
                        [Op.iLike]: `%${req.query.email}%`
                    },
                }
            })
            res.send(users)
        } else {
            const users = await User.findAllUsers()
            console.log(users)
            res.send(users)
        }
    } catch (error) {
        console.log(error)
        res.send(error)
    }
})

app.get("/users/:id", async (req, res) => {
    try {
        const { id } = req.params
        const user = await User.findByPk(id, {
            attributes: ['id', 'name']
        })
        res.send(user)
    } catch (error) {
        res.send(error)
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
}) // app.put | app.patch

app.listen(port, () => {
    console.log(`Listening on port: ${port}`)
})