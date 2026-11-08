import React from "react";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
// core components
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import CardBody from "components/Card/CardBody.js";
import CreateFormStep1 from "./CreateFormStep1.js";
import CreateFormStep2 from "./CreateFormStep2.js";
import CreateFormStep3 from "./CreateFormStep3.js";
import { FormHeaderClass } from "../Styles.js"
import { ErrorNotification, SuccessNotification } from "components/Notification/NotificationComponent";

const useStyles = makeStyles(FormHeaderClass);

export default function Create({childToParent, step, parentData }) {
  const classes = useStyles();
  const stepContent = (step) => {
    switch (step) {
      case 1:
        return <CreateFormStep1 childToParent={childToParent} parentData={parentData} />
      case 2:
        return <CreateFormStep2 childToParent={childToParent} parentData={parentData} />
      case 3:
        return <CreateFormStep3  parentData={parentData} />
        case 4:
          return <CreateFormStep3  parentData={parentData} />
      default:
        return 'Fluxo de Criacao/Actualizao invalido';
    }
  }

  return (
    <div>
      <GridContainer>
        <GridItem xs={12} sm={12} md={12}>
          <Card>
            <CardHeader color="primary">
              <h4 className={classes.cardTitle}>Criar Educandos</h4>
              <p className={classes.cardCategory}>Fluxo de Criação de Educandos</p>
            </CardHeader>
            <CardBody >
              {step === 4 ? SuccessNotification() : ErrorNotification(parentData.errors)}
              {stepContent(step)}
            </CardBody>
          </Card>
        </GridItem>
      </GridContainer>
    </div>
  );
}