import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Paper from '@material-ui/core/Paper';
import TableComponent from "components/Table/TableComponent";
import Button from '@material-ui/core/Button';
import AddClassSubject from "./AddSubjects";

import { configTableDummyDate } from "variables/generalTestDummyData.js";

import { FormClasses, FormControlLabelClasses } from "../../Styles"

const formStyles = makeStyles(FormClasses);
const formControllLabelStyles = makeStyles(FormControlLabelClasses);

const tableColumns = [
    { name: "academicLevel.description", label: 'Classes', minWidth: 140 },
    { name: 'subjects', label: 'Disciplinas', type: "array", minWidth: 120 },
    { name: 'state', label: 'Estado', minWidth: 100, align: 'right', size: "small" },
];

/**
 * Gautchi R. Chambe (chambegautchi@gmail.com)
 */
export default function FormStep2({ childToParent, parentData }) {

    const formClasses = formStyles();
    const { academicLevelsSubjects, academicLevels, academicSubjects, academicYear } = parentData; 

    return (
        <>
            <Paper className={formClasses.paper}>
                <List className={formClasses.root}>
                    <ListItem style={{ height: 500, marginTop: 10 }} >
                        <div style={{ border: "1px solid black" }}>
                            <div  >
                                <div style={{ height: 450 }}>
                                    <h4 style={{ width: 230, marginTop: -12, marginLeft: 8, background: "white" }}>
                                        Classes do ano lectivo {academicYear.year}</h4>
                                    <TableComponent
                                        columns={tableColumns}
                                        rows={academicLevelsSubjects}
                                        rowsPerPage={4}
                                    />
                                </div>
                            </div>
                        </div>
                    </ListItem>
                </List>
            </Paper>
        </>
    );
}
