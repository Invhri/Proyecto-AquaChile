import { describe, expect, it } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import FormularioPublicoPage from "./FormularioPublicoPage";

describe("FormularioPublicoPage", () => {
  it("valida los campos obligatorios al enviar vacío", () => {
    render(<FormularioPublicoPage />);

    fireEvent.click(screen.getByRole("button", { name: /Solicitar Evaluación/i }));

    expect(screen.getByText("Por favor, corrige los errores.")).not.toBeNull();
  });
});
