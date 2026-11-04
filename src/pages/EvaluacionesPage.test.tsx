import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import EvaluacionesPage from "./EvaluacionesPage";

describe("EvaluacionesPage", () => {
  it("muestra el estado vacío de evaluaciones", () => {
    render(
      <MemoryRouter>
        <EvaluacionesPage />
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: "Evaluaciones Pendientes" })).not.toBeNull();
    expect(screen.getByText("No tienes evaluaciones pendientes en este momento.")).not.toBeNull();
  });

  it("abre la ficha al seleccionar una evaluación asignada", async () => {
    localStorage.setItem(
      "usuario_autenticado",
      JSON.stringify({ correo: "evaluador@aquachile.cl" })
    );
    vi.stubGlobal(
      "fetch",
      vi.fn().mockImplementation((url: string) =>
        Promise.resolve({
          ok: true,
          json: async () =>
            url.includes("/api/evaluaciones/asignadas")
              ? [{ id: 1, candidato_nombre: "Ana Pérez", cargo: "Analista", fecha_asignacion: "2026-11-03" }]
              : {}
        })
      )
    );

    render(
      <MemoryRouter>
        <EvaluacionesPage />
      </MemoryRouter>
    );

    fireEvent.click(await screen.findByRole("button", { name: "Evaluar" }));

    const ficha = screen.getByRole("complementary", { name: "Ficha de evaluación" });
    expect(ficha).not.toBeNull();
    expect(screen.getByRole("heading", { name: "Ficha de evaluación" })).not.toBeNull();
    expect(within(ficha).getByText("Ana Pérez")).not.toBeNull();
  });
});
