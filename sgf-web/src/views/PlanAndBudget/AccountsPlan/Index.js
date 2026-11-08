import React from "react";
import Button from '@material-ui/core/Button';
import Settings from "./Settings";

import { makeStyles } from '@material-ui/core/styles';
import { FormClasses } from "./Styles";
import { accountPlanDummyData } from "variables/generalTestDummyData.js";

const formStyles = makeStyles(FormClasses);

const getSteps = () => { return ['Manter', 'Criar/Actualizar', 'Criar/Actualizar', 'Confirmar']; }

const getRequeredFields = (step) => {
  switch (step) {
    case 1: return ['year']
    case 2: return []
    default: return [];
  }
}

/**
 * Gautchi R. Chambe (chambegautchi@gmail.com)
 */
export default function Index() {
  const formClasses = formStyles();
  const steps = getSteps();

  const currentDate = new Date();

  const [isStepButtonsEnabled, setActiveStepButtons] = React.useState(true);
  const [activeStep, setActiveStep] = React.useState(0);
  const [account, setAccount] = React.useState({});
  const [accounts, setAccounts] = React.useState([]);
  const [errors, setErrors] = React.useState({});
  const [action, setAction] = React.useState("CREATE");
  const [controllState, setControllState] = React.useState(0);

  const title = "Plano Orçamental";
  const subtitle = "Fluxo de Manuntenção do Plano Orçamentals";

  React.useEffect(() => {
    if (controllState === 0) {
      setAccounts(accountPlanDummyData)
      console.log("Control useEffect to run once", accountPlanDummyData);
      console.log("Control useEffect to run once accounts", accounts);
      setControllState(1);
    }
  }, [controllState]);


  /*FormDate to be updated/edit on steps as childDate*/
  const editChildDateToParent = (childdata) => {
    setAccounts(childdata.dtos)
    setAccount(childdata.dto)
    setAction(childdata.action);

    console.log("updated budject", childdata.dtos);


    if (action === "STOP" || action === "CREATE") {
      setActiveStep(0);
      setControllState(0);
      return;
    } else {
      setActiveStep(2);
      handleNext();
    }
  }

  const stepContent = (step) => {
    const requiredFields = getRequeredFields(step);
    switch (step) {
      case 0:
        return <Settings
          editChildDateToParent={editChildDateToParent}
          parentData={{ title: title, subtitle: subtitle, activeStep: activeStep, dtos: accounts }} />;
      /*  
            case 1:
            return <Create
              parentData={{ title: title, subtitle: subtitle, dtos: accounts }}
              onClickCancel={handleReset}
              setActiveStepButtons={setActiveStepButtons}
            />
          case 2:
            return <Maintain childToParent={createChildDateToParent}
              parentData={{ activeStep, dto: account, requiredFields, errors, action }}
              onClickCancel={handleReset}
              setActiveStepButtons={setActiveStepButtons} />;
    
          case 3:
            return <Maintain parentData={{ activeStep, dto: account, requiredFields, errors, action }}
              onClickCancel={handleReset}
              setActiveStepButtons={setActiveStepButtons} />;
          case 4:
            return <Maintain parentData={{ activeStep, dto: account, action }}
              onClickCancel={handleReset}
              setActiveStepButtons={setActiveStepButtons} />;
    */
      default:
        return 'Fluxo de manutencao da conta invalido';
    }
  }

  const handleReset = () => {
    setActiveStep(0);
    setErrors({})
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
    if (activeStep === 1) { handleReset() };
  };

  const handleNext = () => {

    /**------- Execute (CREATE/EDIT/REMOVE/VIEW) submit data on backend-------------**/
    if (activeStep === 3) {

      if (action === "EDIT") {
        accounts.map((value, index) => {
          if (value.id === account.id) {
            accounts[index] = account
          }
        });
        resteAction();
        console.log("User edited", account);
      }

      if (action === "REMOVE") {
        accounts.pop(account);
        resteAction();
        console.log("User removed", account);
      }
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

      {stepContent(activeStep)}
      {isStepButtonsEnabled ?
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
          {/* <Button
            variant="contained" className={formClasses.button}
            onClick={activeStep !== steps.length ? handleNext : handleReset}
          >
            {activeStep === steps.length ? "Novo fluxo" :
              activeStep === 0 ? 'Adicionar Novo' :
                activeStep === steps.length - 1 ? 'Confirmar' :
                  'Proximo'}
          </Button> */}

          {(activeStep !== 0) && (activeStep !== steps.length) ?
            <>
              <Button variant="contained"
                onClick={handleReset} className={formClasses.button}>
                Cancelar
              </Button>
            </>
            : <></>
          }
        </div> : <></>
      }
    </div>
  );
}