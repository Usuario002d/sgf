import React from "react";
// @material-ui/core components
import { makeStyles } from "@material-ui/core/styles";
// core components
import GridItem from "components/Grid/GridItem.js";
import GridContainer from "components/Grid/GridContainer.js";
import Card from "components/Card/Card.js";
import CardHeader from "components/Card/CardHeader.js";
import CardBody from "components/Card/CardBody.js";
import FormStep1 from "./FormStep1";
import FormStep2 from "./FormStep2";
import FormStep3 from "./FormStep3";
import FormStep4 from "./FormStep4";

import { FormHeaderClass } from "../Styles"
import { ErrorNotification, SuccessNotification } from "components/Notification/NotificationComponent";

const formStyles = makeStyles(FormHeaderClass);

/**
 * Gautchi R. Chambe (chambegautchi@gmail.com)
 */
export default function Maintain({ childToParent, parentData }) {
  const formClasses = formStyles();

  const { action, activeStep: parentActiveStep } = parentData;
  const title = action === "CREATE" ? "Criar Aluno" : action === "EDIT" ? "Actualizar Aluno" : "Remover Aluno";
  const subtitle = action === "CREATE" ? "Fluxo de Criação de Alunos" : action === "EDIT" ? "Fluxo de Actualização de Alunos" : "Fluxo de Remoção de Alunos";

  const stepContent = (step) => {
    switch (step) {
      case 1:
        return <FormStep1 childToParent={childToParent} parentData={parentData} />
      case 2:
        return <FormStep2 childToParent={childToParent} parentData={parentData} />
      case 3:
        return <FormStep3 childToParent={childToParent} parentData={parentData} />
      case 4:
        return <FormStep4 parentData={parentData} />
      case 5:
        return <FormStep4 parentData={parentData} />
      default:
        return 'Fluxo de Criacao/Actualizao/Remoção invalido';
    }
  }

  return (
    <div>
      <GridContainer>
        <GridItem xs={12} sm={12} md={12}>
          <Card>
            <CardHeader color="primary">
              <h4 className={formClasses.cardTitle}>{title}</h4>
              <p className={formClasses.cardCategory}>{subtitle}</p>
            </CardHeader >
            <CardBody >
              {parentActiveStep === 4 ? SuccessNotification() : ErrorNotification(parentData.errors)}
              {stepContent(parentActiveStep)}
            </CardBody>
          </Card>
        </GridItem>
      </GridContainer>
    </div>
  );
}