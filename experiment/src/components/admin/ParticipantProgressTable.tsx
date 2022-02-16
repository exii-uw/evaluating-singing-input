import React from 'react';
import { getAllStudiesForAllUsers, UserData } from '../../utils/clients/studyClient';
import { useHistory } from 'react-router-dom';
import { HOME_ROUTE } from '../../routes';
import Table from './Table';
import { allStudies } from '../study/studyProps/allStudies';
import ButtonBox from '../common/ButtonBox';
import ToggleButtons from './ToggleButtons';
import { numMusicalParticipants, numNonmusicalParticipants } from '../study/eligibility';

enum MusicalViewOption {
    ALL = 'ALL',
    MUSICAL = 'MUSICAL',
    NONMUSICAL = 'NONMUSICAL'
}
enum EligibleViewOption {
    ALL = 'ALL',
    ELIGIBLE = 'ELIGIBLE',
    INELIGIBLE = 'INELIGIBLE'
}

interface ShowOptions {
    musical: MusicalViewOption;
    eligible: EligibleViewOption;
}

const studyLengths = allStudies.map((study) => ({ id: study.id, length: study.getTasks(0).length }));

const toCell = (str: string) => ({ id: str, elem: str });
const toRows = (users: UserData[]) =>
    users.map((user) => ({
        id: user.uid,
        cells: [
            ...[user.isMusical ? '✅' : '❌', `${user.idx}`, `${user.uid}`].map((str) => ({
                id: `${user.uid}-${str}`,
                elem: str
            })),
            ...studyLengths.map((study) => ({
                id: study.id,
                elem: user.data[study.id]
                    ? user.data[study.id].isDone
                        ? '✅'
                        : `${Math.round(((user.data[study.id].nextIdx - 1) / study.length) * 100)}%`
                    : '❌'
            }))
        ]
    }));

const ParticipantProgressTable = () => {
    const history = useHistory();
    const [userData, setUserData] = React.useState<UserData[]>([]);
    const [isLoading, setIsLoading] = React.useState(true);
    const [showOptions, setShowOptions] = React.useState<ShowOptions>({ musical: MusicalViewOption.ALL, eligible: EligibleViewOption.ALL });

    React.useEffect(() => {
        setIsLoading(true);
        const sub = getAllStudiesForAllUsers().subscribe({
            next: (users) => setUserData(users),
            complete: () => setIsLoading(false),
            error: () => history.push(HOME_ROUTE)
        });
        return () => sub.unsubscribe();
    }, [history]);

    const filteredData = userData
        .filter((data) => {
            // Filter out ineligible people
            if (showOptions.eligible === EligibleViewOption.ELIGIBLE) {
                if (data.isMusical && data.idx >= numMusicalParticipants) return false;
                if (!data.isMusical && data.idx >= numNonmusicalParticipants) return false;
            }
            // Filter out eligible people
            if (showOptions.eligible === EligibleViewOption.INELIGIBLE) {
                if (data.isMusical && data.idx < numMusicalParticipants) return false;
                if (!data.isMusical && data.idx < numNonmusicalParticipants) return false;
            }
            // Filter out non-musical
            if (showOptions.musical === MusicalViewOption.MUSICAL) {
                if (!data.isMusical) return false;
            }
            // Filter out musical
            if (showOptions.musical === MusicalViewOption.NONMUSICAL) {
                if (data.isMusical) return false;
            }
            return true;
        })
        .sort((a, b) => {
            if (a.isMusical && !b.isMusical) return -1;
            if (!a.isMusical && b.isMusical) return 1;
            return b.idx - a.idx;
        });

    return (
        <>
            <ButtonBox>
                <ToggleButtons
                    options={Object.values(MusicalViewOption).map((opt) => ({ id: opt, content: opt }))}
                    value={showOptions.musical}
                    setValue={(musical: MusicalViewOption) => setShowOptions((opts) => ({ ...opts, musical }))}
                />
                <ToggleButtons
                    options={Object.values(EligibleViewOption).map((opt) => ({ id: opt, content: opt }))}
                    value={showOptions.eligible}
                    setValue={(eligible: EligibleViewOption) => setShowOptions((opts) => ({ ...opts, eligible }))}
                />
            </ButtonBox>
            <Table
                header={['Musical', 'Index', 'User ID', ...allStudies.map((s) => s.name)].map((c) => toCell(c))}
                rows={toRows(filteredData)}
                headerCols={3}
                isLoading={isLoading}
            />
        </>
    );
};

export default ParticipantProgressTable;
