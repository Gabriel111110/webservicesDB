const ul = document.getElementById("lista");
const button = document.getElementById("submit");
const inputTesto = document.getElementById("inputText");
let list = [];
let count = 0;



function loadList() {
  fetch("/todo", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    }
  })
  .then(response => response.json())
  .then(data => {
    console.log(data.todos);
    list = data.todos;
    render();
  })
}
loadList();

button.onclick = () => {
  const data = {
    inputValue: inputTesto.value,
    completed: false,
  };

  fetch("/todo/add", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((result) => {
      list.push(result.todo); 
      render();
      inputTesto.value = ""; 
    });
};

function render() {
  let html = "";
  list.forEach((element, id) => {
    let completedClass = element.completed ? "done" : "";
    html += `<li id='li_${element.id}' class='divs ${completedClass}'>
      ${element.inputValue}
      <button type='button' class='pulsantiConferma' id='bottoneC_${element.id}'>conferma</button>
      <button type='button' class='pulsantiElimina' id='bottoneE_${element.id}'>elimina</button>
    </li>`;
  });
  ul.innerHTML = html;

  document.querySelectorAll(".pulsantiElimina").forEach((button) => {
    button.onclick = () => {
      const id = button.id.replace("bottoneE_", "");
      remove(id);
    };
  });

  document.querySelectorAll(".pulsantiConferma").forEach((button) => {
    button.onclick = () => {
      const id = button.id.replace("bottoneC_", "");
      update(id);
    };
  });
}


function update(id) {
  const todo = list.find((item) => item.id === id);
  fetch("/todo/complete", {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(todo),
  })
    .then((response) => response.json())
    .then(() => {
      if(todo.completed===false){
      todo.completed = true;
      }else{
        todo.completed=false;
      } 
      render();
    });
}
function remove(id) {
  fetch(`/todo/${id}`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => response.json())
    .then(() => {
      list = list.filter((item) => item.id !== id);
      render();
    });
}

render();
