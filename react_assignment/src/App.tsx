import React,{useState} from "react";
//import Home from "./screens/Home";
// import Profile from "./screens/Profile";
//import UserProfileCard from "./components/UserProfileCard";
//import UserRegistrationForm from "./components/UserRegistrationForm";
//import ItemDetails from "./components/ItemDetails";
//import TodoManager from "./components/TodoManager";
import Dashboard from "./components/Dashboard";
import Login from "./components/Login";

{/*type Teacher = {
  id: number;
  name: string;
  subject: string;
};

type Student = {
  id: number;
  name: string;
  grade: string;
};

type Person = Teacher | Student; // Union type*/}

const App: React.FC = () => {

  {/*const [teachers, setTeachers] = useState<Teacher[]>([ //Array of Teacher objects
    { id: 1, name: "Mr. Sharma", subject: "Math" },
    { id: 2, name: "Ms. Rao", subject: "Science" }
  ]);

  const [students, setStudents] = useState<Student[]>([
    { id: 1, name: "Hiranya", grade: "A" },
    { id: 2, name: "Ashu", grade: "B" },
    { id: 3, name: "Rahul", grade: "D"}
  ]);

  const [selectedItem, setSelectedItem] = useState<Person | null>(null);

  // Delete function
  const handleDelete = (id: number) => {
    setTeachers(prev => prev.filter(t => t.id !== id));
    setStudents(prev => prev.filter(s => s.id !== id));
    setSelectedItem(null);
  };*/}

  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);


  return (
    <div>

      {/*1. <Home /> 
       <Profile /> */}

      {/*2.<UserProfileCard
        name="Hiranya"
        role="Software Engineer"
        status="active"
      />

      <UserProfileCard
        name="Rahul"
        role="Frontend Developer"
        status="inactive"
      />*/}

      {/*4. <UserRegistrationForm /> */}

      {/*5. <div style={{ display: "flex", gap: "60px", padding: "20px" }}>

      <div>
        <h2>Teachers</h2>
        {teachers.map(t => (
          <p key={t.id} onClick={() => setSelectedItem(t)}>
            {t.name}
          </p>
        ))}

        <h2>Students</h2>
        {students.map(s => (
          <p key={s.id} onClick={() => setSelectedItem(s)}>
            {s.name}
          </p>
        ))}
      </div>

      <ItemDetails item={selectedItem} //Parent → Child Props
                   onDelete={handleDelete} //Child → Parent Communication /> 

    </div>*/}

    {/*6. <TodoManager /> */}

    <h1>Conditional Rendering (TypeScript)</h1>

      {isLoggedIn ? <Dashboard /> : <Login />}

      <button onClick={() => setIsLoggedIn(!isLoggedIn)}>
        Toggle Login
      </button>

      {isLoggedIn && <p>You are successfully logged in ✅</p>}
    </div>
  );
};

export default App;

/*TASK1 : Header and Footer were created as reusable components using TypeScript.
The Header component accepts a boolean prop isBack to conditionally display a back button.
These components are reused across multiple screens like Home and Profile.*/ 

/*TASK2 : A reusable UserProfileCard component was created using TypeScript. 
Props were strongly typed, including a union type for status. The card dynamically changes 
color based on user status, and hover effects were added using CSS for better user interaction.*/

/*TASK4 : A user registration form was built using TypeScript with fields for name, email, 
and password. Form data and errors were strongly typed. Validation was implemented to ensure 
all fields are filled before submission. Upon successful validation, the submitted data is displayed
using conditional rendering.*/

/*TASK5 : Teachers and students dummy JSON data were created using TypeScript. A union type was 
used to handle both data types. Clicking an item displays its details in a child component. A delete button 
in the child triggers a parent function via props to update the state, demonstrating parent-child communication.*/

/*TASK6 : A Todo Manager was implemented using TypeScript. Tasks can be added, deleted, and marked as completed. 
The input field is automatically focused using useRef and useEffect. The count of completed tasks is efficiently 
calculated using useMemo to optimize performance.*/

/*TASK7 : Conditional rendering was implemented using TypeScript. A boolean state variable controls whether the 
Dashboard or Login component is displayed using the ternary operator. Additional UI elements are conditionally 
rendered using the logical AND operator based on the login state.*/