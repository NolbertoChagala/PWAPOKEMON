import { render, screen } from '@testing-library/react';
import App from './App';

test('renders Pokémon List header', () => {
  render(<App />);
  // Verifica el título principal
  const headerElement = screen.getByText(/Pokémon List/i);
  expect(headerElement).toBeInTheDocument();

  // Verifica el subtítulo
  const subtitleElement = screen.getByText(/A simple PWA demo/i);
  expect(subtitleElement).toBeInTheDocument();

  // Verifica que existan los botones de notificación
  const activarBtn = screen.getByText(/Activar notificaciones/i);
  expect(activarBtn).toBeInTheDocument();

  const enviarBtn = screen.getByText(/Enviar notificación local/i);
  expect(enviarBtn).toBeInTheDocument();
});
