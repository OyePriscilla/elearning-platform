import React from 'react';
import { Route, Redirect } from 'react-router-dom';
import {
  IonApp, IonIcon, IonLabel, IonRouterOutlet, IonTabBar, IonTabButton, IonTabs, setupIonicReact
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { ellipse, square, triangle } from 'ionicons/icons';
import {
  homeOutline,
  gridOutline,
  clipboardOutline,
  bookOutline
} from 'ionicons/icons';

/* Pages */
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Assignment from './pages/Assignment';
import Settings from './pages/Settings';
import Notes from './pages/LectureNotes';
import LectureDetail from './pages/LectureDetail';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import ConfirmEmail from './pages/ConfirmEmail';

/* Auth */
import { AuthProvider, useAuth } from './AuthContext';
import PrivateRoute from './pages/PrivateRoute';

/* Ionic CSS imports */
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';
import '@ionic/react/css/palettes/dark.system.css';
import './theme/variables.css';
import VerifyEmail from './pages/VerifyEmail';

setupIonicReact();

const AppTabs: React.FC = () => {
  const { user } = useAuth();

  return (
    <IonTabs>
      <IonRouterOutlet>
        {/* Public Routes */}
        <Route exact path="/home" component={Home} />
        <Route exact path="/login" component={Login} />
        <Route exact path="/register" component={Register} />
        <Route exact path="/forgot-password" component={ForgotPassword} />
        <Route exact path="/confirm-email" component={ConfirmEmail} />
        <Route path="/lecture/:id" component={LectureDetail} exact />
        <Route exact path="/verify-email" component={VerifyEmail} />




        {/* Protected Routes */}
        <PrivateRoute exact path="/dashboard" component={Dashboard} />
        <PrivateRoute exact path="/profile" component={Profile} />
        <PrivateRoute exact path="/assignment" component={Assignment} />
        <PrivateRoute exact path="/settings" component={Settings} />
        <PrivateRoute exact path="/notes" component={Notes} />
        <PrivateRoute exact path="/lecture-detail" component={LectureDetail} />

        {/* Default */}
        <Route exact path="/" render={() => <Redirect to="/home" />} />
      </IonRouterOutlet>
<IonTabBar slot="bottom">
  <IonTabButton tab="home" href="/home" disabled={!user?.emailVerified}>
    <IonIcon icon={homeOutline} />
    <IonLabel>Home</IonLabel>
  </IonTabButton>

  <IonTabButton tab="dashboard" href="/dashboard" disabled={!user?.emailVerified}>
    <IonIcon icon={gridOutline} />
    <IonLabel>Dashboard</IonLabel>
  </IonTabButton>

  <IonTabButton tab="assignment" href="/assignment" disabled={!user?.emailVerified}>
    <IonIcon icon={clipboardOutline} />
    <IonLabel>Assignment</IonLabel>
  </IonTabButton>

  <IonTabButton tab="notes" href="/notes" disabled={!user?.emailVerified}>
    <IonIcon icon={bookOutline} />
    <IonLabel>Lecture Notes</IonLabel>
  </IonTabButton>
</IonTabBar>
    </IonTabs>
  );
};

const App: React.FC = () => (
  <AuthProvider>
    <IonApp>
      <IonReactRouter>
        <AppTabs />
      </IonReactRouter>
    </IonApp>
  </AuthProvider>
);

export default App;
