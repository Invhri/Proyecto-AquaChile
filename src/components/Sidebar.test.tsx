import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import Sidebar from "./Sidebar";

const metricas = {
  candidatos: 8,
  solicitudesActivas: 3,
  evaluacionesPendientes: 2,
  efectividad: 75,
  ingresosMes: 4
};

function renderSidebar(rol: string) {
  localStorage.setItem(
    "usuario_autenticado",
    JSON.stringify({ rol })
  );

  return render(
    <MemoryRouter>
      <Sidebar />
    </MemoryRouter>
  );
}

describe("Sidebar", () => {
  beforeEach(() => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => metricas
      })
    );
  });

  it("muestra la navegación y métricas disponibles para un administrador", async () => {
    renderSidebar("Administrador académico");

    expect(screen.getByRole("link", { name: /Dashboard \/ Inicio/ })).not.toBeNull();
    expect(screen.getByRole("link", { name: /Candidatos/ })).not.toBeNull();
    expect(screen.getByRole("link", { name: /Gestión de Usuarios/ })).not.toBeNull();
    expect(await screen.findByText("75%")).not.toBeNull();
    expect(screen.getByText("4 ingresos cerrados este mes")).not.toBeNull();
  });

  it("oculta las opciones que no corresponden al rol de evaluador", () => {
    renderSidebar("Profesional Evaluador");

    expect(screen.getByRole("link", { name: /Evaluaciones/ })).not.toBeNull();
    expect(screen.queryByRole("link", { name: /Candidatos/ })).toBeNull();
    expect(screen.queryByRole("link", { name: /Gestión de Usuarios/ })).toBeNull();
  });
});