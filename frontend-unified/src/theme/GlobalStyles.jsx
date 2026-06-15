import { CssBaseline, GlobalStyles } from "@mui/material";

const globalStyles = (
  <GlobalStyles
    styles={{
      "*": {
        margin: 0,
        padding: 0,
        boxSizing: "border-box",
      },
      html: {
        scrollBehavior: "smooth",
      },
      body: {
        backgroundColor: "#F8FAFC",
        color: "#1E293B",
      },
      "#root": {
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh",
      },
      "input:-webkit-autofill": {
        WebkitBoxShadow: "0 0 0 1000px white inset",
        WebkitTextFillColor: "#1E293B",
      },
      "input:-webkit-autofill:focus": {
        WebkitBoxShadow: "0 0 0 1000px white inset",
        WebkitTextFillColor: "#1E293B",
      },
    }}
  />
);

export { CssBaseline, globalStyles };
