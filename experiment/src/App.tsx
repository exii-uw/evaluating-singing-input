import React from 'react';
import { ThemeProvider } from '@material-ui/core/styles';
import { theme } from './components/theme';
import { BrowserRouter as Router, Redirect, Route, Switch } from 'react-router-dom';
import {
    ADMIN_ROUTE,
    AUDIO_TEST_PHONE_ROUTE,
    AUDIO_TEST_ROUTE,
    CALIBRATE_ROUTE,
    DASHBOARD_ROUTE,
    HOME_ROUTE,
    INTERVAL_TASKS_ROUTE,
    MELODY_TASKS_ROUTE,
    RELATIVE_PITCH_TASKS_ROUTE,
    SIGNIN_ROUTE,
    SIGNUP_ROUTE,
    STUDY_ROUTE,
    TEST_FORM_ROUTE,
    TUNER_ROUTE,
    UNIVERSAL_TASKS_ROUTE
} from './routes';
import Tuner from './components/tasks/tuner/Tuner';
import { allTasksProps, intervalTaskProps, melodyTaskProps, pitchTaskProps } from './components/tasks/sing/possibleTasks';
import { audioContext, defaultAudioContext } from './components/audio/audioContext';
import Form from './components/tasks/form/Form';
import LoginPage from './components/auth/LoginPage';
import Dashboard from './components/dashboard/Dashboard';
import { testForm } from './components/tasks/form/testForm';
import RoutedStudy from './components/study/RoutedStudy';
import RoutedSingTasks from './components/tasks/sing/RoutedSingTasks';
import RecordPage from './components/tasks/record/RecordPage';
import Calibration from './components/tasks/calibration/Calibration';
import SinePage from './components/audioTest/sineMaker/SinePage';
import AudioTestPage from './components/audioTest/AudioTestPage';
import HomePage from './components/home/HomePage';
import SignUpPage from './components/signup/SignUpPage';
import AdminPage from './components/admin/AdminPage';
import { setupFirebase } from './setup';

setupFirebase();

function App() {
    return (
        <audioContext.Provider value={defaultAudioContext}>
            <ThemeProvider theme={theme}>
                <Router>
                    <Switch>
                        {/* Routes that do not require Chrome */}
                        <Route path={AUDIO_TEST_PHONE_ROUTE} component={SinePage} />
                        <Route exact path={HOME_ROUTE} component={HomePage} />
                        {navigator.userAgent.indexOf('Chrome') === -1 && <Redirect to={HOME_ROUTE} />}

                        {/* Routes that do require Chrome */}
                        <Route path={TUNER_ROUTE} component={Tuner} />
                        <Route path={AUDIO_TEST_ROUTE} component={AudioTestPage} />
                        <Route path={RELATIVE_PITCH_TASKS_ROUTE}>
                            <RoutedSingTasks {...pitchTaskProps} />
                        </Route>
                        <Route path={INTERVAL_TASKS_ROUTE}>
                            <RoutedSingTasks {...intervalTaskProps} />
                        </Route>
                        <Route path={MELODY_TASKS_ROUTE}>
                            <RoutedSingTasks {...melodyTaskProps} />
                        </Route>
                        <Route path={UNIVERSAL_TASKS_ROUTE}>
                            <RoutedSingTasks {...allTasksProps} />
                        </Route>
                        <Route path={CALIBRATE_ROUTE}>
                            <Calibration />
                        </Route>
                        <Route path={TEST_FORM_ROUTE}>
                            <Form header="Test form" form={testForm} />
                        </Route>
                        <Route path={SIGNUP_ROUTE}>
                            <SignUpPage />
                        </Route>
                        <Route path={SIGNIN_ROUTE}>
                            <LoginPage userExists={true} hasOppositeButton={true} />
                        </Route>
                        <Route path={DASHBOARD_ROUTE}>
                            <Dashboard />
                        </Route>
                        <Route path="/record">
                            <RecordPage />
                        </Route>
                        <Route path={ADMIN_ROUTE} component={AdminPage} />
                        <Route path={STUDY_ROUTE} component={RoutedStudy} />
                        <Redirect to={HOME_ROUTE} />
                    </Switch>
                </Router>
            </ThemeProvider>
        </audioContext.Provider>
    );
}

export default App;
