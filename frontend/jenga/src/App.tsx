import { AppBar, Box, Card, CssBaseline, IconButton, Stack, ThemeProvider, Toolbar, createTheme } from '@suid/material';
import { Show, createSignal, type JSXElement } from 'solid-js';
import { ProjectProvider } from './provider/ProjectProvider';
import { AuthProvider } from './provider/AuthProvider';
import { UserProvider } from './provider/UserProvider';
import logo from "../assets/Logo.png"
import { Auth } from './components/Auth';
import { Sidebar } from './components/Sidebar';
import { Menu } from '@suid/icons-material';
import { Footer } from './components/Footer';

const theme = createTheme()

interface AppProps {
  children?: JSXElement;
}

const App = (props: AppProps) => {
  const [open, setOpen] = createSignal(false)

  return (
    <>
      <CssBaseline />
      <ThemeProvider theme={theme}>
        <AuthProvider>
          <UserProvider>
            <ProjectProvider>
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
                </Box>
              </Stack>
              <Footer></Footer>
            </ProjectProvider>
          </UserProvider>
        </AuthProvider>
      </ThemeProvider>
    </>
  );
};

export default App;
