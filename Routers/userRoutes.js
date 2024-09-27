const express = require('express');
const router = express.Router();

const User = require('../Models/user');
const Task = require('../Models/task');
const { jwtAuthMiddleware } = require('../jwt');

//API to create a new user - Signup API
router.post('/signup', async(req, res) =>{
    try {
      const data = req.body;//Assuming the request body conatains all the required user data

      //Create a new user document using mongoose model
      const newUser = new User(data);

      //Save the new user in the database
      const response = await newUser.save();
      console.log("data saved");

      //Generate token
      const payload = {
        id: response.id //ID is being sent as a payload
      };
      const token = generateJWT(payload); //Token generation

      //Token is sent to the user as a response
      res.status(200).json({response: response, token: token});
    } 
    catch (error) {
      console.log(error);
      res.status(500).json({error: "Internal server error"});
    }
});

//API to log in an existing user - Login API
router.post('/login', async(req, res)=>{
    try{
      //Extract email and password from request body
      const {email, password} = req.body;
      
      //Find the user by email given by the user
      const user = await User.findOne({email: email});
   
      //If user doesn't exist or password doesn't match 
      if(!user || !(await user.comparePassword(password))){
        return res.status(400).json({error: "Invalid email or password"});
      }

      //If user was found and password matches, then generate Token
      const payload = {
        id: user.id
      }
      const token = generateJWT(payload);

      //Return the token to the user as a response
      res.json({token: token});
    }
    catch(err){
      console.log(err);
      res.status(500).json({error: "Internal Server Error"});
    }
});

//API to create a new task
router.post('/createTask', async(req, res) =>{
    //Fetch all the data given by the user from the request body
    const data = req.body;
    
    //Create a new task document using mongoose model
    const newTask = new Task(data);

    //Save the new task in the database
    const response = await newTask.save();
    console.log("data saved");

});

//API to fetch all the tasks created by a specific user
router.get('/fetchTasks',jwtAuthMiddleware, async(req, res)=>{
    try{
        const userData = req.user;
        const userID = userData.id;

        //Find the tasks created by the person by his/her userID
        const tasks = await Task.findById(userID);

        //Send all the tasks of the user as a response
        res.status(200).json({tasks});
    }
    catch(err){
        console.log(err);
        res.status(500).json({error: "Internal server error"});
    }
});

//API to update a task information
router.put('/updateTask/:taskID', jwtAuthMiddleware, async(req, res)=>{
  try{
    const userData = req.user;
    const userID = userData.id;//Fetch the userID from the token

    const taskID = req.params.taskID;
    const task = await Task.findById(taskID);
    const userid = task.userID;

    if(!task){
        return res.status(404).json({message:"Task not found!!!"});
    }
    
    //Check whether the user is authorized to update this task or not
    if(userid != userID){
        return res.status(403).json({message: "Authorization denied"});
    }

    const updatedTaskData = req.body;//Fetch the updated task data from request body
    const response = await Task.findByIdAndUpdate(taskID, updatedTaskData,{
        new: true,
        runValidators: true
      });
    
    console.log("candidate data updated");
    res.status(200).json({response : "Data updated successfully"});
  }
  catch(err){
    console.log(err);
    res.status(500).json({error: "Internal server error"});
  }
});

//API to delete a task by task ID
router.delete('/deleteTask/:taskID', jwtAuthMiddleware, async(req, res)=>{
    try{
        const userData = req.user;
        const userID = userData.id;//Fetch the userID from the token

        const taskID = req.params.taskID;
        const task = await Task.findById(taskID);
        const userid = task.userID;

        if(!task){
            return res.status(404).json({message:"Task not found!!!"});
        }
        
        //Check whether the user is authorized to delete this task or not
        if(userid != userID){
            return res.status(403).json({message: "Authorization denied"});
        }
        
        const response = await Task.findByIdAndDelete(taskID);

        //Send response
        console.log("Candidate record deleted");
        res.status(200).json({message: "Candidate deleted successfully"});
    }
    catch(err){
        console.log(err);
        res.status(500).json({error: "Internal server error"});
    }
});

router.get('/getTask/:taskID', async(req, res)=>{
    try{
        const taskID = req.params.taskID;
        const task = await Task.findById(taskID);
        if(!task){
            return res.status(404).json({message: "Task not found!!!"});
        }

        res.status(200).json({task});
    }
    catch(err){
        console.log(err);
        res.status(500).json({error: "Internal server error"});
    }
});
