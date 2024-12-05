const express = require('express');
const router = express.Router();
const User =require('./../models/user');
const {jwtAuthMiddleware, gerateToken} = require('./../jwt');

 
//POST route to add a user
router.post('/signup',async(req, res)=>{
    try
    {
     const data= req.body // Assuming the request body contains the user data
 
     //Create a new Persondocument using the Mongoose model
     const newUser =new User(data);
 
     //Save the new person to the database
     const response = await newUser.save();
     
     console.log('data saved');
     const payload = {
        id: response.id
     }
     console.log(JSON.stringify(payload));

     const token = gerateToken(payload);
     console.log("Token is : ", token);

     res.status(200).json({response: response, token: token});
    }
    catch(err)
    {
         console.log(err);
         res.status(500).json({error: 'Internal server error'})
    }
}) 
//Login route
router.post('/login', async(req, res) =>
{
    try
    {
        //extract aadharCardNumber and password from request body
        const {aadharCardNumber, password} = req.body;

        //find user by aadharCardNumber
        const user = await User.findOne({aadharCardNumber: aadharCardNumber});
        //if user does not exist or password does not match, return error
        if(!user || !(await user.comparePassword(password)))
        {
            return res.status(401).json({error: 'Invalid username or password'});
        }


        //Generate token
        const payload ={
            id: user.id,
            username: user.username
        }

        const token = gerateToken(payload);

        //return token as response
        res.json({token})
    }
    catch(err)
    {
        console.log(err);
        res.status(500).json({error: 'Internal server error'})
    }
})
//Profile route
router.get('/profile',  async(req, res) =>
{
    try
    {
        const userData = req.user;
        const userId = userData.id;
        const user = await Person.findById(userId);
        res.status(200).json({user})
    }
    catch(err)
    {
        res.status(500).json({error: 'Internal server error'})
    }
})

//UPDATE
router.put('/profile/password',jwtAuthMiddleware, async (req, res) =>
{
    try
    {
        const userId = req.params.id; // Extract the id from the URL parameter 
        const {currentPassword, newPassword} = req.body  //Extract current and new password from request body
        
        //find user by UserId
        const user = await User.findById(userId);

        //iF Password does not match, return error
        if(!(await user.comparePassword(currentPassword)))
        {
            return res.status(401).json({error: 'Invalid username or password'});
        }
        //Update the user's password
        user.password= newPassword;
        await user.save();


        console.log('password updated'); 
        res.status(200).json({message: "Password updated"});
    }
     
        
    catch(err) 
    {  
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    } 
})



module.exports = router;
    
