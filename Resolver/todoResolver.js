const { PubSub }= require ('graphql-subscriptions');
const pubsub = new PubSub();

const Todo = require("../models/todoModel");

const TODO_ADDED = 'TODO_ADDED';

const resolver = {
    Subscription:{
        notifyUsers: {
            subscribe: () => pubsub.asyncIterator([TODO_ADDED])
        }
    },
  todos: () => {
    return Todo.find()
      .then((todos) => {
        return todos.map((todo) => {
          return { ...todo._doc, _id: todo.id };
        });
      })
      .catch((err) => {
        throw err;
      });
  },
  todo(args) {
    return Todo.findById(args.todoId)
      .then((todo) => {
        return { ...todo._doc, _id: todo.id };
      })
      .catch((err) => {
        throw err;
      });
  },
  createtodo: (args) => {
    const todo = new Todo({
      Todoitem: args.todoItem,
      complete: false
    });
    return todo
      .save()
      .then((result) => {
        var Message = { message: 'New todo has been added', todo: todo};
        pubsub.publish(TODO_ADDED, { notifyUsers: Message });
        return Todo.find()
            .then((todos) => {
                return todos.map((todo) => {
                    return { ...todo._doc, _id: todo.id };
                });
            }).catch((err) => {
                throw err;
            });
      })
      .catch((err) => {
        throw err;
      });
  },
  updatetodo: (args) => {
    return Todo.find({})
        .then((todos) => {
            const todo = todos.find((todo) => todo.id === args.todoid);
            todo.complete = !todo.complete;
            todo.save();
            return todos.map((todo) => {
                return { ...todo._doc, _id: todo.id };
            });
        })
        
  },
  deletetodo: (args) => {
    return Todo.find({})
        .then((todos) => {
            const todo = todos.find((todo) => todo.id === args.todoid);
            todos.splice(todos.indexOf(todo), 1);
            todo.delete()
            return todos.map((todo) => {
                return { ...todo._doc, _id: todo.id };
            });
        }).catch((err) => {
            throw err;
        });
  },
};

module.exports = resolver;