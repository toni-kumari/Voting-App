const express = require('express');
const router = express.Router();
const User =require('./../models/user');
const {jwtAuthMiddleware} = require('./../jwt');
const Candidate = require('./../models/candidate');

const checkAdminRole = async (userID) => {
    try {
        const user = await User.findById(userID);
        if (user) {
            console.log(`User found: ${user.name}, Role: ${user.role}`);
            if (user.role === 'admin') {
                return true;
            }
        } else {
            console.log(`No user found with ID: ${userID}`);
        }
    } catch (err) {
        console.log(`Error fetching user: ${err}`);
        return false;
    }
    return false;
};

 
//POST route to add a Candidate
router.post('/', jwtAuthMiddleware,async(req, res)=>{
    try
    {
        if(! (await checkAdminRole(req.user.id)))
        {
            
            return res.status(403).json({message: 'user does not have admin role'})
        }
        const data= req.body // Assuming the request body contains the Candidate data
 
     //Create a new Persondocument using the Mongoose model
        const newCandidate =new Candidate(data);
 
     //Save the new person to the database
        const response = await newCandidate.save();
     
        console.log('data saved');
        res.status(200).json({response: response});
    }
    catch(err)
    {
         console.log(err);
         res.status(500).json({error: 'Internal server error'})
    }
}) 



//UPDATE
router.put('/:candidateID',jwtAuthMiddleware, async (req, res) =>
{
    
    try
    {
        if(!checkAdminRole(req.user.id))
        {
            return res.status(403).json({message: 'user does  not  have admin role'})
        }

        const candidateID = req.params.candidateID; // Extract the id from the URL parameter 
        const updatedCandidateData = req.body; // Updated data for the person 
        const response = await Person.findByIdAndUpdate (candidateID, updatedCandidateData,  
        {
            new: true, // Return the updated document 
            runValidators: true, // Run Mongoose validation 
        })

        if(!response) 
        {
            return res.status(404).json({ error: 'Candidate not found' }); 
        }

        console.log('Candidate data updated'); 
        res.status(200).json(response);
    }
     
        
    catch(err) 
    {  
        console.log(err);
        res.status(500).json({error: 'Internal Server Error'});
    } 
})

//DELETE
router.delete('/:candidateID',jwtAuthMiddleware, async (req, res) =>
    {
        
        try
        {
            if(!checkAdminRole(req.user.id))
            {
                return res.status(403).json({message: 'user does not have admin role'})
            }
    
            const candidateID = req.params.candidateID; // Extract the id from the URL parameter 
            
            const response = await Person.findByIdAndDelete (candidateID);
    
            if(!response) 
            {
                return res.status(404).json({ error: 'Candidate not found' }); 
            }
    
            console.log('Candidate deleted'); 
            res.status(200).json(response);
        }
        catch(err) 
        {  
            console.log(err);
            res.status(500).json({error: 'Internal Server Error'});
        } 
    })


//let's start voting
router.post('/vote/:candidateID', jwtAuthMiddleware, async (req, res)=>{
    //No admin can vote
    //only user can vote once
    const candidateID = req.params.candidateID;
    const userId = req.user.id;

    try{
        //find the Candidate document with the specified candidateID
        const candidate = await Candidate.findById(candidateID);
        if(!candidate)
        {
            return res.status(404).json({message: 'Candidate not found'});
        }
        const user = await User.findById(userId);
        if(!user)
        {
            return res.status(404).json("message: user not found");
        }
        if(user.isVoted === true)
        {
            return res.status(400).json({message: 'You have already voted'});
        }
        if(user.role == 'admin' )
        {
            return res.status(403).json({message: 'Admin is not allowed'});
        }
        //Update the Candidate document to record the vote
        candidate.votes.push({user: userId})
        candidate.voteCount++;
        await candidate.save();

        

        //Update the user document
        user.isVoted = true
        await user.save();
        res.status(200).json({message: 'Vote recorded successfully'});

    }catch(err)
    {
        console.log(err);
         res.status(500).json({error: 'Internal server error'})
    }
});

//Vote count
router.get('/vote/count', async(req, res)=>
{
    try{
        const candidate= await Candidate.find().sort({voteCount: 'desc'});
        
        //Map the candidate to only return their name and voteCount
        const voteRecord = candidate.map((data)=>
        {
            return{
                party: data.party,
                count: data.voteCount
            }
        });
        return res.status(200).json(voteRecord);

    }
    catch(err)
    {
        console.log(err);
        res.status(500).json({error: 'Internal server error'})
    }
})
//list of candidate
router.get('/', async(req, res)=>
{
    try{
        
        const candidates = await Candidate.find();
        res.status(200).json(candidates)

    }
    catch(err)
    {
        console.log(err);
        res.status(500).json({error: 'Internal server error'}) 
    }
})

module.exports = router;
    
