import React from "react";

// compnents
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import CardBody from "components/Card/CardBody.js";
import { makeStyles } from "@material-ui/core/styles";
import { FormHeaderClass } from "./Styles"
import AccountPlanTableComponent from "./AccountPlanTableComponent";
import AddBudject from "../Maintain/Entry/AddBudject";

const useFormHeaderStyles = makeStyles(FormHeaderClass);

/**
 * Settings Components
 * 
 * Gautchi R. Chambe (chambegautchi@gmail.com)
 */
export default function SettingsComponent({ editChildDateToParent, parentData }) {
  const headerClasses = useFormHeaderStyles();
  const { title, subtitle, tableColumns, tableRows, activeStep } = parentData;
  const [rows, setRows] = React.useState([]);
  const [selectedRow, setSelectedRow] = React.useState([]);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    setRows(tableRows)
  }, [tableRows]);

  const handleOnClickEdit = (value, row, rows) => {
    setSelectedRow(row);
    setOpen(true);
  };

  const handleOnClickRemove = (index, row) => {
    /*------- Update parent Data -----------*/
   
   /* let firstParentStepForRemoveForm = activeStep + 1;
    let childData = { dto: row, step: firstParentStepForRemoveForm, action: "REMOVE" };
    editChildDateToParent(childData);
    console.log("Remove row data", childData);
    */
    /*----------------------------------------*/
  };

  const handleOnClickRestore = (index, row) => {
    /*------- Update parent Data -----------*/
    /*
    let firstParentStepForRestorForm = activeStep + 1;
    let childData = { dto: row, step: firstParentStepForRestorForm, action: "ACTIVE" };
    editChildDateToParent(childData);
    console.log("Restore row data", childData);
    */
    /*----------------------------------------*/
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <GridContainer>
      <GridItem xs={12} sm={12} md={12}>
        <Card>
          <CardHeader color="primary">
            <h4 className={headerClasses.cardTitle}>{title}</h4>
            <p className={headerClasses.cardCategory}>{subtitle}</p>
          </CardHeader>
          <CardBody>
            <AccountPlanTableComponent
              columns={tableColumns}
              rows={rows}
              handleOnClickEdit={handleOnClickEdit}
              handleOnClickRemove={handleOnClickRemove}
              handleOnClickRestore={handleOnClickRestore}
            />
            <AddBudject
              show={open}
              handleClose={handleClose}
              accountPlan={selectedRow}
              accountPlans={rows}
              childToParent={editChildDateToParent}
            />
          </CardBody>
        </Card>
      </GridItem>
    </GridContainer >
  );
}