import React, {
    useEffect,
    useState,
    useCallback,
    Dispatch,
    SetStateAction
} from "react";
import {
    Container,
    Grid,
    Select,
    MenuItem,
    FormControl,
    InputLabel
} from "@material-ui/core";
import { DragDropContext, DropResult } from "react-beautiful-dnd";
import { Task, User } from "../models/models";
import TodoList from "./TodoList";
import axios from "axios";
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles((theme) => ({
    filterContainer: {
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
        marginBottom: theme.spacing(2),
    },
    filterSelect: {
        minWidth: 120,
    },
    listContainer: {
        marginTop: theme.spacing(2)
    }
}));

const KanbanBoard: React.FC = () => {
    const classes = useStyles();
    const [tasks, setTasks] = useState<Task[]>([]);
    const [doing, setDoing] = useState<Task[]>([]);
    const [complete, setComplete] = useState<Task[]>([]);
    const [filter, setFilter] = useState<string>('All');
    const [ownersMenu, setOwnersMenu] = useState<string[]>([]);
    const [ownerList, setOwnerList] = useState<string[]>([]);
    const [users, setUsers] = useState<User[]>([]); // Add users state

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
        const fetchData = async () => {
            try {
                const response = await axios.get('http://localhost:5555/');
                if (isMounted) {
                    const todoTasks = response.data.data.filter((task: Task) => task.status === 'todo');
                    const doingTasks = response.data.data.filter((task: Task) => task.status === 'doing');
                    const completeTasks = response.data.data.filter((task: Task) => task.status === 'complete');

                    setTasks(todoTasks);
                    setDoing(doingTasks);
                    setComplete(completeTasks);

                    updateOwners([...todoTasks, ...doingTasks, ...completeTasks]);
                }
            } catch (error) {
                console.log(error)
            }
        };
        fetchData()
        return () => {
            isMounted = false;
        };
    }, [updateOwners]);


    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await axios.get('http://localhost:5555/users');
                const fetchedUsers = response.data.data;
                const _owners = fetchedUsers.map((rec: User) => rec.name);
                setOwnerList(_owners);
                setUsers(fetchedUsers) //Set users state
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        };
        fetchUsers()
    }, []);


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
        if (filter === 'All') {
            return todoList;
        }

        const user = users.find(user => user._id === filter);

        return todoList.filter(todo => todo.owner === (user ? user._id : filter));
    }, [filter, users]);

    const getOwnerName = useCallback((ownerId: string | null) => {
        if (!ownerId) return "Unassigned";
        const user = users.find(user => user._id === ownerId)
        return user ? user.name : "Unassigned";
    }, [users]);

    const getAssignedUsers = useCallback(() => {
        const allTasks = [...tasks, ...doing, ...complete];
        const assignedUserIds = new Set(allTasks.map(task => task.owner).filter(owner => owner != null));
        return users.filter(user => assignedUserIds.has(user._id));
    }, [tasks, doing, complete, users]);


    const assignedUsers = getAssignedUsers();



    return (
        <Container>
            <div className={classes.filterContainer}>
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
                        <MenuItem key="All" value="All">All</MenuItem>
                        {assignedUsers.map(user => (
                            <MenuItem key={user._id} value={user._id}>
                                {user.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </div>

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
                        users={users}
                    />
                    <TodoList
                        tasks={filterTodos(doing)}
                        setTasks={setDoing}
                        droppableId="doing"
                        owners={ownerList}
                        title="Doing"
                        updateOwners={updateOwners}
                        showAddButton={false}
                        users={users}
                    />
                    <TodoList
                        tasks={filterTodos(complete)}
                        setTasks={setComplete}
                        droppableId="complete"
                        owners={ownerList}
                        title="Complete"
                        updateOwners={updateOwners}
                        showAddButton={false}
                        users={users}
                    />
                </Grid>
            </DragDropContext>
        </Container>
    );
};

export default React.memo(KanbanBoard);