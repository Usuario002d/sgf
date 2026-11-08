import React from "react";
// @material-ui/compnents
import Button from '@material-ui/core/Button';
import SteperFlowComponent from "components/StepComponent/SteperFlowComponent"

//Forms steppers
import Maintain from "./Maintain/Index";
import Settings from "./Settings";
import { makeStyles } from '@material-ui/core/styles';
import { FormClasses } from "./Styles"
import { hasAnyValidFieldValue, hasRequiredData } from "utilities/ObjectUtility.js"
const formStyles = makeStyles(FormClasses);

const getSteps = () => { return ['Manter', 'Criar/Actualizar - Passo1', 'Criar/Actualizar - Passo2', 'Confirmar']; }

const getRequeredFields = (step) => {
  switch (step) {
    case 1: return []
    case 2: return []
    default: return [];
  }
}

/**
 * Gautchi R. Chambe (chambegautchi@gmail.com)
 */
export default function IndexUser() {
  const formClasses = formStyles();
  const steps = getSteps();

  const [activeStep, setActiveStep] = React.useState(0);
  const [usersData, setUsersData] = React.useState([]);
  const [userData, setUserData] = React.useState({});
  const [errors, setErrors] = React.useState({});
  const [action, setAction] = React.useState("CREATE");


  /*FormDate to be created on steps as childDate*/
  const createChildDateToParent = (childdata) => {
    setUserData(childdata.userDate);
    setErrors(childdata.errors);
  }

  /*FormDate to be updated/edit on steps as childDate*/
  const editChildDateToParent = (childdata) => {
    setUserData(childdata.userDate);
    setAction(childdata.action);
    setActiveStep(childdata.step);
    handleNext();
  }

  const stepContent = (step) => {
    const requiredFields = getRequeredFields(step);
    switch (step) {
      case 0:
        return <Settings childToParent={editChildDateToParent} parentData={{ activeStep, usersData }} />;
      case 1:
        return <Maintain childToParent={createChildDateToParent} parentData={{ activeStep, userData, requiredFields, errors, action }} />;
      case 2:
        return <Maintain childToParent={createChildDateToParent} parentData={{ activeStep, userData, requiredFields, errors, action }} />;
      case 3:
        return <Maintain parentData={{ activeStep, userData, requiredFields, errors, action }} />;
      case 4:
        return <Maintain parentData={{ activeStep, userData, action }} />;

      default:
        return 'Fluxo de manutencao de usuario invalido';
    }
  }

  const handleReset = () => {
    setActiveStep(0);
    setUserData({});
    setErrors({})
    setAction("CREATE");
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
    if (activeStep === 1) { handleReset() };
  };

  const handleNext = () => {
    /*--------- Validate all step except settings step=0 -------*/
    if (activeStep !== 0) {
      const requiredFields = getRequeredFields(activeStep);
      if (!hasRequiredData(userData, requiredFields)) {
        let dataFields = Object.keys(userData);
        setErrors(["Preencha os campos obrigatorios: " +
          Object.values(requiredFields).filter(field => !dataFields.includes(field)).join()]);
        return;
      }
      let hasErrors = hasAnyValidFieldValue(errors);
      if (hasErrors) {
        return;
      }
    }
    /*---------------------------------------------------*/

    /**------- Execute (CREATE/EDIT/REMOVE) submit data on backend-------------**/
    if (activeStep === 2) {

      if (action === "CREATE") {
        let tempUser = userData;
        tempUser.id = usersData.length + 1;
        usersData.push(tempUser);
        resteAction();
        console.log("New user added", tempUser);
      }
      if (action === "EDIT") {
        usersData.map((value, index) => {
          if (value.id === userData.id) {
            usersData[index] = userData
          }
        });
        resteAction();
        console.log("User edited", userData);
      }

      if (action === "REMOVE") {
        usersData.pop(userData);
        resteAction();
        console.log("User removed", userData);
      }
      // console.log("Is array: " + Array.isArray(errors));
    }
    /**------------------------------------------------------------------------**/
    /*----------------------------- Forward next step --------------------------*/
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
    /**------------------------------------------------------------------------ */
  };

  const resteAction = () => {
    setAction("CREATE");
  }

  return (
    <div className={formClasses.root}>
      <div>
        <div>
          {stepContent(activeStep)}
          <div>
            {(activeStep !== 0) && (activeStep !== steps.length) && (action !== "REMOVER" || action !== "RESTORE") ?
              <>
                <Button variant="contained"
                  onClick={handleBack} className={formClasses.button}>
                  Voltar
                </Button>
              </>
              : <></>
            }
            <Button
              variant="contained" className={formClasses.button}
              onClick={activeStep !== steps.length ? handleNext : handleReset}
            >
              {activeStep === steps.length ? "Novo fluxo" : activeStep === 0 ? 'Adicionar Novo' : activeStep === steps.length - 1 ? 'Confirmar' : 'Proximo'}
            </Button>

            {(activeStep !== 0) && (activeStep !== steps.length) ?
              <>
                <Button variant="contained"
                  onClick={handleReset} className={formClasses.button}>
                  Cancelar
              </Button>
              </>
              : <></>
            }
          </div>
        </div>
      </div>
    </div>
  );
}