'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasOne(models.Profile, { // null - jika tidak ada datanya
        foreignKey: "UserId"
      })

      User.hasMany(models.Product, { // [] - jika tidak ada datanya
        foreignKey: "UserId"
      })
    }

    static async findAllUsers() {
      return await User.findAll({
        attributes: ['id', ['name', 'namaUser'], 'email', 'createdAt']
      })
    }
  }
  User.init({
    name: DataTypes.STRING,
    phoneNumber: DataTypes.STRING,
    email: {
      type: DataTypes.STRING,
      unique: true
    },
    password: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};