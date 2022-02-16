import React from 'react';
import { Redirect, useParams } from 'react-router-dom';
import { allStudies } from './studyProps/allStudies';
import { DASHBOARD_ROUTE } from '../../routes';
import Study from './Study';

const RoutedStudy = (): React.ReactElement => {
    const { studyId } = useParams<{ studyId: string }>();
    const study = allStudies.find((study) => study.id === studyId);

    if (!study) {
        return <Redirect push to={DASHBOARD_ROUTE} />;
    }

    return <Study {...study} />;
};

export default RoutedStudy;
