const UserController = require('../controllers/userController')
const authentication = require('../middlewares/authentication')

const router = require('express').Router()

router.post("/register", UserController.register)
router.post("/login", UserController.login)
router.use(authentication)
router.get("/users", UserController.getUsers)
router.get("/users/:id", UserController.getUserById)

module.exports = router