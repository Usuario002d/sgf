import React from "react";
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Paper from '@material-ui/core/Paper';
import OutlinedInput from "@material-ui/core/OutlinedInput";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Typography from '@material-ui/core/Typography';
import SelectField from "@material-ui/core/Select";
import MenuItem from '@material-ui/core/MenuItem';
import TableComponent from "components/Table/TableComponent";
import Button from '@material-ui/core/Button';
import FormGroup from "@material-ui/core/FormGroup";
import FormLabel from "@material-ui/core/FormLabel";
import Box from "@material-ui/core/Box";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import Slide from "@material-ui/core/Slide";
// @material-ui/icons components
import Clear from "@material-ui/icons/Clear";
import Slide from "@material-ui/core/Slide";
import { FormClasses, FormControlLabelClasses } from "../Styles"

const formStyles = makeStyles(FormClasses);
const formControllLabelStyles = makeStyles(FormControlLabelClasses);

const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="down" ref={ref} {...props} />;
});

/**
 * Adicionar encarregado
 * 
 * Gautchi R. Chambe (chambegautchi@gmail.com)
 */
export default function FormStep2({ childToParent, parentData }) {

    const formClasses = formStyles();
    const formControlClasses = formControllLabelStyles();

    const { requiredFields, kinshipTypes } = parentData;
    const [errors, setErrors] = React.useState(requiredFields);
    const [formFields, setFormFields] = React.useState({});
    const [sponsors, setSponsors] = React.useState([]);

    React.useEffect(() => {
        if (parentData.dto.sponsors && parentData.dto.sponsors.lenth !== 0) {
            setSponsors(parentData.dto.sponsors)
        }
    }, [parentData.dto.sponsors]);

    const [open, setOpen] = React.useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };
    return (
        <>
            <Paper className={formClasses.paper}>
                <Button variant="outlined" color="primary" onClick={handleClickOpen}>
                    Slide in alert dialogHeader </Button>
                <Dialog
                    open={open}
                    TransitionComponent={Transition}
                    keepMounted
                    onClose={handleClose}
                    aria-labelledby="alert-dialog-slide-title"
                    aria-describedby="alert-dialog-slide-description"
                >
                    <div className={classes.dialogHeader}>
                        <Typography
                            variant="h5"
                            component="h5"
                            className={classes.dialogTitle}
                        >
                            New message to undefined
          </Typography>
                        <IconButton onClick={handleClose}>
                            <Clear />
                        </IconButton>
                    </div>
                    <DialogContent>...</DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose} color="secondary" variant="contained">
                            Close
          </Button>
                        <Button onClick={handleClose} color="primary" variant="contained">
                            Save changes
          </Button>
                    </DialogActions>
                </Dialog>

            </Paper>
        </>
    );
}