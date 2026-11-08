import React from "react";
import { makeStyles, useTheme } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Box from '@material-ui/core/Box';
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import Typography from "@material-ui/core/Typography";
import Slide from "@material-ui/core/Slide";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import CardBody from "components/Card/CardBody.js";
import OutlinedInput from "@material-ui/core/OutlinedInput";

import FormGroup from "@material-ui/core/FormGroup";
import FormLabel from "@material-ui/core/FormLabel";
import { FormClasses, FormControlLabelClasses } from "../../Styles"


const formStyles = makeStyles(FormClasses);
const formControllLabelStyles = makeStyles(FormControlLabelClasses);
const Transition = React.forwardRef(function Transition(props, ref) {
    return <Slide direction="down" ref={ref} {...props} />;
});
const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            width: 250,
        },
    },
};

function getStyles(option, selected, theme) {
    return {
        fontWeight:
            selected.indexOf(option) === -1
                ? theme.typography.fontWeightRegular
                : theme.typography.fontWeightMedium,
    };
}

/**
 * Adicionar/configurar disciplinas em uma classe
 * 
 * Gautchi R. Chambe (chambegautchi@gmail.com)
 */
export default function AddBudject({ show, handleClose, accountPlan, accountPlans, childToParent }) {
    const theme = useTheme();
    const formClasses = formStyles();
    const formControlClasses = formControllLabelStyles();

    const requiredFields = ['initial_alocation'];
    const [errors, setErrors] = React.useState(requiredFields);
    const [initial_allocation, setInitialAllocation] = React.useState(accountPlan.initial_allocation);

    const handleChangeBudject = (e) => {
        /*----Update parent Data -----------*/
        if (!isNaN(initial_allocation)) {
            accountPlans.map((rowVar) => {
                if (accountPlan.id === rowVar.id) {
                    rowVar.initial_allocation = initial_allocation;
                }
            });
            childToParent({ dtos: accountPlans, action: "CREATE" });
            handleClose();
            setInitialAllocation(0);
        }
    };

    const handleInputValue = (e) => {

        let { name, value } = e.target;
        if (!isNaN(value)) {
            setInitialAllocation(parseFloat(value));
        } else { e.value = "" }
    };

    return (
        <Dialog
            open={show}
            TransitionComponent={Transition}
            keepMounted
            onClose={handleClose}
            aria-labelledby="alert-dialog-slide-title"
            aria-describedby="alert-dialog-slide-description"
            maxWidth='md'>

            <DialogContent>
                <Card>
                    <CardHeader color="primary">
                        <h4 className={formClasses.cardTitle}>{"Adição do Orcamento"}</h4>
                        <p className={formClasses.cardCategory}>{"adiçao/actualização do valor do orcamento"}</p>
                    </CardHeader >
                    <CardBody >

                        <List className={formClasses.root}>

                            <ListItem >
                                <Box display="flex" alignItems="center"
                                    borderTop={1} borderColor="gray"
                                    borderBottom={1} border={1} width={800} height={80}
                                >
                                    <FormGroup classes={formControlClasses}>
                                        <FormControlLabel
                                            label={<Typography >Ano Fiscal: </Typography>}
                                            labelPlacement="start"
                                            classes={formControlClasses}
                                            control={
                                                <FormLabel classes={{ root: formControlClasses.label }} ></FormLabel>
                                            }
                                        />
                                        <FormControlLabel
                                            label={<Typography >Código: </Typography>}
                                            labelPlacement="start"
                                            classes={formControlClasses}
                                            control={
                                                <FormLabel classes={{ root: formControlClasses.label }} >
                                                    {accountPlan.account_number}
                                                </FormLabel>
                                            }
                                        />
                                        <FormControlLabel
                                            label={<Typography >Designação : </Typography>}
                                            labelPlacement="start"
                                            classes={formControlClasses}
                                            control={
                                                <FormLabel classes={{ root: formControlClasses.label }} >{accountPlan.description}</FormLabel>
                                            }
                                        />
                                    </FormGroup>
                                </Box>
                            </ListItem>
                            <ListItem>

                                <FormGroup>
                                    <FormControlLabel
                                        label={<Typography >Dotação inicial: </Typography>}
                                        labelPlacement="start"
                                        classes={formControlClasses}
                                        control={<OutlinedInput key="initial_deduction" name="initial_deduction" autoComplete="none" color="primary"
                                            margin="dense"
                                            classes={{ input: formControlClasses.input }}
                                            onBlur={handleInputValue}
                                            onChange={handleInputValue}
                                            value={accountPlan.initial_allocation}
                                        />}
                                    />
                                </FormGroup>

                            </ListItem>
                        </List>



                    </CardBody>
                </Card>
            </DialogContent>

            <DialogActions>
                <Button variant="contained"
                    onClick={handleClose}
                    color="secondary"
                >
                    Cancelar
                </Button>
                <Button variant="contained"
                    onClick={handleChangeBudject}
                    color="primary"
                >
                    Alterar
                </Button>
            </DialogActions>
        </Dialog >
    );
}