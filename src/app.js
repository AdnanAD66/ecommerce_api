const express = require('express');
const {connectDB} = require('./config/database');
const mongoose = require('mongoose');
const {User} = require('./model/user');
const Product = require('./model/product');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const validator = require('validator');
const {userMiddleware} = require('./middleware/user');
require('dotenv').config();

const app = express();

const Port = process.env.Port || 5000;

app.use(express.json());
app.use(cookieParser());



app.use('/signup', async (req, res) => {
    try {
        const {firstName, email, age, gender, password} = req.body;
        if (!firstName || !email || !password) {
            return res.status(400).send({message: 'Name, email, and password are required.'});
        }
        if (!validator.isEmail(email)) {
            return res.status(400).send({message: 'Invalid email format.'});
        }
        if (password.length < 8) {
            return res.status(400).send({message: 'Password must be at least 6 characters long.'});
        }
        const existingUser = await User.findOne({email});
        if (existingUser) {
            return res.status(400).send({message: 'Email already in use.'});
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({firstName, email, age, gender, password: hashedPassword});
        await user.save();
        res.status(201).send({message: 'User registered successfully'});
    } catch (error) {
        res.status(500).send({message: 'Server error', error: error.message});
    }
    
})


app.use('/login', async (req, res) => {
    try {
        const {email, password} = req.body;
        if (!email || !password) {
            return res.status(400).send({message: 'Email and password are required.'});
        }
        const user = await User.findOne({email});
        if (!user) {
            return res.status(400).send({message: 'Invalid email or password.'});
        }
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).send({message: 'Invalid email or password.'});
        }
        const token = jwt.sign({id: user._id}, 'Adnan$4321', {expiresIn: '1h'});
        res.cookie('token', token, {httpOnly: true}).send({message: 'Logged in successfully'});
    } catch (error) {
        res.status(500).send({message: 'Server error', error: error.message});
    }
})



app.use('/logout', (req, res) => {
    res.clearCookie('token').send({message: 'Logged out successfully'});
})




app.use('/profile', userMiddleware, (req, res) => {
    const token = req.cookies.token;
    res.send(req.user);
});





app.use('/addproducts', userMiddleware, async (req, res) => {
    if (req.method === 'POST') {
        // Create Product
        const {name, description, price} = req.body;
        if (!name || !description || !price) {
            return res.status(400).send({message: 'Name, description, and price are required.'});
        }
        const product = new Product({name, description, price, createdBy: req.user._id});
        await product.save();
        return res.status(201).send({message: 'Product created successfully', product});
    }
});

app.use('/getproducts', userMiddleware, async (req, res) => {
    if (req.method === 'GET') {
        // Get Products
        const products = await Product.find().populate('createdBy', 'firstName email');
        return res.send(products);
    }
});



app.use('/updateproduct/:id', userMiddleware, async (req, res) => {
    if (req.method === 'PUT') {
        // Update Product
        const {id} = req.params; // Yes, this is the product id to update
        const {name, description, price} = req.body;
        const product = await Product.findById(id).populate('createdBy');
        if (!product) {
            return res.status(404).send({message: 'Product not found.'});
        }
        // Only allow update if the logged-in user is the creator
        if (!product.createdBy || String(product.createdBy._id) !== String(req.user._id)) {
            return res.status(403).send({message: 'You can only update your own products.'});
        }
        product.name = name || product.name;
        product.description = description || product.description;
        product.price = price || product.price;
        await product.save();
        return res.send({message: 'Product updated successfully', product});
    }
});


app.use('/deleteproduct/:id', userMiddleware, async (req, res) => {
    if (req.method === 'DELETE') {
        // Delete Product
        const {id} = req.params;
        const product = await Product.findById(id).populate('createdBy');
        if (!product) {
            return res.status(404).send({message: 'Product not found.'});
        }
        if (!product.createdBy || product.createdBy._id.toString() !== req.user._id.toString()) {
            return res.status(403).send({message: 'You can only delete your own products.'});
        }
        await product.remove();
        return res.send({message: 'Product deleted successfully'});
    }
});





connectDB().then(() => {
    console.log('Database connected');
    app.listen(Port, () => {
        console.log(`Server is running on port ${Port}`);
    });
}).catch((error) => {
    console.error('Database connection error:', error);
});