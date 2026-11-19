import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import DashboardPage from "./DashboardPage";

describe("DashboardPage", () => {
  it("muestra el panel y sus indicadores iniciales", () => {
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: /Directorio de Selección/ })).not.toBeNull();
    expect(screen.getByText("CANDIDATOS TOTALES")).not.toBeNull();
  });
});
