const http=require("http");

const express = require("express");

const app = express();

const bodyParser = require('body-parser');

const fs = require('fs');

const mysql = require('mysql2');


let connection = mysql.createConnection ({
   host: "mysql-gabriel-default03022025.l.aivencloud.com",
   user: "avnadmin",
   port: 12998, 
   password: "AVNS_rHp9_75veAmMTjeLXji",
   database: "defaultdb",
   ssl: {
   ca: fs. readFileSync(__dirname +
   '/ca.pem')
   }
});


app.use(bodyParser.json());

app.use(bodyParser.urlencoded({

   extended: true

}));

const path = require('path');

app.use(express.static(path.join(__dirname, 'public')));



app.post("/todo/add", async (req, res) => {
   const { inputValue } = req.body;
   console.log(inputValue)
   try {
     const result = await executeQuery("INSERT INTO todo (name) VALUES (?)", [inputValue]);
     res.json({ result: "Ok", todo: { id: result.insertId, inputValue, completed: false } });
   } catch (error) {
     res.status(500).json({ error: "Errore durante l'inserimento" });
   }
});
 

app.get("/todo", async (req, res) => {
   try {
     const todos = await executeQuery("SELECT * FROM todo");
     const formattedTodos = todos.map(todo => ({
       id: todo.id,
       inputValue: todo.name, 
       completed: todo.completed
     }));
     res.json({ todos: formattedTodos });
   } catch (error) {
     res.status(500).json({ error: "Impossibile recuperare i dati" });
   }
});


app.put("/todo/complete", async (req, res) => {
   const { id, completed } = req.body;
   console.log(id);
   try {
     await executeQuery("UPDATE todo SET completed = ? WHERE id = ?", [!completed, id]);
     res.json({ result: "Ok" });
   } catch (error) {
     res.status(500).json({ error: "Errore durante l'aggiornamento" });
   }
});

app.delete("/todo/:id", async (req, res) => {
   try {
     await executeQuery("DELETE FROM todo WHERE id = ?", [req.params.id]);
     res.json({ result: "Ok" });
   } catch (error) {
     res.status(500).json({ error: "Impossibile fare l'eliminazione" });
   }
});

const executeQuery = (sql, params = []) => {
   return new Promise((resolve, reject) => {      
      connection.query(sql, params, function (err, result) {
         if (err) {
            console.error(err);
            reject(err); 
            return; 
         }   
         resolve(result);        
      });
   });
};
   
   
const createTable = () => {
   console.log("create table")
   
      return executeQuery(`
   
      CREATE TABLE IF NOT EXISTS todo
   
         ( id INT PRIMARY KEY AUTO_INCREMENT, 
   
            name VARCHAR(255) NOT NULL, 
   
            completed BOOLEAN ) 
   
         `);      
   
}
const insert = (todo) => {
   
      const template = `
   
      INSERT INTO todo (name, completed) VALUES ('$NAME', '$COMPLETED')
   
         `;
   
      let sql = template.replace("$NAME", todo.name);
   
      sql = sql.replace("$COMPLETED", todo.completed ? 1 : 0);
   
      return executeQuery(sql); 
   
   }
const select = () => {
   
      const sql = `
   
      SELECT id, name, completed FROM todo 
   
         `;
   
      return executeQuery(sql); 
   
}  




createTable().then(() => {
   const server = http.createServer(app);
   server.listen(80, () => {
      console.log("-server running");
   });
});
