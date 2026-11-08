import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Paper from '@material-ui/core/Paper';
import OutlinedInput from "@material-ui/core/OutlinedInput";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Typography from '@material-ui/core/Typography';
import { FormClasses, FormControlLabelClasses } from "../Styles"

const formStyles = makeStyles(FormClasses);
const formControllLabelStyles = makeStyles(FormControlLabelClasses);

/**
 * Gautchi R. Chambe (chambegautchi@gmail.com)
 */
export default function FormStep1({ childToParent, parentData }) {

    const formClasses = formStyles();
    const formControlClasses = formControllLabelStyles();

    const requiredFields = parentData.requiredFields;
    const [errors, setErrors] = React.useState(requiredFields);
    const [formFields, setFormFields] = React.useState(parentData.dto);

    const handleInputValueWithDateType = (e, dateType) => {
        if (dateType === "number") {
            e.target.value = e.target.value.replace(/[^0-9]/g, '');
        }
        handleInputValue(e);
    };

    const handleInputValue = (e) => {
        let { name, value } = e.target;
        setFormFields({ ...formFields, [name]: value, state: 1 });
        validateForm();
    };

    /** Validate data form and update to parent Data object */
    const validateForm = (fieldValues = formFields) => {
        /*---Validade steper fields -------------*/
        let tempErrors = {};
        requiredFields.forEach(field => {
            if (field in fieldValues)
                if (!fieldValues[field]) {
                    tempErrors[field] = "Campo " + field + " obrigatorio";
                }
        });
        setErrors({ ...tempErrors });
        /*-------------------------------------------*/
        /*----Update parent Data -----------*/
        let childData = { dto: fieldValues, errors: tempErrors };
        childToParent(childData);
        /*------------------------------------*/
    }

    return (
        <>
            <Paper className={formClasses.paper}>
                <List className={formClasses.root}>

                    <ListItem >
                        <FormControlLabel
                            label={<Typography >Nuit : </Typography>}
                            labelPlacement="start"
                            classes={formControlClasses}
                            control={<OutlinedInput key="nuit" name="nuit" autoComplete="none" color="primary"
                                dateType="number"
                                margin="dense"
                                onBlur={(e) => handleInputValueWithDateType(e, "number")}
                                onChange={(e) => handleInputValueWithDateType(e, "number")}
                                classes={{ input: formControlClasses.inputShort }}
                                inputProps={{ maxLength: 9 }}
                                error={errors.nuit}
                                value={formFields.nuit}
                            />}
                        />
                    </ListItem>
                    <ListItem >

                        <FormControlLabel
                            label={<Typography >Nome: </Typography>}
                            labelPlacement="start"
                            classes={formControlClasses}
                            control={<OutlinedInput key="name" name="name" autoComplete="none" color="primary"
                                onBlur={handleInputValue}
                                onChange={handleInputValue}
                                classes={{ input: formControlClasses.input }}
                                error={errors.name}
                                value={formFields.name} />}
                        />
                    </ListItem>

                    <ListItem >
                        <FormControlLabel
                            label={<Typography >Email: </Typography>}
                            labelPlacement="start"
                            classes={formControlClasses}
                            control={<OutlinedInput key="email" name="email" autoComplete="none" color="primary"
                                onBlur={handleInputValue}
                                onChange={handleInputValue}
                                classes={{ input: formControlClasses.input }}
                                error={errors.email}
                                value={formFields.email} />}
                        />
                    </ListItem>


                    <ListItem >
                        <FormControlLabel
                            label={<Typography >Endereço: </Typography>}
                            labelPlacement="start"
                            classes={formControlClasses}
                            control={<OutlinedInput key="address" name="address" autoComplete="none" color="primary"
                                multiline
                                rows={3}
                                onBlur={handleInputValue}
                                onChange={handleInputValue}
                                classes={{ multiline: formControlClasses.input }}
                                error={errors.address}
                                value={formFields.address} />}
                        />
                    </ListItem>



                    <ListItem >
                        <FormControlLabel
                            label={<Typography >Telefone1: </Typography>}
                            labelPlacement="start"
                            classes={formControlClasses}
                            control={
                                <OutlinedInput id="cellphone1"
                                    name="cellphone1" autoComplete="none" color="primary"
                                    margin="dense"
                                    classes={{ root: formControlClasses.inputShort }}
                                    onBlur={handleInputValue}
                                    onChange={handleInputValue}
                                    error={errors.cellphone1}
                                    value={formFields.cellphone1}
                                />
                            }
                        />
                    </ListItem>

                    <ListItem >
                        <FormControlLabel
                            label={<Typography >Telefone2: </Typography>}
                            labelPlacement="start"
                            classes={formControlClasses}
                            control={
                                <OutlinedInput id="cellphone2"
                                    name="cellphone2" autoComplete="none" color="primary"
                                    margin="dense"
                                    classes={formControlClasses.input}
                                    onBlur={handleInputValue}
                                    onChange={handleInputValue}
                                    classes={{ root: formControlClasses.inputShort }}
                                    error={errors.cellphone2}
                                    value={formFields.cellphone2}
                                />
                            }
                        />
                    </ListItem>


                    <ListItem >
                        <FormControlLabel
                            label={<Typography >Telefone3: </Typography>}
                            labelPlacement="start"
                            classes={formControlClasses}
                            control={
                                <OutlinedInput id="cellphone3"
                                    name="cellphone3" autoComplete="none" color="primary"
                                    margin="dense"
                                    classes={formControlClasses.input}
                                    onBlur={handleInputValue}
                                    onChange={handleInputValue}
                                    classes={{ root: formControlClasses.inputShort }}
                                    error={errors.cellphone3}
                                    value={formFields.cellphone3}
                                />
                            }
                        />
                    </ListItem>

                </List>
            </Paper>
        </>
    );
}
