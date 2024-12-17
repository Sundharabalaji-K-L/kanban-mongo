import React, { useEffect, useState, useCallback } from "react";
import {
  Container,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Box
} from "@material-ui/core";
import { DragDropContext, DropResult } from "react-beautiful-dnd";
import { Task, User } from "../models/models";
import TodoList from "./TodoList";
import axios from "axios";
import { makeStyles } from '@material-ui/core/styles';
import AddUserModal from "./AddUserModal";
import { AiOutlineUserAdd } from "react-icons/ai";

const useStyles = makeStyles((theme) => ({
  filterContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
  },
  filterSelect: {
    minWidth: 120,
  },
  listContainer: {
     marginTop: theme.spacing(2)
  },
  addUserButton:{
    marginLeft: theme.spacing(2),
  display: 'flex',
  alignItems: 'center',
    padding: theme.spacing(1, 2),
    backgroundColor: '#000',
    color: '#fff',
    borderRadius: theme.spacing(1),
    cursor: 'pointer',
  },
  addUserButtonText:{
     marginLeft: theme.spacing(1)
  }

}));

const AdminKanban: React.FC = () => {
  const classes = useStyles();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [doing, setDoing] = useState<Task[]>([]);
  const [complete, setComplete] = useState<Task[]>([]);
  const [filter, setFilter] = useState<string>('All');
  const [ownersMenu, setOwnersMenu] = useState<string[]>([]);
   const [ownerList, setOwnerList] = useState<string[]>([]);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);

   const updateOwners = useCallback((newTasks: Task[] | Task) => {
    const tasksToAdd = Array.isArray(newTasks) ? newTasks : [newTasks];
    
    const _owners = [
      ...tasks.map(task => task.owner),
      ...doing.map(task => task.owner),
      ...complete.map(task => task.owner),
      ...tasksToAdd.map(task => task.owner)
    ];

    const uniqueOwners = Array.from(new Set(_owners)).sort();
    setOwnersMenu(uniqueOwners);
  }, [tasks, doing, complete]);

  useEffect(() => {
    let isMounted = true;
    axios.get('http://localhost:5555/')
      .then((response) => {
        if (isMounted) {
          const todoTasks = response.data.data.filter((task: Task) => task.status === 'todo');
          const doingTasks = response.data.data.filter((task: Task) => task.status === 'doing');
          const completeTasks = response.data.data.filter((task: Task) => task.status === 'complete');
          
          setTasks(todoTasks);
          setDoing(doingTasks);
          setComplete(completeTasks);

           updateOwners([...todoTasks, ...doingTasks, ...completeTasks]);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [updateOwners]);

 useEffect(()=>{
    axios.get('http://localhost:5555/users')
    .then((response)=>{
      const _owners = response.data.data.map((rec: User)=>rec.name);
      setOwnerList(_owners);
    })

  }, [])
  const onDragEnd = useCallback(async (result: DropResult) => {
    const { source, destination } = result;

    if (!destination) return;

    const sourceList =
      source.droppableId === 'todo' ? tasks :
      source.droppableId === 'doing' ? doing : complete;

    const destList =
      destination.droppableId === 'todo' ? tasks :
      destination.droppableId === 'doing' ? doing : complete;

    const setSourceList =
      source.droppableId === 'todo' ? setTasks :
      source.droppableId === 'doing' ? setDoing : setComplete;

    const setDestList =
      destination.droppableId === 'todo' ? setTasks :
      destination.droppableId === 'doing' ? setDoing : setComplete;

    const newSourceList = [...sourceList];
    const [removed] = newSourceList.splice(source.index, 1);

    const newStatus = destination.droppableId as Task['status'];
    const updatedTask = { ...removed, status: newStatus };

    try {
      const response = await axios.put(
        `http://localhost:5555/update/${updatedTask._id}`, 
        updatedTask
      );

      const newDestList = [...destList];
      newDestList.splice(destination.index, 0, updatedTask);

      setSourceList(newSourceList);
      setDestList(newDestList);
       updateOwners([...newSourceList, ...newDestList]);
    } catch (error) {
      console.error('Error updating task status:', error);
      setSourceList(sourceList);
    }
  }, [tasks, doing, complete, updateOwners]);

  const filterTodos = useCallback((todoList: Task[]) => {
    return filter === 'All' 
      ? todoList 
      : todoList.filter(todo => todo.owner === filter);
  }, [filter]);

  const handleAddUserModalOpen = useCallback(() => {
    setIsAddUserModalOpen(true);
  }, []);

  const handleAddUserModalClose = useCallback(() => {
    setIsAddUserModalOpen(false);
  }, []);

   const updateUserList = useCallback((newUser:User)=>{
      setOwnerList(prev => [...prev, newUser.name]);
  }, [setOwnerList])


  const owners: string[] = ['All', ...ownersMenu];

  return (
    <Container>
      <Box className={classes.filterContainer}>
          <FormControl variant="outlined" className={classes.filterSelect}>
            <InputLabel htmlFor="owner-filter">Filter By Owner</InputLabel>
            <Select
              value={filter}
              onChange={(e) => setFilter(e.target.value as string)}
              inputProps={{
                name: 'owner',
                id: 'owner-filter',
              }}
              label="Filter By Owner"
            >
              {owners.map(owner => (
                <MenuItem key={owner} value={owner}>
                  {owner}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        <Button onClick={handleAddUserModalOpen} className={classes.addUserButton}>
           <AiOutlineUserAdd/>
            <span className={classes.addUserButtonText}>
              Add User
            </span>
        </Button>
      </Box>

      <DragDropContext onDragEnd={onDragEnd}>
        <Grid container spacing={3} className={classes.listContainer}>
          <TodoList
            tasks={filterTodos(tasks)}
            setTasks={setTasks}
            droppableId="todo"
            owners={ownerList}
            title="Todo"
             updateOwners={updateOwners}
            showAddButton={true}
          />
          <TodoList
            tasks={filterTodos(doing)}
            setTasks={setDoing}
            droppableId="doing"
            owners={ownerList}
            title="Doing"
              updateOwners={updateOwners}
             showAddButton={false}
          />
          <TodoList
            tasks={filterTodos(complete)}
            setTasks={setComplete}
            droppableId="complete"
            owners={ownerList}
            title="Complete"
              updateOwners={updateOwners}
             showAddButton={false}
          />
        </Grid>
      </DragDropContext>
        {isAddUserModalOpen && (
          <AddUserModal
            handleClose={handleAddUserModalClose}
            updateUsers={updateUserList}
          />
        )}
    </Container>
  );
};

export default React.memo(AdminKanban);