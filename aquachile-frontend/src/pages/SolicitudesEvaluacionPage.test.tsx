import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import SolicitudesEvaluacionPage from "./SolicitudesEvaluacionPage";

describe("SolicitudesEvaluacionPage", () => {
  it("muestra el estado vacío de solicitudes", () => {
    render(
      <MemoryRouter>
        <SolicitudesEvaluacionPage />
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: "Solicitudes Pendientes de Asignación" })).not.toBeNull();
    expect(screen.getByText("No hay solicitudes pendientes de asignación.")).not.toBeNull();
  });
});
