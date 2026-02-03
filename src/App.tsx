import React from "react";
import { Route, Redirect } from "react-router-dom";
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { homeOutline, gridOutline, clipboardOutline, bookOutline } from "ionicons/icons";

/* Pages */
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import Assignment from "./pages/Assignment";
import Settings from "./pages/Settings";
import Notes from "./pages/LectureNotes";
import LectureDetail from "./pages/LectureDetail";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import ConfirmEmail from "./pages/ConfirmEmail";
import VerifyEmail from "./pages/VerifyEmail";
import Admin from "./pages/Admin";

/* Auth */
import { AuthProvider, useAuth } from "./AuthContext";
import PrivateRoute from "./pages/PrivateRoute";

/* Ionic CSS */
import "@ionic/react/css/core.css";
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";
import "@ionic/react/css/padding.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";
import "@ionic/react/css/palettes/dark.system.css";
import "./theme/variables.css";

setupIonicReact();

const App: React.FC = () => {
  const { user } = useAuth();

  return (
    <AuthProvider>
      <IonApp>
       <IonReactRouter>
  <IonTabs>
    <IonRouterOutlet>
      {/* PUBLIC ROUTES */}
      <Route exact path="/home" component={Home} />
      <Route exact path="/login" component={Login} />
      <Route exact path="/register" component={Register} />
      <Route exact path="/forgot-password" component={ForgotPassword} />
      <Route exact path="/confirm-email" component={ConfirmEmail} />
      <Route exact path="/verify-email" component={VerifyEmail} />
      <Route exact path="/lecture/:id" component={LectureDetail} />

      {/* PROTECTED ROUTES */}
      <PrivateRoute exact path="/dashboard" component={Dashboard} />
      <PrivateRoute exact path="/assignment" component={Assignment} />
      <PrivateRoute exact path="/notes" component={Notes} />
      <PrivateRoute exact path="/profile" component={Profile} />
      <PrivateRoute exact path="/settings" component={Settings} />

      {/* ADMIN (no tabs) */}
      <Route exact path="/me-check" component={Admin} />


      {/* DEFAULT */}
      <Route exact path="/">
        <Redirect to="/home" />
      </Route>
    </IonRouterOutlet>

    {/* BOTTOM TABS */}
    <IonTabBar slot="bottom">
      <IonTabButton tab="home" href="/home">
        <IonIcon icon={homeOutline} />
        <IonLabel>Home</IonLabel>
      </IonTabButton>

      <IonTabButton tab="dashboard" href="/dashboard">
        <IonIcon icon={gridOutline} />
        <IonLabel>Dashboard</IonLabel>
      </IonTabButton>

      <IonTabButton tab="assignment" href="/assignment">
        <IonIcon icon={clipboardOutline} />
        <IonLabel>Assignment</IonLabel>
      </IonTabButton>

      <IonTabButton tab="notes" href="/notes">
        <IonIcon icon={bookOutline} />
        <IonLabel>Lecture Notes</IonLabel>
      </IonTabButton>
    </IonTabBar>
  </IonTabs>
</IonReactRouter>

      </IonApp>
    </AuthProvider>
  );
};

export default App;
