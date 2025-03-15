import { render } from "@testing-library/react";
import App from "./App";

describe("App", () => {
  it('should matche the snapshot', () => {
    const { asFragment } = render(<App />);
    expect(asFragment()).toMatchSnapshot();
  });
});
