import React,{ useState } from 'react';
//import Home from './screens/Home';
//import Profile from './screens/Profile';
//import UserProfileCard from './components/UserProfileCard';
//import UserRegistrationForm from './components/UserRegistrationFOrm';
//import ItemDetails from '/ItemDetails';
//import TodoManager from './components/TodoManager';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
function App() {
  // const [teachers, setTeachers] = useState([
  //   { id: 1, name: "Mr. Sharma", subject: "Math" },
  //   { id: 2, name: "Ms. Rao", subject: "Science" }
  // ]);

  // const [students, setStudents] = useState([
  //   { id: 1, name: "Aman", grade: "A" },
  //   { id: 2, name: "Priya", grade: "B" }
  // ]);

  // const [selectedItem, setSelectedItem] = useState(null);

  // const handleDelete = (id) => {
  //   setTeachers(teachers.filter(t => t.id !== id));
  //   setStudents(students.filter(s => s.id !== id));
  //   setSelectedItem(null);
  // };

  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <>
      <div>
        {/*1. <Home /> */}
        {/*3. <UserProfileCard
        name="Hiranya"
        role="Software Engineer"
        status="active"
      />

      <UserProfileCard
        name="Rahul"
        role="Frontend Developer"
        status="inactive"
      /> */}
        {/*4. <UserRegistrationForm /> */}
        {/*5. <div>
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

      <ItemDetails item={selectedItem} onDelete={handleDelete} /> */}
      {/*6. <TodoManager /> */}
      <h1>Conditional Rendering Example</h1>

      {/* Ternary Operator */}
      {isLoggedIn ? <Dashboard /> : <Login />}

      <button onClick={() => setIsLoggedIn(!isLoggedIn)}>
        Toggle Login
      </button>

      {/* Logical AND example */}
      {isLoggedIn && <p>You are successfully logged in.</p>} 
      </div>
    </>
  )
}

export default App
/*TASK1 : Header and Footer were created as reusable components 
and imported into all screens. The Header component accepts a prop isBack 
which conditionally renders a back button when set to true.*/

/*TASK3 : A reusable UserProfileCard component was created that 
displays user information. The card color dynamically changes based on user status 
(active or inactive). CSS hover effects were added to improve UI interaction.*/

/*TASK4 : A user registration form was created with fields for name, email, and password.
React state is used to manage form inputs and validate required fields. After successful validation,
the submitted data is displayed on the screen.*/

/*TASK5 : Teachers and students dummy JSON data were created in the parent component.
Clicking an item displays its details in a child component. A delete button in the
child triggers a parent delete function through props, demonstrating parent-child communication in React.*/

/*TASK6 : A Todo Manager was created that allows users to add, delete, and mark tasks as completed. 
The input field is automatically focused using useRef. The number of completed tasks is calculated efficiently using useMemo.*/

/*TASK7 : Conditional rendering was implemented using the ternary operator and logical AND operator. Based on the login state,
 either the Dashboard or Login component is displayed. Additional content is conditionally rendered 
 using the && operator when the user is logged in.*/

 