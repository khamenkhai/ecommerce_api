const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const getUsers = async (req, res) => {
    const userList = await User.find().select('-passwordHash');
    if (!userList) return res.status(500).json({ success: false });
    res.send(userList);
};

const getUserById = async (req, res) => {
    const user = await User.findById(req.params.id).select('-passwordHash');
    if (!user) return res.status(500).json({ message: 'The user with the given ID was not found.' });
    res.status(200).send(user);
};

const createUser = async (req, res) => {
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        street: req.body.street,
        apartment: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country,
    });
    user = await user.save();
    if (!user) return res.status(400).send('The user cannot be created!');
    res.send(user);
};

const updateUser = async (req, res) => {
    const userExist = await User.findById(req.params.id);
    let newPassword = req.body.password
        ? bcrypt.hashSync(req.body.password, 10)
        : userExist.passwordHash;

    const user = await User.findByIdAndUpdate(
        req.params.id,
        {
            name: req.body.name,
            email: req.body.email,
            passwordHash: newPassword,
            phone: req.body.phone,
            isAdmin: req.body.isAdmin,
            street: req.body.street,
            apartment: req.body.apartment,
            zip: req.body.zip,
            city: req.body.city,
            country: req.body.country,
        },
        { new: true }
    );

    if (!user) return res.status(400).send('The user cannot be updated!');
    res.send(user);
};

const loginUser = async (req, res) => {
    const user = await User.findOne({ email: req.body.email });
    const secret = process.env.JWT_SECRET;

    if (!user) return res.status(400).send({ message: 'The user not found' });

    if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
        const token = jwt.sign(
            {
                userId: user.id,
                isAdmin: user.isAdmin,
            },
            secret,
            { expiresIn: '1d' }
        );
        res.status(200).send({ user: user.email, token: token });
    } else {
        res.status(400).json({ message: 'Password is wrong!' });
    }
};

const registerUser = async (req, res) => {
    let user = new User({
        name: req.body.name,
        email: req.body.email,
        passwordHash: bcrypt.hashSync(req.body.password, 10),
        phone: req.body.phone,
        isAdmin: req.body.isAdmin,
        street: req.body.street,
        apartment: req.body.apartment,
        zip: req.body.zip,
        city: req.body.city,
        country: req.body.country,
    });
    user = await user.save();
    if (!user) return res.status(400).send('The user cannot be created!');
    res.send(user);
};

const deleteUser = (req, res) => {
    User.findByIdAndRemove(req.params.id)
        .then((user) => {
            if (user) {
                return res.status(200).json({ success: true, message: 'The user is deleted!' });
            } else {
                return res.status(404).json({ success: false, message: 'User not found!' });
            }
        })
        .catch((err) => {
            return res.status(500).json({ success: false, error: err });
        });
};

const getUserCount = async (req, res) => {
    const userCount = await User.countDocuments();
    if (!userCount) return res.status(500).json({ success: false });
    res.send({ userCount: userCount });
};

module.exports = {
    getUsers,
    getUserById,
    createUser,
    updateUser,
    loginUser,
    registerUser,
    deleteUser,
    getUserCount
};
