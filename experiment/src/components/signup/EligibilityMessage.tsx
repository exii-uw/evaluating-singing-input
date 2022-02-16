import MessagePage from '../tasks/message/MessagePage';
import React from 'react';
import { listParticipants } from '../../utils/clients/participantsClient';
import { numMusicalParticipants, numNonmusicalParticipants } from '../study/eligibility';

interface Props {
    isMusical: boolean;
    header: string;
    onComplete: () => void;
}

const EligibilityMessage = ({ isMusical, header, onComplete }: Props) => {
    const [isEligible, setIsEligible] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(true);
    React.useEffect(() => {
        setIsLoading(true);
        const sub = listParticipants().subscribe((participants) => {
            if (isMusical) setIsEligible(participants.musical.length < numMusicalParticipants);
            else setIsEligible(participants.nonmusical.length < numNonmusicalParticipants);
            setIsLoading(false);
        });

        return () => sub.unsubscribe();
    }, [isMusical]);

    const message = isLoading
        ? 'Loading...'
        : isEligible
        ? 'You are eligible to participate in the study!'
        : `We already have enough ${
              isMusical ? 'singer' : 'non-singer'
          } participants for this study, so you are not currently eligible to participate in the study. However, if you continue the sign up process, we will contact you if and when we are looking for more participants.`;

    return <MessagePage header={header} title="Study Eligibility" isLoading={isLoading} text={message} onComplete={onComplete} />;
};

export default EligibilityMessage;
