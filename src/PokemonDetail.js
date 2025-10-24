import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './App.css';

export default function PokemonDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [pokemon, setPokemon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then((data) => {
        setPokemon(data);
        setError(null);
      })
      .catch((err) => {
        setError(err.message || 'Error fetching Pokémon');
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="detail-container">Cargando...</div>;
  if (error) return <div className="detail-container">Error: {error}</div>;
  if (!pokemon) return <div className="detail-container">No encontrado</div>;

  return (
    <div className="detail-container">
      <button className="back-button" onClick={() => navigate(-1)}>&larr; Volver</button>
      <div className="detail-card">
        <img
          className="pokemon-sprite large"
          src={pokemon.sprites?.other?.['official-artwork']?.front_default || pokemon.sprites?.front_default}
          alt={pokemon.name}
          onError={(e) => {
            const fallbackUrl = pokemon.sprites?.front_default;
            if (e.target.src !== fallbackUrl) {
              e.target.src = fallbackUrl;
            }
          }}
        />
        <h2 className="pokemon-name">{pokemon.name}</h2>

        <div className="detail-meta">
          <div className="types">
            {(pokemon.types || []).map(t => (
              <span key={t?.type?.name || Math.random()} className="type-badge">{t?.type?.name}</span>
            ))}
          </div>

          <h3 className="section-title">Habilidades</h3>
          <ul className="ability-list">
            {(pokemon.abilities || []).map(ab => (
              <li key={ab?.ability?.name || Math.random()} className={`ability-chip ${(ab && ab.is_hidden) ? 'hidden' : ''}`}>
                {ab?.ability?.name}{(ab && ab.is_hidden) ? ' (oculta)' : ''}
              </li>
            ))}
          </ul>

          <h3 className="section-title">Stats</h3>
          <ul className="stat-list">
            {(pokemon.stats || []).map(s => (
              <li key={s?.stat?.name || Math.random()} className="stat-row">
                <span className="stat-name">{s?.stat?.name}</span>
                <div className="stat-bar-container">
                  <div className="stat-bar" style={{ width: `${((s?.base_stat || 0) / 255) * 100}%` }}></div>
                  <span className="stat-value">{s?.base_stat ?? '-'}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
