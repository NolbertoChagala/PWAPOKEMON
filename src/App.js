// import logo from './logo.svg';
import './App.css';
import React, { useState, useEffect } from 'react';



function App() {

  const [pokemons, setPokemons] = useState([]);

  useEffect(() => {
    fetch("https://pokeapi.co/api/v2/pokemon?limit=20")
      .then(response => response.json())
      .then(data => setPokemons(data.results));
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Pokémon List</h1>
        <p className="subtitle">A simple PWA demo using the PokéAPI</p>
        <ul className="pokemon-list">
          {pokemons.map((pokemon, index) => (
            <li key={index} className="pokemon-card">
              <img
                className="pokemon-sprite"
                src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${index + 1}.png`}
                alt={pokemon.name}
              />
              <div className="pokemon-name">{pokemon.name}</div>
            </li>
          ))}
        </ul>
      </header>
      
    </div>
  );
}

export default App;
