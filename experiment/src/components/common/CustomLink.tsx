import React, { Ref } from 'react';
import Button from '@material-ui/core/Button';
import { Link } from 'react-router-dom';

interface CustomLinkProps {
    children: React.ReactNode;
    to: string;
}

const CustomLink = (props: CustomLinkProps): React.ReactElement<CustomLinkProps> => {
    const Lnk = React.useMemo(() => React.forwardRef((linkProps, ref: Ref<any>) => <Link ref={ref} to={props.to} {...linkProps} />), [
        props.to
    ]);

    return <Button component={Lnk}>{props.children}</Button>;
};

export default CustomLink;
