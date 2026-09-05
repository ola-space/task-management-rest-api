const express = require('express');
const swaggerUi = require('swagger-ui-express');
const openapiDocument = require('./openapi.json');
const Database = require('better-sqlite3');

const db = new Database('tasks.db');


db.exec(`
    CREATE TABLE IF NOT EXISTS tasks (
        id INTEGER PRIMARY KEY,
        title TEXT NOT NULL,
        done INTEGER NOT NULL DEFAULT 0
    )
`);

const result = db.prepare('SELECT COUNT(*) AS count FROM tasks').get();

if (result.count === 0) {
    const insert = db.prepare(`
        INSERT INTO tasks (title, done)
        VALUES (?, ?)
    `);

    insert.run('Learn JavaScript', 0);
    insert.run('Build CRUD API', 0);
    insert.run('Create SQLite database', 0);
}



const app = express();
const port = 3000;

app.use(express.json());

app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiDocument));

// Our in-memory task list
const tasks = [
  {
    id: 1,
    title: "Learn Express",
    done: false
  },
  {
    id: 2,
    title: "Learn Git",
    done: true
  },
  {
    id: 3,
    title: "Build Task API",
    done: false
  }
];


app.get('/', (req, res) => {
  res.json({
    name: "Task API",
    version: "1.0",
    endpoints: ["/tasks"]
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: "ok"
  });
});

app.get('/tasks', (req, res) => {
  res.json(tasks);
});

app.post('/tasks', (req, res) => {
  const { title } = req.body;

  if (!title) {
    return res.status(400).json({
      error: "Title is required"
    });
  }

  const id = tasks[tasks.length - 1].id + 1;


  const task = {
    id,
    title,
    done: false
  };

  tasks.push(task);

  return res.status(201).json(task);

});


app.put('/tasks/:id', (req, res) => {

  const id = Number(req.params.id);

  const task = tasks.find(task => task.id === id);

  if (!task) {
    return res.status(404).json({
      error: `Task ${id} not found`
    });
  }

  const { title, done } = req.body;

  if (!title) {
    return res.status(400).json({
      error: "Title is required"
    });
  }  

  task.title = title;
  task.done = done;

  res.json(task);


});

app.delete('/tasks/:id', (req, res) => {

  const id = Number(req.params.id);

  const index = tasks.findIndex(task => task.id === id);

  if (index === -1) {
    return res.status(404).json({
      error: `Task ${id} not found`
    });
  }

  tasks.splice(index, 1);

  res.status(204).send();

});


app.get('/tasks/:id', (req, res) => {
  const id = Number(req.params.id);
  const task = tasks.find(task => task.id === id);

  if (!task) {
    return res.status(404).json({
      error: `Task ${id} not found`
    });
  }

return res.json(task);

});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
