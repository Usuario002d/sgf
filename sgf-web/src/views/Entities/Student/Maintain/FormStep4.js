import React from "react";
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Paper from '@material-ui/core/Paper';
import FormControlLabel from "@material-ui/core/FormControlLabel";
import Typography from '@material-ui/core/Typography';
import TableComponent from "components/Table/TableComponent";
import FormGroup from "@material-ui/core/FormGroup";
import FormLabel from "@material-ui/core/FormLabel";
import Box from "@material-ui/core/Box";
import { FormClasses, FormControlLabelClasses } from "../Styles"

const formStyles = makeStyles(FormClasses);
const formControllLabelStyles = makeStyles(FormControlLabelClasses);

const tableColumns = [
    { name: 'code', label: 'Codigo', minWidth: 80 },
    { name: 'fullName', label: 'Nome completo', minWidth: 140 },
    { name: 'fullName', label: 'Grau de parentesco', minWidth: 120 },
    { name: 'email', label: 'email', minWidth: 200 },
    { name: 'state', label: 'Estado', minWidth: 100, align: 'right', size: "small" },
];

/**
 * Gautchi R. Chambe (chambegautchi@gmail.com)
 */
export default function FormStep4({ parentData }) {
    const formClasses = formStyles();
    const formControlClasses = formControllLabelStyles();

    return (
        <>
            <Paper className={formClasses.paper}>
                <List className={formClasses.root}>

                    <ListItem style={{ height: 150 }} >
                        <Box display="flex" alignItems="center"
                            borderTop={1} borderColor="gray"
                            borderBottom={1} border={1} width={800} height={150}
                        >
                            <FormGroup classes={formControlClasses}>
                                {parentData.dto.id ?
                                    <FormControlLabel
                                        label={<Typography >Codigo do aluno: </Typography>}
                                        labelPlacement="start"
                                        classes={formControlClasses}
                                        control={
                                            <FormLabel classes={{ root: formControlClasses.label }} >{parentData.dto.code}</FormLabel>
                                        }
                                    /> : <></>
                                }
                                <FormControlLabel
                                    label={<Typography >Nome completo do aluno: </Typography>}
                                    labelPlacement="start"
                                    classes={formControlClasses}
                                    control={
                                        <FormLabel classes={{ root: formControlClasses.label }} >{parentData.dto.fullName}</FormLabel>
                                    }
                                />
                                <FormControlLabel
                                    label={<Typography >Data de nascimento: </Typography>}
                                    labelPlacement="start"
                                    classes={formControlClasses}
                                    control={
                                        <FormLabel classes={{ root: formControlClasses.label }} >{parentData.dto.birthDate}</FormLabel>
                                    }
                                />
                                <FormControlLabel
                                    label={<Typography >Tipo de documento: </Typography>}
                                    labelPlacement="start"
                                    classes={formControlClasses}
                                    control={
                                        <FormLabel classes={{ root: formControlClasses.label }} >{parentData.dto.email}</FormLabel>
                                    }
                                />
                                <FormControlLabel
                                    label={<Typography >Numero do documento: </Typography>}
                                    labelPlacement="start"
                                    classes={formControlClasses}
                                    control={
                                        <FormLabel classes={{ root: formControlClasses.label }} >{parentData.dto.email}</FormLabel>
                                    }
                                />
                            </FormGroup>
                        </Box>
                    </ListItem>

                    <ListItem style={{ height: 300 }} >
                        <div style={{ border: "1px solid black", width: 1200, height: 250 }}>
                            <h4 style={{ width: 200, marginTop: -12, marginLeft: 8, background: "white" }}>
                                Lista de encarregados</h4>
                            <TableComponent
                                columns={tableColumns}
                                rows={parentData.dto.sponsors}
                                rowsPerPage={2}
                            />
                        </div>
                    </ListItem>
                </List>

            </Paper>
        </>
    );
}