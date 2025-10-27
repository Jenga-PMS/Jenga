import { Accessor, JSXElement, Resource, createContext, createMemo, createResource, createSignal } from "solid-js";
import { AuthenticationResourceService, LoginRequestDTO, LoginResponseDTO, OpenAPI, RegisterRequestDTO } from "../api";

type AuthContextType = {
  login?: (request: LoginRequestDTO) => void;
  isLoggedIn: Accessor<boolean>;
  register?: (request: RegisterRequestDTO) => void;
  jwt: Resource<LoginResponseDTO | undefined>;
  registerResult: Resource<LoginResponseDTO | undefined>;
};

export const AuthContext = createContext<AuthContextType>();

interface ProviderProps {
  children: JSXElement;
}

export const AuthProvider = (props: ProviderProps) => {
  const [registerRequestDTO, setRegisterRequestDTO] = createSignal<RegisterRequestDTO>();
  const [loginRequestDTO, setLoginRequestDTO] = createSignal<LoginRequestDTO>();

  const register = (request: RegisterRequestDTO) => {
    setRegisterRequestDTO(request);
  };

  const login = (request: LoginRequestDTO) => {
    setLoginRequestDTO(request);
  };

  const [registerResult] = createResource(registerRequestDTO, (payload) =>
    payload ? AuthenticationResourceService.postApiAuthRegister(payload) : undefined
  );
  const [loginResult] = createResource(loginRequestDTO, async (payload) => {
    if (!payload) {
      return undefined;
    }

    const jwt = await AuthenticationResourceService.postApiAuthLogin(payload);
    OpenAPI.TOKEN = jwt.token;
    OpenAPI.USERNAME = jwt.username;

    return jwt;
  });

  const loggedIn = createMemo(() => Boolean(loginResult()?.token));

  const value: AuthContextType = {
    login,
    isLoggedIn: loggedIn,
    register,
    jwt: loginResult,
    registerResult,
  };

  return <AuthContext.Provider value={value}>{props.children}</AuthContext.Provider>;
};
