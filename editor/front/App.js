import React, {useState} from 'react';
//import './App.css';

export function App() {
	// Array of objects containing our fruit data
	const fruits = [
		{ label: "Apple", value: "🍎" },
		{ label: "Banana", value: "🍌" },
		{ label: "Orange", value: "🍊" }
	];
	
	// Using state to keep track of what the selected fruit is
	const [fruit, setFruit] = useState("⬇️ Select a fruit ⬇️")

	// Using this function to update the state of fruit
	// whenever a new option is selected from the dropdown
	const handleFruitChange = (e) => {
		setFruit(e.target.value)
	}

	return <div>
		<h1>Hello world!</h1>
		
		{/* Displaying the value of fruit */}
		{fruit}
		<br />

		{/* Creating our dropdown and passing it the handleFruitChange 
		so that every time a new choice is selected, our fruit state 
		updates and renders an emoji of the fruit.
		*/}
		<select onChange={handleFruitChange}> 
			{/* Creating the default / starting option for our 
			  dropdown.
			 */}
			<option value="⬇️ Select a fruit ⬇️"> -- Select a fruit -- </option>
			{fruits.map((fruit) => <option key={fruit.label} value={fruit.value}>{fruit.label}</option>)}
		</select>
	</div>;
}
