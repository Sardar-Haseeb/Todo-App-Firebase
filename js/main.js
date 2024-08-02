import { auth, db } from "./firebaseConfig.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-auth.js";
import { doc, setDoc, getDoc, deleteDoc, updateDoc } from "https://www.gstatic.com/firebasejs/10.12.4/firebase-firestore.js";

window.addtodo = async function() {
    const userId = localStorage.getItem("userId");
    const todoInput = document.getElementById("todoinput").value.trim();

    if (!userId || !todoInput) {
        console.error("No user ID or todo input");
        return;
    }

    try {
        const todoDocRef = doc(db, "todos", userId);
        const todoDoc = await getDoc(todoDocRef);

        const todos = todoDoc.exists() ? todoDoc.data().todos : [];
        todos.push({ text: todoInput, id: new Date().getTime().toString() });
        await setDoc(todoDocRef, { todos });

        document.getElementById("todoinput").value = "";
        loadTodos();
    } catch (error) {
        console.error("Error adding todo:", error.message);
    }
};

window.loadTodos = async function() {
    const userId = localStorage.getItem("userId");

    if (!userId) {
        window.location.href = "login.html";
        return;
    }

    try {
        const todoDocRef = doc(db, "todos", userId);
        const todoDoc = await getDoc(todoDocRef);

        if (todoDoc.exists()) {
            const todos = todoDoc.data().todos || [];
            const todoParent = document.getElementById("todoParent");
            todoParent.innerHTML = "";
            todos.forEach((todo, index) => {
                const li = document.createElement("li");
                li.innerHTML = `
                    <span>${todo.text}</span>
                    <div class="button-group">
                        <button onclick="editTodoPrompt(${index})">Edit</button>
                        <button onclick="deleteTodo(${index})">Delete</button>
                    </div>
                `;
                todoParent.appendChild(li);
            });
        }
    } catch (error) {
        console.error("Error loading todos:", error.message);
    }
};

window.editTodoPrompt = function(index) {
    const newTodo = prompt("Edit your todo:");
    if (newTodo) {
        editTodo(index, newTodo);
    }
};

window.editTodo = async function(index, newText) {
    const userId = localStorage.getItem("userId");

    try {
        const todoDocRef = doc(db, "todos", userId);
        const todoDoc = await getDoc(todoDocRef);

        if (todoDoc.exists()) {
            const todos = todoDoc.data().todos || [];
            todos[index].text = newText;
            await updateDoc(todoDocRef, { todos });
            loadTodos();
        }
    } catch (error) {
        console.error("Error editing todo:", error.message);
    }
};

window.deleteTodo = async function(index) {
    const userId = localStorage.getItem("userId");

    try {
        const todoDocRef = doc(db, "todos", userId);
        const todoDoc = await getDoc(todoDocRef);

        if (todoDoc.exists()) {
            const todos = todoDoc.data().todos || [];
            todos.splice(index, 1);
            await updateDoc(todoDocRef, { todos });
            loadTodos();
        }
    } catch (error) {
        console.error("Error deleting todo:", error.message);
    }
};
