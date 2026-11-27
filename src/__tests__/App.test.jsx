import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import App from '../App.jsx';

describe('Tablero Kanban', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    cleanup();
  });

  it('permite entrar al tablero y agregar una tarea', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /Acceso Rápido Demo/i }));
    fireEvent.change(screen.getByPlaceholderText(/Nueva historia de usuario o tarea/i), {
      target: { value: 'Revisar métricas del servicio' }
    });
    fireEvent.click(screen.getByRole('button', { name: /Agregar Tarea/i }));

    expect(screen.getByText('Revisar métricas del servicio')).toBeInTheDocument();
  });

  it('muestra un error visible al intentar agregar una tarea vacía', () => {
    render(<App />);

    fireEvent.click(screen.getByRole('button', { name: /Acceso Rápido Demo/i }));
    fireEvent.click(screen.getByRole('button', { name: /Agregar Tarea/i }));

    expect(screen.getByRole('alert')).toHaveTextContent('ERROR_PROVOCADO_CI');
  });
});