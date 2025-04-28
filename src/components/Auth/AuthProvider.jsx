import { useContext, createContext, useState, useEffect } from "react";
// import requestNewAccessToken from "./requestNewAccessToken";
// import { API_URL } from "./authConstants";

const AuthContext = createContext({
  isAuthenticated: false,
  //   getAccessToken: () => {},
  //   setAccessTokenAndRefreshToken: () => {},
  //   getRefreshToken: () => {},
  //   saveUser: () => {},
  //   getUser: () => {},
  //   signout: () => {},
});

export function AuthProvider({ children }) {
  //   const [user, setUser] = useState();
  //   const [accessToken, setAccessToken] = useState("");
  //   const [refreshToken, setRefreshToken] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  //   const [isloading, setIsLoading] = useState(true);

  //   function getAccessToken() {
  //     return accessToken;
  //   }

  //   function saveUser(userData) {
  //     setAccessTokenAndRefreshToken(
  //       userData.body.accessToken,
  //       userData.body.refreshToken
  //     );
  //     setUser(userData.body.user);
  //     setIsAuthenticated(true);
  //   }

  //   function setAccessTokenAndRefreshToken(accessToken, refreshToken) {
  //     console.log("setAccessTokenAndRefreshToken", accessToken, refreshToken);
  //     setAccessToken(accessToken);
  //     setRefreshToken(refreshToken);
  //     localStorage.setItem("token", JSON.stringify({ refreshToken }));
  //   }

  //   function getRefreshToken() {
  //     if (!!refreshToken) {
  //       return refreshToken;
  //     }
  //     const token = localStorage.getItem("token");
  //     if (token) {
  //       const parsed = JSON.parse(token);
  //       setRefreshToken(parsed.refreshToken);
  //       return parsed.refreshToken;
  //     }
  //     return null;
  //   }

  //   async function getNewAccessToken(refreshToken) {
  //     const token = await requestNewAccessToken(refreshToken);
  //     return token;
  //   }

  //   function getUser() {
  //     return user;
  //   }

  //   function signout() {
  //     localStorage.removeItem("token");
  //     setAccessToken("");
  //     setRefreshToken("");
  //     setUser(undefined);
  //     setIsAuthenticated(false);
  //   }

  //   async function checkAuth() {
  //     try {
  //       if (!!accessToken) {
  //         const userInfo = await retrieveUserInfo(accessToken);
  //         setUser(userInfo);
  //         setAccessToken(accessToken);
  //         setIsAuthenticated(true);
  //         setIsLoading(false);
  //       } else {
  //         const token = localStorage.getItem("token");
  //         if (token) {
  //           const parsed = JSON.parse(token);
  //           const refreshToken = parsed.refreshToken;
  //           getNewAccessToken(refreshToken)
  //             .then(async (newToken) => {
  //               const userInfo = await retrieveUserInfo(newToken);
  //               setUser(userInfo);
  //               setAccessToken(newToken);
  //               setIsAuthenticated(true);
  //               setIsLoading(false);
  //             })
  //             .catch((error) => {
  //               console.log(error);
  //               setIsLoading(false);
  //             });
  //         } else {
  //           setIsLoading(false);
  //         }
  //       }
  //     } catch (error) {
  //       setIsLoading(false);
  //     }
  //   }

  //   useEffect(() => {
  //     checkAuth();
  //   }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        // getAccessToken,
        // setAccessTokenAndRefreshToken,
        // getRefreshToken,
        // saveUser,
        // getUser,
        // signout,
      }}
    >
      {children}
      {/* {isloading ? <div>Loading...</div> : children} */}
    </AuthContext.Provider>
  );
}

// async function retrieveUserInfo(accessToken) {
//   try {
//     const response = await fetch(`${API_URL}/user`, {
//       method: "GET",
//       headers: {
//         "Content-Type": "application/json",
//         Authorization: `Bearer ${accessToken}`,
//       },
//     });

//     if (response.ok) {
//       const json = await response.json();
//       return json.body;
//     }
//   } catch (error) {
//     console.log("Error retrieving user info:", error);
//   }
// }

export const useAuth = () => useContext(AuthContext);
