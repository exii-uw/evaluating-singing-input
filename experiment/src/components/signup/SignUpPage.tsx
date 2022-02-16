import React from 'react';
import ConsentPage from './ConsentPage';
import AudioTestPage from '../audioTest/AudioTestPage';
import MessagePage from '../tasks/message/MessagePage';
import LoginPage from '../auth/LoginPage';
import ProgressBar from '../study/progress/ProgressBar';
import { SingTaskResult } from '../../utils/rxjs/taskProgress';
import { TaskTarget } from '../tasks/sing/target';
import { setSetupData } from '../../utils/clients/setupClient';
import { useHistory } from 'react-router-dom';
import { DASHBOARD_ROUTE } from '../../routes';
import MusicalityForm from './MusicalityForm';
import { combineLatest } from 'rxjs';
import { setParticipant } from '../../utils/clients/participantsClient';
import EligibilityMessage from './EligibilityMessage';

const maxStage = 5;

const SignUpPage = (): React.ReactElement => {
    const history = useHistory();
    const [stage, setStage] = React.useState(0);
    const [musicality, setMusicality] = React.useState<Record<string, string | string[]>>({});
    const [isMusical, setIsMusical] = React.useState<boolean>(false);
    const [audioTest, setAudioTest] = React.useState<SingTaskResult<TaskTarget>[]>([]);
    const [consent, setConsent] = React.useState<Record<string, string | string[]>>({});

    const onComplete = () => {
        // First, submit the new user consent record
        combineLatest([setSetupData({ audioTest, consent, musicality, isMusical }), setParticipant(isMusical)]).subscribe({
            complete: () => history.push(DASHBOARD_ROUTE)
        });
    };

    let page;
    switch (stage) {
        case 0:
            page = (
                <MessagePage
                    header="Sign Up"
                    text="In the following 4 steps, you will answer a question about your musical ability, perform a one-minute system test, sign a consent form, and create your user credentials."
                    onComplete={() => setStage((s) => s + 1)}
                />
            );
            break;
        case 1:
            page = (
                <MusicalityForm
                    header="Sign Up"
                    onComplete={(isMusical, results) => {
                        setMusicality(results);
                        setIsMusical(isMusical);
                        setStage((s) => s + 1);
                    }}
                />
            );
            break;
        case 2:
            page = <EligibilityMessage header="Sign Up" isMusical={isMusical} onComplete={() => setStage((s) => s + 1)} />;
            break;
        case 3:
            page = (
                <AudioTestPage
                    header="Sign Up"
                    onComplete={(data) => {
                        setAudioTest(data);
                        setStage((s) => s + 1);
                    }}
                />
            );
            break;
        case 4:
            page = (
                <ConsentPage
                    header="Sign Up"
                    onComplete={(answers) => {
                        setConsent(answers);
                        setStage((s) => s + 1);
                    }}
                />
            );
            break;
        default:
            page = <LoginPage userExists={false} onComplete={onComplete} />;
    }
    return (
        <>
            {page}
            <ProgressBar progress={(stage / maxStage) * 100} />
        </>
    );
};

export default SignUpPage;
