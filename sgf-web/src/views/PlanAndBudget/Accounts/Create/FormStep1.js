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
                            label={<Typography >Ano Lectivo : </Typography>}
                            labelPlacement="start"
                            classes={formControlClasses}
                            control={<OutlinedInput key="year" name="year" autoComplete="none" color="primary"
                                dateType="number"
                                margin="dense"
                                onBlur={(e) => handleInputValueWithDateType(e, "number")}
                                onChange={(e) => handleInputValueWithDateType(e, "number")}
                                classes={{ input: formControlClasses.inputShort }}
                                inputProps={{ minLength: 4, maxLength: 4 }}
                                error={errors.year}
                                value={formFields.year}
                            />}
                        />
                    </ListItem>
                    <ListItem >
                        <FormControlLabel
                            label={<Typography >Descrição : </Typography>}
                            labelPlacement="start"
                            classes={formControlClasses}
                            control={<OutlinedInput key="description" name="description" autoComplete="none" color="primary"
                                classes={{ input: formControlClasses.input }}
                                error={errors.description}
                                disabled
                                value={"Ano Lectivo " + formFields.year} />}
                        />
                    </ListItem>
                </List>
            </Paper>
        </>
    );
}
