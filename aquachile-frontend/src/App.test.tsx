import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "./App";

describe("App", () => {
  it("redirige la ruta inicial al inicio de sesión", async () => {
    render(<App />);

    expect(await screen.findByRole("button", { name: /Ingresar al Sistema/ })).not.toBeNull();
  });
});
