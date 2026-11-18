import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import AdminUsuariosPage from "./AdminUsuariosPage";

describe("AdminUsuariosPage", () => {
  it("muestra el formulario y el estado vacío de usuarios", () => {
    render(
      <MemoryRouter>
        <AdminUsuariosPage />
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: "Directorio de Cuentas y Accesos" })).not.toBeNull();
    expect(screen.getByRole("button", { name: "Crear Usuario" })).not.toBeNull();
    expect(screen.getByText("No hay usuarios registrados o cargando...")).not.toBeNull();
  });

  it("avisa si se intenta crear un usuario con campos vacíos", () => {
    render(
      <MemoryRouter>
        <AdminUsuariosPage />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: "Crear Usuario" }));

    expect(screen.getByText("Por favor, completa todos los campos.")).not.toBeNull();
  });
});
