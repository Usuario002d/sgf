import React from "react";
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Paper from '@material-ui/core/Paper';
import TableComponent from "components/Table/TableComponent";
import Button from '@material-ui/core/Button';
import ViewAcademicYearComponent from "../../component/ViewAcademicYear"
import AddClassSubject from "./AddSubjects";

import { configTableDummyDate } from "variables/generalTestDummyData.js";

import { FormClasses, FormControlLabelClasses } from "../../Styles"

const formStyles = makeStyles(FormClasses);
const formControllLabelStyles = makeStyles(FormControlLabelClasses);

const tableColumns = [
    { name: "academicLevel.description", label: 'Classes', minWidth: 140 },
    { name: 'subjects', label: 'Disciplinas', type: "array", minWidth: 120 },
    { name: 'state', label: 'Estado', minWidth: 100, align: 'right', size: "small" },
    { name: 'action', label: 'Acções', minWidth: 100, align: 'right', size: "small" },
];

/**
 * Gautchi R. Chambe (chambegautchi@gmail.com)
 */
export default function MaintainSubject({ childToParent, parentData }) {

    const formClasses = formStyles();
    const formControlClasses = formControllLabelStyles();
    const [academicSubjects, setAcademicSubjects] = React.useState([]);
    const [academicLevels, setAcademicLevels] = React.useState([]);
    const [academicLevelsSubjects, setAcademicLevelsSubjects] = React.useState([]);
    const [controllState, setControllState] = React.useState(0);
    const [open, setOpen] = React.useState(false);

    React.useEffect(() => {
        if (controllState === 0) {
            setAcademicSubjects(configTableDummyDate.filter(field => field.type === "academicSubject"));
            setAcademicLevels(configTableDummyDate.filter(field => field.type === "academicLevel"));
            setAcademicLevelsSubjects([])
            console.log("Maintain fiscalYear: maintain subjects");
            console.log("Control useEffect to run once academicLevelsSubjects", academicLevelsSubjects);
        }
    }, [controllState]);

    const handleClose = () => {
        setOpen(false);
    };

    const handleAddClasses = (e) => {
        setOpen(true);
    };

    const addAcademicLevel = (childDTO) => {
        academicLevelsSubjects.push(childDTO);
    };

    const handleReset = () => {
        // onClickCancel();
        // setActiveStepButtons(true);
    };

    return (
        <>
            <Paper className={formClasses.paper}>
                <List className={formClasses.root}>

                    <ListItem >
                        <ViewAcademicYearComponent academicYearDTO={parentData.dto} />
                    </ListItem>

                    <ListItem style={{ height: 500, marginTop: 10 }} >
                        <div style={{ border: "1px solid black" }}>
                            <div  >
                                <div style={{ height: 450 }}>
                                    <h4 style={{ width: 230, marginTop: -12, marginLeft: 8, background: "white" }}>
                                        Classes do ano lectivo {parentData.dto.year}</h4>
                                    <TableComponent
                                        columns={tableColumns}
                                        rows={academicLevelsSubjects}
                                        rowsPerPage={4}
                                    />
                                </div>
                                <div style={{ float: "right", marginTop: 10, marginBottom: 10 }}>
                                    <Button variant="contained"
                                        onClick={handleAddClasses}
                                        className={formClasses.button}>
                                        adicionar novo
                                 </Button>
                                </div>
                            </div>
                        </div>
                    </ListItem>

                    <ListItem>
                        <AddClassSubject
                            show={open}
                            handleClose={handleClose}
                            parentData={{ ...parentData, academicLevels: academicLevels, academicSubjects: academicSubjects }}
                            childToParent={addAcademicLevel}
                        />
                    </ListItem>
                </List>
            </Paper>

            <div style={{ marginTop: 10 }}>
                <Button variant="contained"
                    onClick={handleReset} className={formClasses.button}>
                    Cancelar
                         </Button>

                <Button variant="contained"
                    onClick={handleAddClasses}
                    className={formClasses.button}>
                    Proximo
                        </Button>
            </div>
        </>
    );
}