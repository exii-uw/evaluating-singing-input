import React from 'react';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { Theme } from '../../theme';

interface Props {
    embedID: string;
    title?: string;
    margin?: number;
}

const useStyles = makeStyles<Theme, Props>((theme) => ({
    root: ({ margin }) => ({
        overflow: 'hidden',
        paddingBottom: '56.25%',
        position: 'relative',
        height: 0,
        width: '100%',
        margin: theme.spacing(margin || 0, 0)
    }),
    iframe: {
        position: 'absolute',
        left: 0,
        top: 0,
        width: '100%',
        height: '100%'
    }
}));

const YoutubeEmbed = (props: Props): React.ReactElement<Props> => {
    const classes = useStyles(props);
    return (
        <div className={classes.root}>
            <iframe
                className={classes.iframe}
                src={`https://www.youtube.com/embed/${props.embedID}?autoplay=1&modestbranding=1`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={props.title || 'Embedded youtube'}
            />
        </div>
    );
};

export default YoutubeEmbed;
