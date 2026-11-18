import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import FormularioInternoPage from "./FormularioInternoPage";

describe("FormularioInternoPage", () => {
  it("valida los campos obligatorios al enviar vacío", () => {
    render(<FormularioInternoPage />);

    fireEvent.click(screen.getByRole("button", { name: /Solicitar Evaluación/i }));

    expect(screen.getByText("Por favor, corrige los errores.")).not.toBeNull();
  });
});
