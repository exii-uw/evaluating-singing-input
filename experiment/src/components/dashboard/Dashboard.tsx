import React from 'react';
import Page from '../page/Page';
import Typography from '@material-ui/core/Typography';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Theme } from '../theme';
import StudyCard, { StudyStatus } from './StudyCard';
import { StudyProps } from '../study/Study';
import Skeleton from '@material-ui/lab/Skeleton';
import { generatePath, useHistory } from 'react-router-dom';
import { HOME_ROUTE, SIGNIN_ROUTE, STUDY_ROUTE } from '../../routes';
import { allStudies } from '../study/studyProps/allStudies';
import Button from '@material-ui/core/Button';
import { getAuth } from 'firebase/auth';
import { getAllStudies } from '../../utils/clients/studyClient';
import { combineLatest } from 'rxjs';
import { getParticipant } from '../../utils/clients/participantsClient';
import { numMusicalParticipants, numNonmusicalParticipants } from '../study/eligibility';
import { Card } from '@material-ui/core';

const useStyles = makeStyles<Theme>((theme) => ({
    header: {
        margin: theme.spacing(5, 0, 2)
    },
    done: {
        boxSizing: 'border-box',
        width: '100%',
        minHeight: '9rem',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: theme.spacing(3)
    },
    skeleton: {
        width: '100%',
        height: '9rem',
        margin: theme.spacing(2, 0)
    }
}));

const defaultStatus = (status: StudyStatus): Record<string, StudyStatus> =>
    allStudies.reduce((acc, study) => ({ ...acc, [study.id]: status }), {});

const Dashboard = (): React.ReactElement => {
    const classes = useStyles();
    const history = useHistory();
    const [loading, setLoading] = React.useState(true);
    const [updatedSinceSignup, setUpdatedSinceSignup] = React.useState(false);
    const [isEligible, setIsEligible] = React.useState(true);
    const [status, setStatus] = React.useState<Record<string, StudyStatus>>(defaultStatus(StudyStatus.LOCKED));

    React.useEffect(() => {
        const sub = combineLatest([getParticipant(), getAllStudies()]).subscribe({
            next: ([participant, studies]) => {
                if (
                    (participant.isMusical && participant.idx >= numMusicalParticipants) ||
                    (!participant.isMusical && participant.idx >= numNonmusicalParticipants)
                ) {
                    setIsEligible(false);
                    setStatus(defaultStatus(StudyStatus.LOCKED));
                } else {
                    setIsEligible(true);

                    // Set completed according to the results
                    const newStatus = defaultStatus(StudyStatus.AVAILABLE);
                    Object.values(studies).forEach((study) => {
                        newStatus[study.studyId] = studies[study.studyId].isDone ? StudyStatus.COMPLETED : StudyStatus.IN_PROGRESS;
                    });

                    // Deal with dependencies. We assume allStudies has already been top-sorted.
                    allStudies.forEach((study) => {
                        study.dependencies.forEach((depId) => {
                            if (newStatus[depId] !== StudyStatus.COMPLETED) {
                                newStatus[study.id] = StudyStatus.LOCKED;
                            }
                        });
                    });
                    setStatus(newStatus);
                }

                setLoading(false);
            },
            error: (err) => {
                if (
                    err.message === 'participants document does not exist' ||
                    err.message.includes('participants document does not have a user')
                ) {
                    setUpdatedSinceSignup(true);
                    setLoading(false);
                } else if (err.name === 'TimeoutError') history.push(`${SIGNIN_ROUTE}?next=${history.location.pathname}`);
                else console.error('Critical error retrieving data from database:', err.message);
            }
        });

        return () => sub.unsubscribe();
    }, [history]);

    const startStudy = (studyId: string) => {
        const path = generatePath(STUDY_ROUTE, { studyId });
        history.push(path);
    };

    const renderStudies = (studies: StudyProps[]) =>
        studies.map((study) => <StudyCard key={study.id} {...study} status={status[study.id]} onStart={() => startStudy(study.id)} />);

    const inProgressStudies = allStudies.filter((s) => status[s.id] === StudyStatus.IN_PROGRESS);
    const availableStudies = allStudies.filter((s) => status[s.id] === StudyStatus.AVAILABLE);
    const lockedStudies = allStudies.filter((s) => status[s.id] === StudyStatus.LOCKED);
    const completedStudies = allStudies.filter((s) => status[s.id] === StudyStatus.COMPLETED);

    const signOutButton = (
        <Button
            onClick={() => {
                getAuth().signOut();
                history.push(HOME_ROUTE);
            }}
        >
            Sign Out
        </Button>
    );

    return (
        <Page header="Dashboard" buttons={signOutButton} title="Dashboard">
            {(inProgressStudies.length > 0 || availableStudies.length > 0) && (
                <Typography>Continue the study with the tasks below.</Typography>
            )}
            {loading ? (
                <>
                    <Typography variant="h5" className={classes.header}>
                        Loading...
                    </Typography>
                    {allStudies.map((study) => (
                        <Skeleton key={study.id} variant="rect" className={classes.skeleton} />
                    ))}
                </>
            ) : updatedSinceSignup ? (
                <>
                    <Typography variant="h5" className={classes.header}>
                        Oops! 🙈
                    </Typography>
                    <Typography className={classes.desc}>
                        It looks like the study has been updated since you signed up. For assistance, contact the experiment facilitator{' '}
                        <a href="mailto:gzinck@uwaterloo.ca?subject = Sing UI">gzinck@uwaterloo.ca</a>
                    </Typography>
                </>
            ) : !isEligible ? (
                <>
                    <Typography variant="h5" className={classes.header}>
                        Sorry! 😬
                    </Typography>
                    <Typography className={classes.desc}>
                        As mentioned when you signed up, you are not currently eligible to perform the study. You will receive an email if
                        and when you are eligible.
                    </Typography>
                </>
            ) : (
                <>
                    {inProgressStudies.length > 0 || availableStudies.length > 0 ? (
                        <>
                            <Typography variant="h5" className={classes.header}>
                                Up next
                            </Typography>
                            {renderStudies(inProgressStudies)}
                            {renderStudies(availableStudies)}
                            {renderStudies(lockedStudies)}
                        </>
                    ) : (
                        <Card className={classes.done}>
                            <Typography>
                                Woohoo! 🎉 You have completed the study. If you have not been contacted by an experiment facilitator within
                                one week, email <a href="mailto:gzinck@uwaterloo.ca?subject = Sing UI">gzinck@uwaterloo.ca</a> to arrange
                                your remuneration.
                            </Typography>
                        </Card>
                    )}
                    {completedStudies.length > 0 && (
                        <>
                            <Typography variant="h5" className={classes.header}>
                                Completed
                            </Typography>
                            {renderStudies(completedStudies)}
                        </>
                    )}
                </>
            )}
        </Page>
    );
};

export default Dashboard;
