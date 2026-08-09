const express = require('express')
const port = 3000
const app = express()
const { User, Profile, Product } = require("./models")
const { Op } = require('sequelize')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');

app.use(express.urlencoded()) // body parser
app.use(express.json()) // body parser

app.get("/", (req, res) => {
    res.send("helo")
})


// REGISTER
app.post("/register", async (req, res) => {
    try {
        // VALIDASI EMAIL dari DATABASE
        const foundEmail = await User.findOne({
            where: {
                email: req.body.email
            }
        })
        if (foundEmail) {
            throw 'User already registered'
        }

        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(req.body.password, salt)

        const newUser = await User.create({
            email: req.body.email,
            password: hashedPassword, // ubah password nya menjadi hash
            name: req.body.name,
            phoneNumber: req.body.phoneNumber
        })
        await Profile.create({
            fullName: req.body.name,
            address: req.body.address,
            UserId: newUser.id
        })

        res.send({
            id: newUser.id,
            email: newUser.email
        })
    } catch (error) {
        res.send(error)
    }
})

// LOGIN
app.post("/login", async (req, res) => {
    try {
        // 1. verifikasi email
        const foundEmail = await User.findOne({
            where: {
                email: req.body.email
            }
        })
        if (!foundEmail) {
            throw 'Email or Password doesnt match'
        }
        // 2. verifikasi password
        const verifiedPassword = await bcrypt.compare(req.body.password, foundEmail.password)
        if (!verifiedPassword) {
            throw 'Email or Password doesnt match'
        }

        // 3. generate token session
        const token = jwt.sign({
            id: foundEmail.id,
            email: foundEmail.email,
            phoneNumber: foundEmail.phoneNumber
        }, "PRIVATE_KEY_NOT_SAFE_IN_HERE")

        // 4. kirim tokennya
        res.send({
            access_token: token
        })
    } catch (error) {
        res.send(error)
    }
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