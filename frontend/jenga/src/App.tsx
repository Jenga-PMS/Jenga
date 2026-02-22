import { AppBar, Box, Card, CssBaseline, IconButton, Stack, ThemeProvider, Toolbar, createTheme } from '@suid/material';
import { Show, createEffect, createSignal, type JSXElement } from 'solid-js';
import { ProjectProvider } from './provider/ProjectProvider';
import { AuthProvider } from './provider/AuthProvider';
import { UserProvider } from './provider/UserProvider';
import logo from "../assets/Logo.png"
import { Auth } from './components/Auth';
import { Sidebar } from './components/Sidebar';
import { Menu } from '@suid/icons-material';
import { Footer } from './components/Footer';
import { useLocation } from '@solidjs/router';
import { LayoutProvider } from './provider/LayoutProvider';
import { ChatButton, ChatDialog } from './components/Chat';
import { AiProvider } from './provider/AiProvider';

const theme = createTheme()

interface AppProps {
  children?: JSXElement;
}

const App = (props: AppProps) => {
  const [open, setOpen] = createSignal(false);

  const location = useLocation();

  createEffect(() => {
    if (location.pathname === "/Home" || location.pathname === "/") {
      setOpen(true);
    }
  });

  return (
    <>
      <CssBaseline />
      <ThemeProvider theme={theme}>
        <LayoutProvider>
          <AuthProvider>
            <UserProvider>
              <ProjectProvider>
                <AiProvider>

                <AppBar position="static">
                  <Toolbar>
                    <IconButton onClick={() => { setOpen(prev => !prev) }}>
                      <Menu></Menu>
                    </IconButton>
                    <img src={logo} style={{ "height": "2vw", "width": "auto" }}></img>
                    <Box marginLeft={"auto"}>
                      <Auth></Auth>
                    </Box>
                  </Toolbar>
                </AppBar>
                <Stack direction="row">
                  <Show when={open()}>
                    <Card sx={{ "height": "100vh", "width": "10vw" }}>
                      <Sidebar />
                    </Card>
                  </Show>
                  <Box flex={1}>
                    {props.children}
                    <Box position="absolute" bottom={0} right={0} margin={2}>
                      <ChatButton></ChatButton>
                      <ChatDialog></ChatDialog>
                    </Box>
                  </Box>
                </Stack>
                <Footer></Footer>
                </AiProvider>
              </ProjectProvider>
            </UserProvider>
          </AuthProvider>
        </LayoutProvider>
      </ThemeProvider>
    </>
  );
};

export default App;
