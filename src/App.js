// import logo from './logo.svg';
import './App.css';
import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import PokemonDetail from './PokemonDetail';



function Home() {
  const [pokemons, setPokemons] = useState([]);

  useEffect(() => {
    // Fetch a paginated list, then fetch details for each Pokémon so we can show abilities
    fetch("https://pokeapi.co/api/v2/pokemon?limit=20")
      .then(response => response.json())
      .then(data => {
        // data.results contains { name, url } for each Pokémon; fetch details in parallel
        return Promise.all(
          data.results.map(p =>
            fetch(p.url).then(res => res.json()).catch(() => null)
          )
        );
      })
      .then(details => {
        // Filter out any failed fetches
        const valid = details.filter(Boolean);
        setPokemons(valid);
      })
      .catch(err => {
        console.error('Error fetching pokemons:', err);
      });
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>Pokémon List</h1>
        <p className="subtitle">A simple PWA demo using the PokéAPI</p>
        <ul className="pokemon-list">
          {pokemons.map((pokemon) => (
            <li key={pokemon.id} className="pokemon-card">
              <Link to={`/pokemon/${pokemon.id}`} className="card-link">
                <img
                  className="pokemon-sprite"
                  src={pokemon.sprites?.front_default || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`}
                  alt={pokemon.name}
                />
                <div className="pokemon-name">{pokemon.name}</div>
                <ul className="ability-list">
                  {pokemon.abilities && pokemon.abilities.map((ab) => (
                    <li key={ab.ability.name} className="ability-chip">{ab.ability.name}</li>
                  ))}
                </ul>
              </Link>
            </li>
          ))}
        </ul>
      </header>
      
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/pokemon/:id" element={<PokemonDetail />} />
    </Routes>
  );
}
