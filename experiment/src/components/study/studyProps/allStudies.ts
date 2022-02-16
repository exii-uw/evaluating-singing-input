import { pitchStudyProps } from './experiment1/pitchStudy';
import { setupStudyProps } from './experiment1/setupStudy';
import { intervalStudyProps } from './experiment1/intervalStudy';
import { melodyStudyProps } from './experiment1/melodyStudy';

// This must be topologically sorted in terms of dependencies. The first item
// cannot have any dependencies.
export const allStudies = [setupStudyProps, pitchStudyProps, intervalStudyProps, melodyStudyProps];
