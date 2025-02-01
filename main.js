const http=require("http");

const express = require("express");

const app = express();

const bodyParser = require('body-parser');

/* punto 3- aggiunta della parte di db*/

const fs = require('fs');

const mysql = require('mysql2');

const conf = JSON.parse(fs.readFileSync('conf.json'));

let connection = mysql.createConnection ({
   host: conf.host,
   user: conf.user,
   port: conf.port, /* port on which
   phpmyadmin run */
   password: conf.password,
   database: conf.database,
   ssl: {
   ca: fs.readFileSync(__dirname +
   '/ca.pem' )}
   }
);

/*punto 4 - funzione che esegue query*/

const executeQuery = (sql) => {

   return new Promise((resolve, reject) => {      

         connection.query(sql, function (err, result) {

            if (err) {

               console.error(err);

               reject();     

            }   

            console.log('done');

            resolve(result);         

      });

   })

}

/* punto 5- crea tabella del db */

const createTable = () => {

   return executeQuery(`

   CREATE TABLE IF NOT EXISTS todo

      ( id INT PRIMARY KEY AUTO_INCREMENT, 

         name VARCHAR(255) NOT NULL, 

         completed BOOLEAN ) 

      `);      

}

/*punto 6 - insert */

const insert = (todo) => {

   const template = `

   INSERT INTO todo (name, completed) VALUES ('$NAME', $COMPLETED)

      `;

   let sql = template.replace("$NAME", todo.name);

   sql = sql.replace("$COMPLETED", todo.completed);

   return executeQuery(sql); 

}

/*punto 7 - select */

const select = (todo) => {

   const sql = `

   SELECT id, name, completed FROM todo 

      `;

   return executeQuery(sql); 

}

/*punto 8 - test delle query*/

createTable().then(() => {

   insert({name: "test " + new Date().getTime(), completed: false}).then((result) => {

      select().then(console.log).catch(console.error);

   }).catch(console.error);

}); 


app.use(bodyParser.json());

app.use(bodyParser.urlencoded({

   extended: true

}));

const path = require('path');

app.use("/", express.static(path.join(__dirname, "webservicesnodejs/public")));

let todos = [];


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
     res.status(500).json({ error: "Errore nel recupero dei dati" });
   }
});

const server = http.createServer(app);

server.listen(80, () => {

  console.log("- server running");

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
      console.log("dentro delete");
     await executeQuery("DELETE FROM todo WHERE id = ?", [req.params.id]);
     res.json({ result: "Ok" });
   } catch (error) {
     res.status(500).json({ error: "Errore durante l'eliminazione" });
   }
 });