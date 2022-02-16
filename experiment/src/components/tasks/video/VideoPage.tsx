import MessagePage, { MessageProps } from '../message/MessagePage';
import YoutubeEmbed from './YoutubeEmbed';
import React from 'react';
import Button from '@material-ui/core/Button';

export interface VideoProps extends MessageProps {
    embedID: string;
    openVideoText?: string;
    startHidden?: boolean;
}

const VideoPage = (props: VideoProps): React.ReactElement<VideoProps> => {
    const [isHidden, setIsHidden] = React.useState(true);
    const buttons =
        props.startHidden && isHidden ? (
            <>
                <Button onClick={() => setIsHidden((h) => !h)}>{props.openVideoText || 'Rewatch tutorial video'}</Button>
                {props.buttons}
            </>
        ) : (
            props.buttons
        );
    return (
        <MessagePage {...props} buttons={buttons}>
            {(!props.startHidden || !isHidden) && <YoutubeEmbed embedID={props.embedID} title={props.title || props.header} margin={2} />}
        </MessagePage>
    );
};

export default VideoPage;
