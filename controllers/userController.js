const { User, Profile, Product } = require("../models")
const { Op } = require('sequelize')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken');


class UserController {
    static async register(req, res) {
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
    }

    static async login(req, res) {
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
            }, process.env.JWT_SECRET_KEY)

            // 4. kirim tokennya
            res.send({
                access_token: token
            })
        } catch (error) {
            res.send(error)
        }
    }

    static async getUsers(req, res) {
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
    }

    static async getUserById(req, res) {
        try {
            const { id } = req.params
            const user = await User.findByPk(id, {
                attributes: ['id', 'name']
            })
            res.send({
                data: user,
                whoAreYou: req.user
            })
        } catch (error) {
            console.log(error)
            res.send(error)
        }
    }
}

module.exports = UserController