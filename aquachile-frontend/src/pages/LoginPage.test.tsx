import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import LoginPage from "./LoginPage";

describe("LoginPage", () => {
  it("muestra un error al enviar el formulario vacío", () => {
    render(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole("button", { name: /Ingresar al Sistema/ }));

    expect(screen.getByText("Por favor, ingresa tu correo y contraseña.")).not.toBeNull();
  });
});
