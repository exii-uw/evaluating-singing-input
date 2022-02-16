import React from 'react';
import { TaskTarget } from './target';
import { RecognizerMap } from '../../../utils/rxjs/recognizers/universalRecognizer';
import SingTasks from './SingTasks';
import { useLocation } from 'react-router-dom';
import { defaultSustainLength } from '../../detector/shared';

interface Props {
    header: string;
    targets: TaskTarget[];
    recognizers: RecognizerMap;
}

const RoutedSingTasks = (props: Props): React.ReactElement<Props> => {
    const location = useLocation();
    const query = new URLSearchParams(location.search);
    const maxAttempts = +(query.get('maxAttempts') || '1');
    const withPrompts = query.get('withPrompts') === 'true';
    const withInitialPrompts = query.get('withInitialPrompts') === 'true';
    const hideFeedback = query.get('hideFeedback') === 'true';
    const hasBackground = query.get('hasBackground') !== 'false';
    const sustainLength = +(query.get('sustainLength') || `${defaultSustainLength}`);
    return (
        <SingTasks
            {...props}
            maxAttempts={maxAttempts}
            withPrompts={withPrompts}
            withInitialPrompts={withInitialPrompts}
            hideFeedback={hideFeedback}
            hasBackground={hasBackground}
            sustainLength={sustainLength}
        />
    );
};

export default RoutedSingTasks;
