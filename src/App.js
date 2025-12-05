import './App.css';
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import PokemonDetail from './PokemonDetail';

function Home() {
  const [pokemons, setPokemons] = useState([]);

  useEffect(() => {
    fetch("https://pokeapi.co/api/v2/pokemon?limit=20")
      .then(response => response.json())
      .then(data =>
        Promise.all(data.results.map(p =>
          fetch(p.url).then(res => res.json()).catch(() => null)
        ))
      )
      .then(details => setPokemons(details.filter(Boolean)))
      .catch(err => console.error('Error fetching pokemons:', err));
  }, []);

  const solicitarPermisoNotificaciones = () => {
    if ("Notification" in window) {
      Notification.requestPermission().then((permiso) => {
        if (permiso === "granted") {
          new Notification("✅ Notificaciones activadas", {
            body: "Tu app ahora puede mostrar notificaciones locales.",
            icon: "/logo192.png"
          });
        } else {
          alert("Las notificaciones fueron denegadas.");
        }
      });
    }
  };

  const enviarNotificacionDesdeSW = () => {
    if (Notification.permission !== "granted") {
      alert("Debes activar primero las notificaciones.");
      return;
    }

    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
      navigator.serviceWorker.controller.postMessage({
        type: "SHOW_NOTIFICATION",
        title: "🌟 ¡Pokémon atrapado!",
        body: "Has visto 20 Pokémon nuevos."
      });
    } else if (navigator.serviceWorker) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification("🌟 ¡Pokémon atrapado!", {
          body: "Has visto 20 Pokémon nuevos.",
          icon: "/logo192.png",
          badge: "/logo192.png",
          tag: "pokemon-alert",
          requireInteraction: true,
          vibrate: [200, 100, 200]
        });
      });
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Pokémon List</h1>
        <p className="subtitle">A simple PWA demo using the PokéAPI</p>

        <div style={{ marginBottom: '1rem' }}>
          <button onClick={solicitarPermisoNotificaciones}>Activar notificaciones</button>
          <button onClick={enviarNotificacionDesdeSW} style={{ marginLeft: '10px' }}>
            Enviar notificación local
          </button>
        </div>

        <ul className="pokemon-list">
          {pokemons.map((pokemon) => (
            <li key={pokemon.id} className="pokemon-card">
              <Link to={`/pokemon/${pokemon.id}`} className="card-link">
                <img
                  className="pokemon-sprite"
                  src={pokemon.sprites?.front_default ||
                    `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemon.id}.png`}
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
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/pokemon/:id" element={<PokemonDetail />} />
      </Routes>
    </BrowserRouter>
  );
}
