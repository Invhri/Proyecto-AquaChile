import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import CandidatosPage from "./CandidatosPage";

describe("CandidatosPage", () => {
  it("muestra el directorio vacío cuando no hay candidatos", async () => {
    render(
      <MemoryRouter>
        <CandidatosPage />
      </MemoryRouter>
    );

    expect(screen.getByRole("heading", { name: "Directorio de Candidatos" })).not.toBeNull();
    expect(await screen.findByText("No hay candidatos disponibles.")).not.toBeNull();
  });

  it("filtra candidatos según el término de búsqueda de la URL", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn((url: string) => Promise.resolve({
        ok: true,
        json: async () => url.endsWith("/archivados") || url.endsWith("/aprobados") ? [] : [
          { id: 1, nombre_completo: "Ana Pérez", cargo_postulado: "Analista", origen: "Externo", ruta_cv: "ana.pdf" },
          { id: 2, nombre_completo: "Luis Soto", cargo_postulado: "Técnico", origen: "Interno", ruta_cv: "luis.pdf" }
        ]
      }))
    );

    render(
      <MemoryRouter initialEntries={["/candidatos?q=ana"]}>
        <CandidatosPage />
      </MemoryRouter>
    );

    expect(await screen.findByText("Ana Pérez")).not.toBeNull();
    expect(screen.queryByText("Luis Soto")).toBeNull();
  });

  it("muestra descartados y reprobados en el listado inferior", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn((url: string) => Promise.resolve({
        ok: true,
        json: async () => url.endsWith("/archivados")
          ? [{ id: 3, nombre_completo: "Eva Díaz", cargo_postulado: "Analista", origen: "Interno", estado: "Reprobado", fecha_cierre: "03-11-2026" }]
          : url.endsWith("/aprobados")
            ? [{ id: 4, nombre_completo: "Ana Pérez", correo: "ana@example.com", telefono: "+56912345678", cargo_postulado: "Analista", origen: "Externo" }]
            : []
      }))
    );

    render(
      <MemoryRouter>
        <CandidatosPage />
      </MemoryRouter>
    );

    expect(await screen.findByText("Eva Díaz")).not.toBeNull();
    expect(screen.getByText("Reprobó la evaluación | Fecha: 03-11-2026")).not.toBeNull();
    expect(await screen.findByText("Ana Pérez")).not.toBeNull();
    expect(screen.getByText("Correo: ana@example.com | Teléfono: +56912345678")).not.toBeNull();
  });

  it("mueve a la lista inferior un candidato descartado por el usuario", async () => {
    const fetchMock = vi.fn((url: string, options?: RequestInit) => {
      if (options?.method === "PATCH") {
        return Promise.resolve({
          ok: true,
          json: async () => ({
            candidato: { id: 1, estado: "Descartado", fecha_cierre: "03-11-2026" }
          })
        });
      }
      return Promise.resolve({
        ok: true,
        json: async () => url.endsWith("/archivados") || url.endsWith("/aprobados") ? [] : [
          { id: 1, nombre_completo: "Ana Pérez", cargo_postulado: "Analista", origen: "Externo", ruta_cv: "ana.pdf" }
        ]
      });
    });
    vi.stubGlobal("fetch", fetchMock);
    vi.spyOn(window, "confirm").mockReturnValue(true);

    render(
      <MemoryRouter>
        <CandidatosPage />
      </MemoryRouter>
    );

    fireEvent.click(await screen.findByRole("button", { name: "Descartar" }));

    expect(await screen.findByText("Descartado | Fecha: 03-11-2026")).not.toBeNull();
    expect(fetchMock).toHaveBeenCalledWith(
      "http://localhost:3001/api/candidatos/1/descartar",
      { method: "PATCH" }
    );
  });
});
