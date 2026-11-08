import React from "react";
import { makeStyles } from '@material-ui/core/styles';
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Typography from '@material-ui/core/Typography';
import FormGroup from "@material-ui/core/FormGroup";
import FormLabel from "@material-ui/core/FormLabel";
import Box from "@material-ui/core/Box";
import { FormControlLabelClasses } from "./Styles";

const formControllLabelStyles = makeStyles(FormControlLabelClasses);

/**
 * Gautchi R. Chambe (chambegautchi@gmail.com)
 */
export default function ViewAcademicYear({ academicYearDTO }) {

    const formControlClasses = formControllLabelStyles();

    return (
        <Box display="flex" alignItems="center"
            borderTop={1} borderColor="gray"
            borderBottom={1} border={1} width={800} height={80}
        >
            <FormGroup classes={formControlClasses}>
                <FormControlLabel
                    label={<Typography >Ano lectivo: </Typography>}
                    labelPlacement="start"
                    classes={formControlClasses}
                    control={
                        <FormLabel classes={{ root: formControlClasses.label }} >{academicYearDTO.year}</FormLabel>
                    }
                />
                <FormControlLabel
                    label={<Typography >Descrição : </Typography>}
                    labelPlacement="start"
                    classes={formControlClasses}
                    control={
                        <FormLabel classes={{ root: formControlClasses.label }} >{academicYearDTO.description}</FormLabel>
                    }
                />
            </FormGroup>
        </Box>
    );
}