const User = require('../models/User');
const {validationResult} = require('express-validator/check')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')

exports.signup = (req, res, next) => {
	const errors = validationResult(req);
	if (!errors.isEmpty()) {
		const error = new Error('Validation Failed')
		error.statuscode = 422;
		error.data = errors.array();
		throw error
	}
	const email = req.body.email;
	const name = req.body.name;
	const password = req.body.password;

	bcrypt.hash(password, 12)
		.then((hashedPassword) => {
			const user = new User({
				email: email,
				password: hashedPassword,
				name: name
			})
			return user.save()
		})
		.then((response) => {
			res.status(201).json({message: 'User created!', userId: response._id})
		})
		.catch((error) => {
			if (!error.statuscode) {
				error.statuscode = 500
			}
			next(error)
		})
}


exports.login = (req,res,next) => {

	const email = req.body.email
	const password = req.body.password
	let loadedUser;

	User.findOne({email: email})
		.then((user)=>{
			if(!user){
				const error = new Error('A user with this email could not be found')
				error.statuscode = 401;
				throw error
			}
			loadedUser = user
			return bcrypt.compare(password, user.password);


		})
		.then((isEqual)=>{

			if(!isEqual){

				const error = new Error('Wrong password')
				error.statuscode = 401;
				throw error
			}

			const token = jwt.sign({
				email: loadedUser.email, 
				userId: loadedUser._id.toString()	
			}, 'somesupersecret',{ expiresIn: '1h' })

			res.status(200).json({token: token, userId: loadedUser._id.toString()})


		})
		.catch((error)=>{
			if(!error.statuscode){
				error.statuscode = 500
			}
			next(error)
		})

}

