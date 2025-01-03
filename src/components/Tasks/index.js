import React, { useState, useRef, useEffect } from "react";
import { Container } from "./styles";

import TasksCounter from "./tasksCounter";
import TasksBox from "./tasksBox";

import themeLight from '../../assets/lightbulb.svg';
import themeDark from '../../assets/lightbulb-fill.svg';

import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

export default function Tasks({ onToggleTheme, selectedTheme }) {
  const savedTasks = JSON.parse(localStorage.getItem('tasks')) || [];
  const savedTotal = savedTasks.length;

  const [tasks, setTasks] = useState(savedTasks);
  const [total, setTotal] = useState(savedTotal);
  const [variavel, setVariavel] = useState(""); 
  const inputRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  const handleCreated = () => {
    if (!variavel.trim()){
      alert('Adicione uma tarefa no espaço vazio!')
      return
    } setTasks((prevState) => [
        ...prevState,
        {
          id: Math.random(),
          complete: 0,
          check: false,
          text: variavel,
          deleted: false,
        },
      ]),
      setTotal((prevState) => prevState + 1),
      setVariavel("") 

      if (inputRef.current) {
        inputRef.current.focus();
      }
  };

  const handleCheck = (taskId) => {
    setTasks((prevState) =>
      prevState.map((task) =>
        task.id === taskId ? { ...task, check: !task.check } : task
      )
    );
  };

  const handleSaveEdit = (taskId, newText) => {
    setTasks((prevState) =>
      prevState.map((task) =>
        task.id === taskId ? { ...task, text: newText } : task
      )
    );
  };

  const handleRemove = (taskId) => {
    setTasks((prevState) => {
      const newTasks = prevState.filter((task) => task.id !== taskId); // Remove a tarefa
      setTotal((prevState) => prevState - 1); // Atualiza o contador
      return newTasks;
    });
  };

  const handleComplete = (id) => {
    setTasks((prevState) =>
      prevState.map((task) =>
        task.id === id
          ? { ...task, complete: task.check ? task.complete + 1 : task.complete - 1, }
          : task
      )
    );
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const reorderedTasks = Array.from(tasks);
    const [movedTask] = reorderedTasks.splice(result.source.index, 1);
    reorderedTasks.splice(result.destination.index, 0, movedTask);

    setTasks(reorderedTasks);
  }

  return (
    <Container>
      <div className="search">
        <button onClick={onToggleTheme} className="theme">
          <img src={selectedTheme === 'dark' ? themeLight : themeDark}/>
        </button>
        <input
          type="text"
          placeholder="Adicione uma nova tarefa"
          onChange={event => setVariavel(event.target.value)}
          value={variavel}
          ref={inputRef}
        />
        <button onClick={handleCreated}>Submit</button>
      </div>

      <TasksCounter tasks={tasks} taskTotal={total} />

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="tasksList">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef}>
              {tasks.map((item, index) => (
                <Draggable
                  key={item.id}
                  draggableId={item.id.toString()}
                  index={index} >
                    
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={{
                        ...provided.draggableProps.style,
                        backgroundColor: 'transparent'
                      }}
                    >
                      <TasksBox
                        onCheck={handleCheck}
                        onRemove={handleRemove}
                        onComplete={handleComplete}
                        onEdit={handleSaveEdit}
                        tasks={{
                          id: item.id,
                          complete: item.complete,
                          check: item.check,
                          text: item.text,
                          delete: item.deleted,
                        }}
                      />
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </Container>
  );
}
