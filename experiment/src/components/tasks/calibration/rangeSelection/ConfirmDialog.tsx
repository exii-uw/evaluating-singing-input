import Dialog from '@material-ui/core/Dialog';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogActions from '@material-ui/core/DialogActions';
import Button from '@material-ui/core/Button';

interface Props {
    header: string;
    text: string;
    onClose: () => void;
    open: boolean;
    closeText: string;
    confirmText: string;
    onConfirm: () => void;
}

const ConfirmDialog = ({ header, text, onClose, open, closeText, confirmText, onConfirm }: Props) => {
    return (
        <Dialog open={open} onClose={onClose}>
            <DialogTitle>{header}</DialogTitle>
            <DialogContent>
                <DialogContentText>{text}</DialogContentText>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>{closeText}</Button>
                <Button onClick={onConfirm}>{confirmText}</Button>
            </DialogActions>
        </Dialog>
    );
};

export default ConfirmDialog;
