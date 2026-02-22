import {
  AppBar,
  Box,
  Card,
  CssBaseline,
  IconButton,
  Stack,
  ThemeProvider,
  Toolbar,
  createTheme,
} from "@suid/material";
import { Show, createEffect, useContext, type JSXElement } from "solid-js";
import { ProjectProvider } from "./provider/ProjectProvider";
import { AuthProvider } from "./provider/AuthProvider";
import { UserProvider } from "./provider/UserProvider";
import logo from "../assets/Logo.png";
import { Auth } from "./components/Auth";
import { Sidebar } from "./components/Sidebar";
import { Menu } from "@suid/icons-material";
import { Footer } from "./components/Footer";
import { useLocation } from "@solidjs/router";
import { LayoutContext, LayoutProvider } from "./provider/LayoutProvider";
import { GuideProvider } from "./provider/GuideProvider";
import { GuideButton } from "./components/GuideButton";
import { I18nProvider } from "./provider/I18nProvider";
import { LangButton } from "./components/LangButton";
import { AiProvider } from "./provider/AiProvider";
import { ChatButton } from "./components/Chat";
import { ChatDialog } from "./components/Chat";

const theme = createTheme();

interface AppProps {
  children?: JSXElement;
}

const AppShell = (props: AppProps) => {
  const lCtx = useContext(LayoutContext);
  const location = useLocation();

  createEffect(() => {
    if (location.pathname === "/Home" || location.pathname === "/") {
      lCtx?.setSidebarOpen(true);
    }
  });

  return (
    <I18nProvider>
      <AuthProvider>
        <UserProvider>
          <AiProvider>
            <ProjectProvider>
              <GuideProvider>
                <AppBar position="static">
                  <Toolbar>
                    <IconButton
                      id="guide-nav-toggle"
                      onClick={() => {
                        lCtx?.toggleSidebar();
                      }}
                    >
                      <Menu></Menu>
                    </IconButton>
                    <img
                      src={logo}
                      style={{ height: "2vw", width: "auto" }}
                    ></img>
                    <Box marginLeft={"auto"}>
                      <Stack direction="row" spacing={2}>
                        <LangButton></LangButton>
                        <GuideButton></GuideButton>
                        <Auth></Auth>
                      </Stack>
                    </Box>
                  </Toolbar>
                </AppBar>
                <Stack direction="row">
                  <Show when={lCtx?.sidebarOpen()}>
                    <Card
                      id="guide-sidebar"
                      sx={{ height: "100vh", width: "10vw" }}
                    >
                      <Sidebar />
                    </Card>
                  </Show>
                  <Box flex={1}>
                    {props.children}
                    <Box flex={1}>
                      {props.children}
                      <Box position="absolute" bottom={0} right={0} margin={2}>
                        <ChatButton></ChatButton>
                        <ChatDialog></ChatDialog>
                      </Box>
                    </Box>
                  </Box>
                </Stack>
                <Footer></Footer>
              </GuideProvider>
            </ProjectProvider>
          </AiProvider>
        </UserProvider>
      </AuthProvider>
    </I18nProvider>
  );
};

const App = (props: AppProps) => {
  return (
    <>
      <CssBaseline />
      <ThemeProvider theme={theme}>
        <LayoutProvider>
          <AppShell>{props.children}</AppShell>
        </LayoutProvider>
      </ThemeProvider>
    </>
  );
};

export default App;
