import React from "react";
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Paper from '@material-ui/core/Paper';
import OutlinedInput from "@material-ui/core/OutlinedInput";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Typography from '@material-ui/core/Typography';
import { MuiPickersUtilsProvider, KeyboardDatePicker } from "@material-ui/pickers";
import DateUtils from "@date-io/moment";
import { FormClasses, FormControlLabelClasses } from "../Styles"

const formStyles = makeStyles(FormClasses);
const formControllLabelStyles = makeStyles(FormControlLabelClasses);

/**
 * Gautchi R. Chambe (chambegautchi@gmail.com)
 */
export default function FormStep1({ childToParent, parentData }) {

    const formClasses = formStyles();
    const formControlClasses = formControllLabelStyles();

    const { requiredFields } = parentData;
    const [errors, setErrors] = React.useState(requiredFields);
    const [formFields, setFormFields] = React.useState(parentData.dto);
    const [birthDate, setBirthDate] = React.useState(new Date());

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

    const handleDateChange = (moment, dateAsString) => {
        setBirthDate(moment)
        setFormFields({ ...formFields, birthDate: dateAsString });
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
                            label={<Typography >Nome: </Typography>}
                            labelPlacement="start"
                            classes={formControlClasses}
                            control={<OutlinedInput key="firstName" name="firstName" autoComplete="none" color="primary"
                                onBlur={handleInputValue}
                                onChange={handleInputValue}
                                classes={{ input: formControlClasses.input }}
                                error={errors.firstName}
                                value={formFields.firstName} />}
                        />
                    </ListItem>
                    <ListItem >
                        <FormControlLabel
                            label={<Typography >Apelido: </Typography>}
                            labelPlacement="start"
                            classes={formControlClasses}
                            control={<OutlinedInput key="lastName" name="lastName" autoComplete="none" color="primary"
                                onBlur={handleInputValue}
                                onChange={handleInputValue}
                                classes={{ input: formControlClasses.input }}
                                error={errors.lastName}
                                value={formFields.lastName} />}
                        />
                    </ListItem>


                    <ListItem >
                        <FormControlLabel
                            label={<Typography >Data de nascimento: </Typography>}
                            labelPlacement="start"
                            classes={formControlClasses}
                            control={
                                <MuiPickersUtilsProvider utils={DateUtils}>
                                    <KeyboardDatePicker
                                        autoOk
                                        variant="inline"
                                        inputVariant="outlined"
                                        format="DD/MM/YYYY"
                                        value={birthDate}
                                        InputAdornmentProps={{ position: "end" }}
                                        onChange={(moment, value) => handleDateChange(moment, value)}
                                        InputProps={{ classes: { root: formControlClasses.datePickerInput } }}
                                    />
                                </MuiPickersUtilsProvider>
                            }
                        />
                    </ListItem>

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
                            label={<Typography >BI Numero : </Typography>}
                            labelPlacement="start"
                            classes={formControlClasses}
                            control={<OutlinedInput key="docNumber" name="docNumber" autoComplete="none" color="primary"
                                margin="dense"
                                onBlur={handleInputValue}
                                onChange={handleInputValue}
                                classes={{ input: formControlClasses.inputShort }}
                                error={errors.docNumber}
                                value={formFields.docNumber}
                            />}
                        />
                    </ListItem>

                </List>
            </Paper>
        </>
    );
}
