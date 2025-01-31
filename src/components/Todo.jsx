import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { format } from 'date-fns';

const Todo = () => {
  const [columns, setColumns] = useState({
    pending: {
      id: 'pending',
      title: 'Pending',
      items: []
    },
    process: {
      id: 'process',
      title: 'In Process',
      items: []
    },
    complete: {
      id: 'complete',
      title: 'Complete',
      items: []
    }
  });

  const [input, setInput] = useState('');
  const [editingTask, setEditingTask] = useState({ id: null, content: '' });

  const onDragEnd = (result) => {
    if (!result.destination) return;

    const { source, destination } = result;
    const newColumns = JSON.parse(JSON.stringify(columns));
    
    const sourceColumn = newColumns[source.droppableId];
    const destColumn = newColumns[destination.droppableId];
    const [removed] = sourceColumn.items.splice(source.index, 1);

    destColumn.items.splice(destination.index, 0, removed);
    setColumns(newColumns);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    
    const newItem = {
      id: Date.now().toString(),
      content: input,
      createdAt: new Date(),
      isEditing: false
    };

    setColumns(prev => ({
      ...prev,
      pending: {
        ...prev.pending,
        items: [newItem, ...prev.pending.items]
      }
    }));
    
    setInput('');
  };

  const handleDelete = (columnId, taskId) => {
    setColumns(prev => ({
      ...prev,
      [columnId]: {
        ...prev[columnId],
        items: prev[columnId].items.filter(item => item.id !== taskId)
      }
    }));
  };

  const startEditing = (task) => {
    setEditingTask({ id: task.id, content: task.content });
  };

  const saveEdit = (columnId, taskId) => {
    setColumns(prev => ({
      ...prev,
      [columnId]: {
        ...prev[columnId],
        items: prev[columnId].items.map(item => 
          item.id === taskId 
            ? { ...item, content: editingTask.content, createdAt: item.createdAt } 
            : item
        )
      }
    }));
    setEditingTask({ id: null, content: '' });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold text-center mb-8 text-blue-600">Kanban Todo App</h1>
      
      <form onSubmit={handleSubmit} className="mb-8 max-w-md mx-auto flex">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Add new task"
          className="flex-1 p-2 border rounded-l-lg focus:outline-none focus:ring-1 focus:ring-black"
        />
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600 transition-colors cursor-pointer active:scale-95"
        >
          Add Task
        </button>
      </form>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="flex flex-wrap gap-4 justify-center">
          {Object.values(columns).map((column) => (
            <div
              key={column.id}
              className="bg-white rounded-lg shadow-md p-4 w-full md:w-96"
            >
              <h2 className="text-xl font-semibold mb-4 text-gray-700">
                {column.title} ({column.items.length})
              </h2>
              <Droppable droppableId={column.id}>
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="min-h-[200px]"
                  >
                    {column.items.map((item, index) => (
                      <Draggable key={item.id} draggableId={item.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`bg-gray-50 p-3 mb-2 rounded-lg transition-colors cursor-move ${
                              snapshot.isDragging 
                                ? 'bg-blue-100 shadow-lg transform scale-105'
                                : 'hover:bg-gray-100'
                            }`}
                            style={provided.draggableProps.style}
                          >
                            <div className="flex justify-between items-start">
                              {editingTask.id === item.id ? (
                                <input
                                  type="text"
                                  value={editingTask.content}
                                  onChange={(e) => setEditingTask({
                                    ...editingTask,
                                    content: e.target.value
                                  })}
                                  className="flex-1 mr-2 p-1 border rounded"
                                />
                              ) : (
                                <div>
                                  <p className="font-medium">{item.content}</p>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {format(new Date(item.createdAt), 'MMM dd, yyyy HH:mm')}
                                  </p>
                                </div>
                              )}
                              
                              <div className="flex space-x-2 ml-2">
                                {editingTask.id === item.id ? (
                                  <button
                                    onClick={() => saveEdit(column.id, item.id)}
                                    className="text-green-600 hover:text-green-700 text-sm"
                                  >
                                    Save
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => startEditing(item)}
                                    className="text-blue-600 hover:text-blue-700 text-sm cursor-pointer"
                                  >
                                    Edit
                                  </button>
                                )}
                                <button
                                  onClick={() => handleDelete(column.id, item.id)}
                                  className="text-red-600 hover:text-red-700 text-sm cursor-pointer"
                                >
                                  Delete
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default Todo;