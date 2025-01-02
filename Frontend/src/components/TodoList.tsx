import React, { memo, useState, useCallback } from "react";
import {
    Grid,
    Paper,
    Typography,
    Button,
    makeStyles
} from "@material-ui/core";
import { Droppable } from "react-beautiful-dnd";
import { Task, User } from "../models/models";
import SingleTodo from "./SingleTodo";
import { AiOutlinePlus } from "react-icons/ai";
import InputField from "./InputField";

interface TodoListProps {
    tasks: Array<Task>;
    setTasks: React.Dispatch<React.SetStateAction<Array<Task>>>;
    owners: Array<string>;
    droppableId: string;
    title: string;
    updateOwners: (tasks: Task[]) => void;
    showAddButton?: boolean; // Optional prop to control Add Task Button
    users: Array<User>;
}

const useStyles = makeStyles((theme) => ({
    listContainer: {
        padding: theme.spacing(2),
        borderRadius: theme.spacing(1),
        height: 578,
        display: "flex",
        flexDirection: "column",
        border: "1px solid #ddd",
        boxShadow: `5px 5px 10px #D1D9E6, -5px -5px 10px #fff`,
        backgroundColor: '#f0f2f5',
        transition: 'all 0.3s ease',
        position: 'relative',
    },
    listHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: theme.spacing(1),
        padding: "14px",
        borderRadius: "31px",
        color: "#fff",
        '&.todo': {
            background: '#ff9800',
        },
        '&.doing': {
            background: '#2196f3',
        },
        '&.complete': {
            background: '#4caf50',
        },
    },
    taskList: {
        flexGrow: 1,
        overflowY: "auto",
        padding: theme.spacing(0, 1),
        transition: 'all 0.3s ease',
        height: 'calc(100% - 50px)', // Reduced height to leave space for the button
        '&::-webkit-scrollbar': {
            width: '6px',
        },
        '&::-webkit-scrollbar-track': {
            background: '#f1f1f1',
            borderRadius: '3px',
        },
        '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#888',
            borderRadius: '3px',
        },
        '&::-webkit-scrollbar-thumb:hover': {
            background: '#555',
        },
    },
    taskCount: {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: theme.spacing(1),
        fontWeight: "bold",
        backgroundColor: 'rgba(255,255,255, 0.3)',
        borderRadius: '50%',
        minWidth: 24,
        minHeight: 24,
        padding: theme.spacing(0.5),
    },
    addTaskButton: {
        position: 'absolute',
        bottom: theme.spacing(2),
        left: '50%',
        transform: 'translateX(-50%)',
        marginBottom: theme.spacing(1),
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing(1, 2),
        backgroundColor: '#000',
        color: '#fff',
        borderRadius: theme.spacing(1),
        cursor: 'pointer',
        transition: 'none',
        "&:hover": {
            backgroundColor: '#000',
        },
    },
    addTaskButtonText: {
        marginLeft: theme.spacing(0.5),
    },
}));

const TodoList: React.FC<TodoListProps> = memo(
    ({ tasks, setTasks, owners, droppableId, title, updateOwners, showAddButton = true, users }) => {
        const classes = useStyles();
        const [isDialogOpen, setIsDialogOpen] = useState(false);
        const headerClass = `${classes.listHeader} ${droppableId}`;

        const handleDialogToggle = useCallback(() => {
            setIsDialogOpen((prev) => !prev);
        }, []);

        return (
            <Grid item xs={12} md={4}>
                <Paper className={classes.listContainer}>
                    <div className={headerClass}>
                        <Typography variant="h6">{title}</Typography>
                        <Typography variant="subtitle2" className={classes.taskCount}>
                            {tasks.length}
                        </Typography>
                    </div>
                    <Droppable droppableId={droppableId}>
                        {(provided, snapshot) => (
                            <div
                                ref={provided.innerRef}
                                {...provided.droppableProps}
                                className={classes.taskList}
                                style={{
                                    background: snapshot.isDraggingOver ? "lightblue" : "transparent",
                                }}
                            >
                                {tasks.map((task, index) => (
                                    <SingleTodo
                                        index={index}
                                        todos={tasks}
                                        owners={owners}
                                        todo={task}
                                        key={task._id}
                                        setTodos={setTasks}
                                        users={users}
                                    />
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                    {showAddButton && droppableId === "todo" && (
                        <Button onClick={handleDialogToggle} className={classes.addTaskButton}>
                            <AiOutlinePlus style={{ fontSize: '1.2em' }} />
                            <Typography className={classes.addTaskButtonText}>
                                Add Task
                            </Typography>
                        </Button>
                    )}
                    {isDialogOpen && (
                        <InputField
                            setTodos={setTasks}
                            owners={owners}
                            updateOwners={updateOwners}
                            handleClose={handleDialogToggle}
                            users={users}
                        />
                    )}
                </Paper>
            </Grid>
        );
    }
);

export default TodoList;