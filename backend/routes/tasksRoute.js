import express, { response } from 'express';
import {Task} from '../models/taskModel.js';
import {User} from '../models/userModel.js';

const taskRouter = express.Router();


taskRouter.get('/', async(request, response)=>{
    try{
        const tasks = await Task.find({});
        return response.status(200).json(
            {
                count: tasks.length,
                data: tasks
            }
        );
    }

    catch(error){
        response.status(500).send({message: error.message});
    }
})

taskRouter.post('/create', async(request, response)=>{
    try{
        if(!request.body.todo || !request.body.description ||
            !request.body.owner
        ){
            return response.status(404).send({message: 'Required all fields'})
        }

        const newTask = {
            todo: request.body.todo,
            description: request.body.description,
            owner: request.body.owner,
            status: 'todo'
        }

        const task = await Task.create(newTask);
        return response.status(201).send(task);
    }
    catch(error){
        response.status(500).send({message: error.message});
    }
})

taskRouter.put('/update/:id', async(request, response)=>{
    try{
        if(!request.body.todo || !request.body.description||
            !request.body.owner
        ){
            response.status(404).send({message: 'required all field'});
        }

        const {id} = request.params;
        const result = await Task.findByIdAndUpdate(id, request.body);

        if(!result){
            return response.status(404).send({message: "task not Found"})
        }

        return response.status(200).send({message: 'Task has been updated'})
    }

    catch(error){
        return response.status(500).send({message: error.message});
    }
})

taskRouter.delete('/delete/:id', async(request, response)=>{
    try{
        const {id} = request.params;
        const result = await Task.findByIdAndDelete(id);

        if(!result){
            return response.status(404).send({message: 'task not found'})
        }
        return response.status(200).send({message: 'task has been deleted'})
    }
    catch(error){
        return response.status(500).send({message: error.message});
    }
})


taskRouter.get('/users', async(request, response)=>{
    try{
        const users = await User.find({}).sort({name: 1});
        return response.status(200).json({
            count: users.length,
            data: users
        });
    }
    catch(error){
        return response.status(500).send({message: error.message})
    }
})


taskRouter.post('/user/create', async(request, response)=>{
    try{
        if(!request.body.name){
            return response.status(404).send('required name field')
        }

        const newUser = {
            name: request.body.name
        };

        const name = await User.create(newUser);
        return response.status(201).send(name);
    }
    catch(error){
        return response.status(500).send({message: error.message});
    }
})

taskRouter.delete('/user/delete/:id', async(request, response)=>{
    try{
        const {id} = request.params;
        const result = await User.findByIdAndDelete(id);

        if(!result){
            return response.status(404).send({message: 'user not found'})
        }
        return response.status(200).send({message: 'user has been deleted'})
    }
    catch(error){
        return response.status(500).send({message: error.message});
    }
})

taskRouter.put('/user/update/:id', async(request, response)=>{
    try{
        if(!request.body.name){
            response.status(404).send({message: 'required all field'});
        }

        const {id} = request.params;
        const result = await User.findByIdAndUpdate(id, request.body);

        if(!result){
            return response.status(404).send({message: "user not Found"})
        }

        return response.status(200).send({message: 'user has been updated'})
    }

    catch(error){
        return response.status(500).send({message: error.message});
    }
})


export default taskRouter;

