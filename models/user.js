const mongoose= require('mongoose')
const bcrypt = require('bcrypt');

//Define the user schema
const userSchema =new mongoose.Schema({
    name:{
        type: String,
        required:true,
    },
    age:{
        type: Number,
        required: true
    },
    mobile:
    {
        type: Number
    },
    email:
    {
        type: String,
    },
    address:
    {
        type: String,
        required: true
    },
    aadharCardNumber: {
        type: Number,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role:{
        type: String,
        enum: ['voter', 'admin'],
        default: 'voter'
    },
    isVoted:{
        type: Boolean,
        default: false
    }
});

userSchema.pre('save', async function(next)
{
    const user = this;

    //Hash the password only if it has been modified( or is new)
    if(!user.isModified('password'))
    {
        return next();
    }
    try
    {
        //hash password generate
        const salt = await bcrypt.genSalt(10); //hash password generation and 10 is ideal number for hashing
        const hashedPassword = await bcrypt.hash(user.password, salt);
        //Override the plain password with hashed one
        user.password = hashedPassword;
        next();
    }
    catch(err)
    {
        return next(err);

    }
})

userSchema.methods.comparePassword = async function(candidatePassword)
{
    try
    {
        const isMatch = await bcrypt.compare(candidatePassword, this.password);
        return isMatch;
    }
    catch(err)
    {
        throw err;
    }
}


//Create User model
const User =mongoose.model('User', userSchema);
module.exports =User;