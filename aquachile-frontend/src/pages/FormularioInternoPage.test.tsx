import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import FormularioInternoPage from "./FormularioInternoPage";

describe("FormularioInternoPage", () => {
  it("valida los campos obligatorios al enviar vacío", () => {
    render(<FormularioInternoPage />);

    fireEvent.click(screen.getByRole("button", { name: /Enviar Postulación/i }));

    expect(screen.getByText("Por favor, corrige los errores.")).not.toBeNull();
  });

  it("confirma el envío y el correo cuando ambos se completan correctamente", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ emailSent: true })
    }));
    const { container } = render(<FormularioInternoPage />);
    const setValue = (name: string, value: string) => {
      fireEvent.change(container.querySelector<HTMLInputElement | HTMLSelectElement>(`[name="${name}"]`)!, {
        target: { value }
      });
    };

    setValue("nombreCandidato", "Ana Perez");
    setValue("correoCandidato", "ana@example.com");
    setValue("telefonoCandidato", "123456789");
    setValue("familiaCargo", "Profesional A");
    setValue("nombreCargo", "Líder Desarrollo Producción");
    fireEvent.change(container.querySelector<HTMLInputElement>('[name="cv"]')!, {
      target: { files: [new File(["cv"], "cv.pdf", { type: "application/pdf" })] }
    });

    fireEvent.click(screen.getByRole("button", { name: /Enviar Postulación/i }));

    expect(await screen.findByText("Postulación enviada con éxito. Recibirás un correo de confirmación.")).not.toBeNull();
  });
});
