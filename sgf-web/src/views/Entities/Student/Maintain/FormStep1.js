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

    const { requiredFields, documentsTypes } = parentData;
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
                <div className={formClasses.divPaper}>
                    <h4 className={formClasses.paperTitle}>Infome os dados do aluno</h4>
                    <List className={formClasses.root}>
                        <ListItem >
                            <FormControlLabel
                                label={<Typography >Nome completo: </Typography>}
                                labelPlacement="start"
                                classes={formControlClasses}
                                control={<OutlinedInput key="fullName" name="fullName" autoComplete="none" color="primary"
                                    onBlur={handleInputValue}
                                    onChange={handleInputValue}
                                    classes={{ input: formControlClasses.input }}
                                    error={errors.fullName}
                                    value={formFields.fullName} />}
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
                                label={<Typography >Tipo de Documento: </Typography>}
                                labelPlacement="start"
                                classes={formControlClasses}
                                control={
                                    <SelectField
                                        variant="outlined"
                                        name="academicLevel"
                                        onChange={(e) => handleInputValue(e)}
                                        classes={{ root: formControlClasses.selectFieldLarge }}
                                        value={formFields.academicLevel}
                                    >
                                        {documentsTypes.map((value, index) => {
                                            return < MenuItem value={value} > {value.description}</MenuItem>
                                        }
                                        )}
                                    </SelectField>
                                }
                            />
                        </ListItem>

                        <ListItem >
                            <FormControlLabel
                                label={<Typography >Numero do documento : </Typography>}
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

                        <ListItem >
                            <FormControlLabel
                                label={<Typography >Telefone1: </Typography>}
                                labelPlacement="start"
                                classes={formControlClasses}
                                control={
                                    <OutlinedInput key="cellphone1"
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



                    </List>
                </div>
            </Paper>
        </>
    );
}