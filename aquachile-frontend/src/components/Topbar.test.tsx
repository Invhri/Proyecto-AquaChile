import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Topbar from "./Topbar";

describe("Topbar", () => {
  it("muestra el nombre y rol del usuario autenticado", () => {
    localStorage.setItem(
      "usuario_autenticado",
      JSON.stringify({ nombre: "Ana Pérez", rol: "Analista" })
    );

    render(
      <MemoryRouter>
        <Topbar />
      </MemoryRouter>
    );

    expect(screen.getByText("Ana Pérez")).not.toBeNull();
    expect(screen.getByText("Analista")).not.toBeNull();
  });
});
