import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import { globalStyles } from "./theme/GlobalStyles";
import theme from "./theme/theme";
import router from "./router/router";

function App() {
  useEffect(() => {
    // Initialize app - load Face API models at startup if needed
    console.log("✅ App initialized");
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {globalStyles}
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}

export default App;
