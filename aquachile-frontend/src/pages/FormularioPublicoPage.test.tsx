import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import FormularioPublicoPage from "./FormularioPublicoPage";

describe("FormularioPublicoPage", () => {
  it("valida los campos obligatorios al enviar vacío", () => {
    render(<FormularioPublicoPage />);

    fireEvent.click(screen.getByRole("button", { name: /Enviar Postulación/i }));

    expect(screen.getByText("Por favor, corrige los errores.")).not.toBeNull();
  });

  it("advierte cuando se guarda la postulación pero falla el correo de confirmación", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ emailSent: false })
    }));
    const { container } = render(<FormularioPublicoPage />);
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

    expect(await screen.findByText("Tu postulación fue enviada, pero no se pudo enviar el correo de confirmación.")).not.toBeNull();
  });
});
