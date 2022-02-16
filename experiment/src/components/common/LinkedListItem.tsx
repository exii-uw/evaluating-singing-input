import React, { Ref } from 'react';
import ListItem from '@material-ui/core/ListItem';
import { Link } from 'react-router-dom';

interface LinkedListItemProps {
    children: React.ReactNode;
    to: string;
}

const LinkedListItem = (props: LinkedListItemProps): React.ReactElement<LinkedListItemProps> => {
    const Lnk = React.useMemo(() => React.forwardRef((linkProps, ref: Ref<any>) => <Link ref={ref} to={props.to} {...linkProps} />), [
        props.to
    ]);

    return (
        <ListItem button component={Lnk}>
            {props.children}
        </ListItem>
    );
};

export default LinkedListItem;
